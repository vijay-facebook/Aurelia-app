import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { defaultConfig } from './src/config/defaultConfig';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'aurelia-secure-secret-key';

// Data directories
const DATA_DIR = path.resolve(process.cwd(), 'data');
const BACKUPS_DIR = path.resolve(process.cwd(), 'data', 'backups');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

[DATA_DIR, BACKUPS_DIR, UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const CONFIG_FILE = path.join(DATA_DIR, 'site-config.json');

const getConfigPath = (salon?: string) => {
  if (salon) {
    return path.join(DATA_DIR, `salon-${salon}.json`);
  }
  return CONFIG_FILE;
};

// Initialize config file if not exists
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), 'utf-8');
}

// Security & Parsers
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser(SESSION_SECRET));

// Static files
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/public', express.static(path.resolve(process.cwd(), 'public')));
app.use(express.static(path.resolve(process.cwd(), 'public'))); // For demo assets

// Simple in-memory session store for admin tokens
const activeSessions = new Set<string>();

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies?.aurelia_admin_token || req.headers['authorization']?.replace('Bearer ', '');
  if (token && activeSessions.has(token)) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Admin login required.' });
};

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max for videos/images
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'video/mp4', 'video/webm'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and MP4/WebM videos are allowed.'));
    }
  },
});

// --- API Endpoints ---

// 1. Get Config (Public)
app.get('/api/config', (req, res) => {
  try {
    const salon = req.query.salon as string;
    const configFile = getConfigPath(salon);
    if (!fs.existsSync(configFile)) {
      // If it doesn't exist, return default, but don't create it automatically unless it's the main one
      return res.json(defaultConfig);
    }
    const raw = fs.readFileSync(configFile, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err: any) {
    console.error('Error reading config:', err);
    res.status(500).json({ error: 'Failed to read site configuration' });
  }
});

// 2. Update Config (Admin Only)
app.put('/api/config', requireAdmin, (req, res) => {
  try {
    const newConfig = req.body;
    if (!newConfig || typeof newConfig !== 'object') {
      return res.status(400).json({ error: 'Invalid configuration payload' });
    }

    const salon = newConfig.brand?.customSlug;
    const configFile = getConfigPath(salon);

    // Create backup before writing
    if (fs.existsSync(configFile)) {
      const backupName = `config-${salon || 'main'}-${Date.now()}.json`;
      const backupPath = path.join(BACKUPS_DIR, backupName);
      fs.copyFileSync(configFile, backupPath);

      // Keep only last 10 backups
      const backups = fs.readdirSync(BACKUPS_DIR).sort();
      while (backups.length > 10) {
        const oldest = backups.shift();
        if (oldest) {
          fs.unlinkSync(path.join(BACKUPS_DIR, oldest));
        }
      }
    }

    // Atomic write
    const tempFile = configFile + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(newConfig, null, 2), 'utf-8');
    fs.renameSync(tempFile, configFile);

    res.json(newConfig);
  } catch (err: any) {
    console.error('Error saving config:', err);
    res.status(500).json({ error: err?.message || 'Failed to save configuration' });
  }
});

// 3. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = 'token-' + Date.now() + '-' + Math.random().toString(36).substring(2);
    activeSessions.add(token);
    res.cookie('aurelia_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ error: 'Incorrect admin password' });
});

// 4. Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const token = req.cookies?.aurelia_admin_token;
  if (token) {
    activeSessions.delete(token);
  }
  res.clearCookie('aurelia_admin_token');
  res.json({ success: true });
});

// 5. Upload File (Admin Only)
app.post('/api/upload', requireAdmin, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err?.message || 'File upload failed' });
  }
});

// 6. Reset Config to Default (Admin Only)
app.post('/api/config/reset', requireAdmin, (req, res) => {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), 'utf-8');
    res.json(defaultConfig);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset configuration' });
  }
});

// 7. Export Config Backup
app.get('/api/config/export', requireAdmin, (req, res) => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      res.download(CONFIG_FILE, `aurelia-config-backup-${Date.now()}.json`);
    } else {
      res.status(404).json({ error: 'Config file not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Export failed' });
  }
});

// 8. Import Config Backup
app.post('/api/config/import', requireAdmin, upload.single('config'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No JSON config file provided' });
    }
    const raw = fs.readFileSync(req.file.path, 'utf-8');
    const parsed = JSON.parse(raw);
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    fs.unlinkSync(req.file.path);
    res.json({ success: true, config: parsed });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid JSON configuration file' });
  }
});

// Serve Vite dev server in development
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, port: Number(port) },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const indexPath = path.resolve(process.cwd(), 'index.html');
      if (fs.existsSync(indexPath)) {
        let template = fs.readFileSync(indexPath, 'utf-8');
        // Inject SEO metadata from config if available
        try {
          const configRaw = fs.readFileSync(CONFIG_FILE, 'utf-8');
          const cfg = JSON.parse(configRaw);
          if (cfg?.seo) {
            template = template.replace(/<title>.*?<\/title>/, `<title>${cfg.seo.title}</title>`);
            template = template.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${cfg.seo.description}">`);
          }
        } catch (e) {}

        template = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      }
      next();
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
} else {
  app.use(express.static('dist'));
  app.use('*', (req, res) => {
    let template = fs.readFileSync(path.resolve(process.cwd(), 'dist', 'index.html'), 'utf-8');
    try {
      const configRaw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const cfg = JSON.parse(configRaw);
      if (cfg?.seo) {
        template = template.replace(/<title>.*?<\/title>/, `<title>${cfg.seo.title}</title>`);
        template = template.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${cfg.seo.description}">`);
      }
    } catch (e) {}
    res.send(template);
  });
}

app.listen(port, () => {
  console.log(`Aurelia White-Label server running on http://localhost:${port}`);
});
