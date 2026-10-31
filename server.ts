import { GoogleGenAI } from '@google/genai';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Gemini endpoint for Nexora AI Studio Interior & Styling Concierge
app.post('/api/studio-ai', async (req, res) => {
  try {
    const { prompt, spaceType, preferredStyle, budget } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in process.env.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are Nexora Studio's Lead Interior Architect and Design Curator.
Nexora specializes in artisanal luxury furniture, architectural brass lighting, monolithic travertine dining tables, and ceramic artifacts.
Your job is to provide tailored interior styling recommendations, material pairings (Travertine, Solid Oak, Brushed Brass, Smoked Amber Glass, Wabi-Sabi Ceramics, Raw Linen), and spatial lighting layouts.

Nexora's Current Catalog includes:
1. Aurelia Sculptural Lounge Chair ($2,450) - Solid oak, ergonomically carved.
2. Solstice Brushed Brass Pendant ($1,180) - Geometric hand-cast brass fixture.
3. Travertine Monument Dining Table ($3,800) - Honed organic travertine marble slab.
4. Elysian Amber Glass Vessel ($620) - Hand-blown asymmetric vase.
5. Vesper Low-Profile Linen Sofa ($4,200) - Natural tactile Belgian linen.
6. Kuro Matte Black Ceramic Lamp ($890) - Wabi-sabi textured earthenware.
7. Monolith Cast Bronze Candle Pillar ($340) - Architectural brass/bronze accent.
8. Komorebi Hand-Woven Wool Rug ($1,650) - Un-dyed organic wool weave.

Format your output with clear sections:
### Architectural Vibe & Mood
### Material Harmony & Textures
### Recommended Nexora Pieces (Pick 2-3 matching pieces)
### Spatial & Lighting Advice

Be inspiring, articulate, concise, and elegant.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Space Type: ${spaceType || 'Living Room'}\nStyle Preference: ${preferredStyle || 'Artisanal Minimalist'}\nBudget Scope: ${budget || 'Flexible'}\nUser Query/Notes: ${prompt}` }]
        }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error('Gemini API error:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate recommendations.' });
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
    res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Nexora e-commerce server running on http://localhost:${port}`);
});
