import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { defaultConfig } from './src/config/defaultConfig';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const DEFAULT_PASSWORD = 'admin123';
const DEFAULT_SECRET = 'aurelia-secure-secret-key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || DEFAULT_SECRET;

// A live site must never run with the well-known default credentials.
if (IS_PROD && (ADMIN_PASSWORD === DEFAULT_PASSWORD || SESSION_SECRET === DEFAULT_SECRET)) {
  console.error(
    '\n[SECURITY] Refusing to start in production with the default admin password / session secret.\n' +
      'Set the ADMIN_PASSWORD and SESSION_SECRET environment variables to your own private values and restart.\n'
  );
  process.exit(1);
}
if (!IS_PROD && (ADMIN_PASSWORD === DEFAULT_PASSWORD || SESSION_SECRET === DEFAULT_SECRET)) {
  console.warn('[SECURITY] Using default admin credentials (development only). Change them before going live.');
}

// Behind Render / Railway / Cloud Run / nginx we need the real client IP and protocol.
app.set('trust proxy', 1);

// Persistent data. Set DATA_DIR / UPLOADS_DIR to a mounted disk/volume on hosts that wipe the filesystem on deploy.
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'uploads'));

[DATA_DIR, BACKUPS_DIR, UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const CONFIG_FILE = path.join(DATA_DIR, 'site-config.json');

/* ---------------- helpers ---------------- */

/** Only simple slugs are allowed, so a slug can never escape DATA_DIR (e.g. "../../etc/x"). */
const sanitizeSlug = (slug: unknown): string | null => {
  if (typeof slug !== 'string') return null;
  const clean = slug.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,49}$/.test(clean) ? clean : null;
};

const getConfigPath = (slug?: unknown) => {
  const safe = sanitizeSlug(slug);
  return safe ? path.join(DATA_DIR, `salon-${safe}.json`) : CONFIG_FILE;
};

const isPlainObject = (v: unknown): v is Record<string, any> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

/** Fills anything missing in a saved/imported config from the default template, so older files never crash the site. */
function mergeWithDefaults<T>(base: T, override: any): T {
  if (override === undefined || override === null) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) return override as T;
  const out: Record<string, any> = { ...base };
  for (const key of Object.keys(override)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    out[key] = key in base ? mergeWithDefaults((base as any)[key], override[key]) : override[key];
  }
  return out as T;
}

const looksLikeConfig = (cfg: unknown) =>
  isPlainObject(cfg) && isPlainObject(cfg.brand) && isPlainObject(cfg.hero) && Array.isArray(cfg.services);

const readConfigFile = (file: string) => {
  const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
  return mergeWithDefaults(defaultConfig, parsed);
};

const writeAtomic = (file: string, data: unknown) => {
  const tempFile = file + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, file);
};

const backupFile = (file: string, label: string) => {
  if (!fs.existsSync(file)) return;
  fs.copyFileSync(file, path.join(BACKUPS_DIR, `config-${label}-${Date.now()}.json`));
  // Keep only the newest 10 backups.
  const backups = fs.readdirSync(BACKUPS_DIR).filter((f) => f.endsWith('.json')).sort();
  while (backups.length > 10) {
    const oldest = backups.shift();
    if (oldest) fs.unlinkSync(path.join(BACKUPS_DIR, oldest));
  }
};

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Puts the salon's own SEO text into the HTML so Google / WhatsApp / Facebook previews show the right brand. */
const withSeo = (template: string): string => {
  try {
    const seo = readConfigFile(CONFIG_FILE).seo;
    if (!seo) return template;
    const title = escapeHtml(seo.title);
    const description = escapeHtml(seo.description);
    let html = template
      .replace(/<title>.*?<\/title>/, () => `<title>${title}</title>`)
      .replace(/<meta name="description" content=".*?"\s*\/?>/, () => `<meta name="description" content="${description}" />`)
      .replace(/<meta property="og:title" content=".*?"\s*\/?>/, () => `<meta property="og:title" content="${title}" />`)
      .replace(
        /<meta property="og:description" content=".*?"\s*\/?>/,
        () => `<meta property="og:description" content="${description}" />`
      );
    if (seo.ogImage) {
      html = html.replace('</head>', () => `<meta property="og:image" content="${escapeHtml(seo.ogImage)}" />\n</head>`);
    }
    if (seo.language) {
      html = html.replace(/<html lang=".*?"/, () => `<html lang="${escapeHtml(seo.language)}"`);
    }
    return html;
  } catch {
    return template;
  }
};

// Initialize config file if not exists
if (!fs.existsSync(CONFIG_FILE)) {
  writeAtomic(CONFIG_FILE, defaultConfig);
}

/* ---------------- middleware ---------------- */

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser(SESSION_SECRET));

// Uploaded files: never let an uploaded file (e.g. an SVG) run scripts on our origin.
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'; sandbox");
    next();
  },
  express.static(UPLOADS_DIR)
);
app.use('/public', express.static(path.resolve(process.cwd(), 'public')));
app.use(express.static(path.resolve(process.cwd(), 'public'))); // For demo assets

