# Aurelia White-Label Salon Platform & Admin CMS

A professional white-label salon website built with React 19, TypeScript, Tailwind CSS v4, Vite, and an Express backend. Any salon owner can customize all business content, services, pricing, master staff, gallery, videos, offers, at-home services, and booking templates from a secure password-protected **Admin Panel (`/admin`)**, while the visual design and luxury theme remain fixed.

---

## Key Features

1. **White--Label CMS (`/admin`)**:
   - Secure password-protected login (`ADMIN_PASSWORD`, default `admin123`).
   - Comprehensive section editors for Brand & Identity, Announcement Bar, Navigation order & visibility, Hero section, Business Info & Hours, Services Grid, Story/About, Master Artists, Service Menu, Gallery, Videos, Session Offers, At-Home Services, Reviews, Social Feed, Booking & WhatsApp templates, and SEO metadata.
   - File uploads for images and videos with atomic storage and automatic backups (`data/site-config.json` and `data/backups/`).
   - Reset to default template functionality.

2. **Single Source of Truth (`SiteConfig`)**:
   - React Context (`ConfigProvider`) loads and distributes configuration state globally across all public components.
   - Dynamic rendering: sections hide automatically if disabled or empty.

3. **Public Salon Website (`/`)**:
   - Impeccable luxury dark-warm aesthetic (`#1D1612` dark surfaces, `#F6F1EA` light canvas, `#D9B98F` gold accents, `Cormorant Garamond` serif headings, `Jost` body typography).
   - Fully responsive on mobile and desktop.
   - Interactive booking modal with WhatsApp integration and pre-filled appointment details.
   - Wishlist saving and At-Home pincode / location availability checker.

---

## Setup & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables (`.env.example` -> `.env`)**:
   ```env
   PORT=3000
   ADMIN_PASSWORD=admin123
   SESSION_SECRET=aurelia-secure-secret-key
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   - Public site: `http://localhost:3000`
   - Admin CMS: `http://localhost:3000/admin` (Password: `admin123`)

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## How to White-Label for a New Client

1. Log into `/admin` with your admin password.
2. In **Brand & Identity**, enter the client's salon name, tagline, copyright, and upload their logo.
3. In **Business Info & Hours**, update address, city, phone number, email, and WhatsApp number.
4. In **Services**, **Master Artists**, **Menu**, and **Offers**, update the client's actual offerings and pricing.
5. In **Booking & WhatsApp**, customize the WhatsApp direct booking message template.
6. Click **Save & Publish**. The live site updates instantly!
