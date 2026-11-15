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
cp .env.example .env      # fill in the server-side Supabase variables
npm run dev               # http://localhost:3000   (admin: /admin)
```

## Admin authentication (Supabase)

The Admin Panel uses Supabase Auth for email/password sign-in, password recovery, and password updates. The first administrator is created once from `/admin/signup` using a private setup key. The server refuses first-admin signup after an admin profile exists.

Required server-side environment variables:

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_ANON_KEY`: project publishable/anon key for Auth requests.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service-role secret used only for the first-admin bootstrap. Never expose it in browser code or a `VITE_*` variable.
- `ADMIN_SIGNUP_SECRET`: long, private, one-time bootstrap key. Enter it only in the first-admin signup screen.
- `PUBLIC_APP_URL`: public website origin, without a trailing slash, used for recovery redirects.

Before first-admin signup, apply the migration in `supabase/migrations/202611150001_admin_auth_bootstrap.sql` in the Supabase SQL Editor. Configure Supabase Auth > URL Configuration so the Site URL is your website origin and the Redirect URLs include `http://localhost:3000/admin/reset-password` and your production `https://your-domain/admin/reset-password`.

In Render, set the same variables in the service Environment tab. The checked-in `render.yaml` declares which values must be entered. Do not commit a real `.env` file or service-role key.


## Deploy for a new client (about 30 minutes)

1. **Copy the template**: use "Use this template" on GitHub (or fork) - one copy per client.
2. **Deploy** - pick one:
   - **Render**: New > Blueprint > select the repo (uses `render.yaml`). Configure the Supabase URL, anon key, service-role secret, admin setup secret, and public app URL. A persistent disk (paid instance) keeps content and uploads safe across redeploys.
   - **Docker / any VPS**: `docker build -t salon . && docker run -p 3000:3000 -e SUPABASE_URL=... -e SUPABASE_ANON_KEY=... -e SUPABASE_SERVICE_ROLE_KEY=... -e ADMIN_SIGNUP_SECRET=... -e PUBLIC_APP_URL=... -v salon-data:/app/data -v salon-uploads:/app/public/uploads salon`
   - **Plain Node server**: `npm install && npm run build && npm start` (set the Supabase environment variables first).
3. Open `https://your-site/admin`, log in, and work through **Quick Setup**, then the left menu.
4. Click **Save & Publish**, then connect the client's domain in your host's dashboard.

> **Important:** this app stores content in files, so it needs a server that keeps its disk (Render with disk, a VPS, Docker with volumes). It will **not** keep edits on serverless hosts like Vercel or Netlify. If your host erases files on deploy, set `DATA_DIR` and `UPLOADS_DIR` to a mounted persistent disk.

## Security notes

- Admin login verifies the Supabase Auth access token and reads the administrator role from `public.profiles` on the server for every protected API request.
- The first-admin signup endpoint requires a server-only setup key and is closed automatically after the first admin exists.
- Password reset responses do not reveal whether an email belongs to an account.
- Login is rate-limited (8 wrong attempts per 15 minutes per IP).
- Uploaded files are served with a sandboxing header so an uploaded SVG cannot run scripts.
- Only add real customer reviews and photos you have the right to use.

## Handy commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Builds the website and bundles the server (`server.js`) |
| `npm start` | Runs the production server |
