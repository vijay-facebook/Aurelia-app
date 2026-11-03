# Aurelia White-Label Salon Website + Admin CMS

A luxury salon website that any business owner can fully customize from a password-protected **Admin Panel (`/admin`)**: no code needed. The design stays fixed; everything else is editable.

Built with React 19, TypeScript, Tailwind CSS v4, Vite and an Express backend.

## What the owner can edit (all in `/admin`)

| Menu item | What it controls |
|---|---|
| **Quick Setup** | Name, tagline, logo, banner image and headline, phone, WhatsApp, email, address, map link, Google title - all on one page |
| Brand & Identity, Announcement Bar, Navigation | Logo, favicon, top bar, menu order and visibility |
| Hero Section | Banner image, headline, buttons, rating badge |
| Contact Details, **Address & Map**, **Opening Hours** | Phone, email, address lines, Google Maps link, at-home service areas, timings per day |
| Services Grid, **Service Menu** | Service cards and the priced menu with categories |
| **Story / About**, Master Artists | Brand story, founder, numbers, team members |
| **Gallery**, **Video Gallery** | Photos (upload/URL, tile size) and videos (upload MP4/WebM, direct URL or YouTube embed) |
| Session Offers, **At-Home Services** | Offers with codes, home-visit services |
| **Reviews**, **Social & Feed** | Testimonials, social links, feed posts |
| **Booking & WhatsApp** | WhatsApp number, message template, time slots |
| **Sections & Headings** | Show/hide whole sections, edit every heading, scrolling ticker |
| SEO & Metadata | Google/WhatsApp preview title, description, image |

Content is saved to `data/site-config.json` (with automatic backups in `data/backups/`). Uploaded files go to `public/uploads/`. Press **Save & Publish** and the live site updates instantly.

## Run locally

```bash
npm install
cp .env.example .env      # then edit ADMIN_PASSWORD and SESSION_SECRET
npm run dev               # http://localhost:3000   (admin: /admin)
```

## Deploy for a new client (about 30 minutes)

1. **Copy the template**: use "Use this template" on GitHub (or fork) - one copy per client.
2. **Deploy** - pick one:
   - **Render**: New > Blueprint > select the repo (uses `render.yaml`). Type a strong `ADMIN_PASSWORD` when asked. A persistent disk (paid instance) keeps content and uploads safe across redeploys.
   - **Docker / any VPS**: `docker build -t salon . && docker run -p 3000:3000 -e ADMIN_PASSWORD=... -e SESSION_SECRET=... -v salon-data:/app/data -v salon-uploads:/app/public/uploads salon`
   - **Plain Node server**: `npm install && npm run build && npm start` (set `ADMIN_PASSWORD` and `SESSION_SECRET` first).
3. Open `https://your-site/admin`, log in, and work through **Quick Setup**, then the left menu.
4. Click **Save & Publish**, then connect the client's domain in your host's dashboard.

> **Important:** this app stores content in files, so it needs a server that keeps its disk (Render with disk, a VPS, Docker with volumes). It will **not** keep edits on serverless hosts like Vercel or Netlify. If your host erases files on deploy, set `DATA_DIR` and `UPLOADS_DIR` to a mounted persistent disk.

## Security notes

- In production the server **refuses to start** if `ADMIN_PASSWORD` or `SESSION_SECRET` are still the defaults.
- Login is rate-limited (8 wrong attempts per 15 minutes per IP).
- Uploaded files are served with a sandboxing header so an uploaded SVG cannot run scripts.
- Only add real customer reviews and photos you have the right to use.

## Handy commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Builds the website and bundles the server (`server.js`) |
| `npm start` | Runs the production server |