/* ---------------- admin auth ---------------- */

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const sessions = new Map<string, number>(); // token -> expiry timestamp

const isValidSession = (token?: string) => {
  if (!token) return false;
  const expires = sessions.get(token);
  if (!expires) return false;
  if (expires < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
};

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies?.aurelia_admin_token || req.headers['authorization']?.toString().replace('Bearer ', '');
  if (isValidSession(token)) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Admin login required.' });
};

const safeEqual = (a: string, b: string) => {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
};

// Brute-force protection: max 8 wrong passwords per 15 minutes per IP.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILS = 8;
const loginFails = new Map<string, { count: number; since: number }>();

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max for videos/images
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'video/mp4', 'video/webm'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and MP4/WebM videos are allowed.'));
    }
  },
});

// Config import accepts a small JSON file kept in memory (never written to the public uploads folder).
const importUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

/* ---------------- API ---------------- */

// 1. Get Config (Public)
app.get('/api/config', (req, res) => {
  try {
    const requested = req.query.salon;
    const configFile = requested ? getConfigPath(requested) : CONFIG_FILE;
    if (!fs.existsSync(configFile)) {
      return res.json(defaultConfig);
    }
    res.json(readConfigFile(configFile));
  } catch (err: any) {
    console.error('Error reading config:', err);
    res.status(500).json({ error: 'Failed to read site configuration' });
  }
});

// 2. Update Config (Admin Only)
app.put('/api/config', requireAdmin, (req, res) => {
  try {
    const newConfig = req.body;
    if (!looksLikeConfig(newConfig)) {
      return res.status(400).json({ error: 'Invalid configuration payload' });
    }

    const slug = sanitizeSlug(newConfig.brand?.customSlug);
    if (newConfig.brand?.customSlug && !slug) {
      return res.status(400).json({
        error: 'Link name (slug) may only contain letters, numbers and hyphens, e.g. "my-salon".',
      });
    }

    // The main site (/) is ALWAYS updated, so "Save & Publish" changes what visitors see.
    backupFile(CONFIG_FILE, 'main');
    writeAtomic(CONFIG_FILE, newConfig);

    // Optional shareable copy at /?salon=<slug>
    if (slug) {
      const slugFile = getConfigPath(slug);
      backupFile(slugFile, slug);
      writeAtomic(slugFile, newConfig);
    }

    res.json(newConfig);
  } catch (err: any) {
    console.error('Error saving config:', err);
    res.status(500).json({ error: err?.message || 'Failed to save configuration' });
  }
});

// 3. Admin Login
app.post('/api/admin/login', (req, res) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const record = loginFails.get(ip);
  if (record && now - record.since > LOGIN_WINDOW_MS) loginFails.delete(ip);

  const current = loginFails.get(ip);
  if (current && current.count >= LOGIN_MAX_FAILS) {
    return res.status(429).json({ error: 'Too many failed attempts. Please try again in 15 minutes.' });
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (password && safeEqual(password, ADMIN_PASSWORD)) {
    loginFails.delete(ip);
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, now + SESSION_TTL_MS);
    res.cookie('aurelia_admin_token', token, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'strict',
      maxAge: SESSION_TTL_MS,
    });
    return res.json({ success: true, token });
  }

  loginFails.set(ip, { count: (current?.count ?? 0) + 1, since: current?.since ?? now });
  return res.status(401).json({ error: 'Incorrect admin password' });
});

// 4. Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const token = req.cookies?.aurelia_admin_token;
  if (token) {
    sessions.delete(token);
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
app.post('/api/config/reset', requireAdmin, (_req, res) => {
  try {
    backupFile(CONFIG_FILE, 'before-reset');
    writeAtomic(CONFIG_FILE, defaultConfig);
    res.json(defaultConfig);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset configuration' });
  }
});

// 7. Export Config Backup
app.get('/api/config/export', requireAdmin, (_req, res) => {
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
app.post('/api/config/import', requireAdmin, importUpload.single('config'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No JSON config file provided' });
    }
    const parsed = JSON.parse(req.file.buffer.toString('utf-8'));
    if (!looksLikeConfig(parsed)) {
      return res.status(400).json({ error: 'This file is not a valid site configuration backup.' });
    }
    const merged = mergeWithDefaults(defaultConfig, parsed);
    backupFile(CONFIG_FILE, 'before-import');
    writeAtomic(CONFIG_FILE, merged);
    res.json({ success: true, config: merged });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid JSON configuration file' });
  }
});

// Upload / multer errors -> clean JSON instead of an HTML error page
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && (err.name === 'MulterError' || /Invalid file type/.test(err.message || ''))) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

/* ---------------- frontend ---------------- */

if (!IS_PROD) {
  // Development: Vite dev server with hot reload
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
        let template = withSeo(fs.readFileSync(indexPath, 'utf-8'));
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
  // Production: serve the built site from /dist
  const distDir = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distDir, { index: false }));
  app.use('*', (_req, res) => {
    const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    res.set({ 'Content-Type': 'text/html' }).send(withSeo(template));
  });
}

app.listen(port, () => {
  console.log(`Aurelia White-Label server running on http://localhost:${port}`);
});
