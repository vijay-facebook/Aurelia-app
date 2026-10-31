# Prompt: Convert Aurelia into a White-Label Salon Website with an Admin Panel

Paste everything below into your AI coding tool (Claude Code / AI Studio / Cursor) with the repo open.

---

## ROLE

You are a senior full-stack engineer. Convert this existing React 19 + Vite + Tailwind v4 + Express project ("Aurelia", a luxury salon website) into a **white-label product**. Any salon owner must be able to change ALL business content from a password-protected **Admin Panel** (no code edits), while the **visual theme stays fixed** (colors, fonts, spacing, layout, animations are NOT editable).

## CURRENT STATE (already analysed)

- Stack: `server.ts` (Express + Vite middleware), `src/App.tsx`, `src/components/*`, `src/data/aureliaData.ts`, `src/types.ts`, Tailwind v4 (`src/index.css`).
- All content is hardcoded, either in `src/data/aureliaData.ts` (SERVICES, STAFF_MEMBERS, VIDEO_ITEMS, MENU_ITEMS, REVIEWS, GALLERY_IMAGES, SESSION_OFFERS, SOCIAL_POSTS, HOME_SERVICES) or directly inside components:
  - `Header.tsx`: "A U R E L I A" wordmark, nav labels, the "Live preview / Customize This Design" banner.
  - `Hero.tsx`: eyebrow "Luxury Beauty & Wellness Studio · Mumbai", headline "Beauty, Refined.", subtext, rating "4.9 from 860 reviews", hours "Tue–Sun, 10am–8pm", rotating circle text "AURELIA STUDIO · MUMBAI", "Next Available: Today, 4:30 pm / Signature Blowout with Leah", hero image path.
  - `MarqueeTicker.tsx`: hardcoded ticker items.
  - `StorySection.tsx`: story paragraphs, founder signature, stats (12 / 2014 / 100%), image.
  - `Footer.tsx`: tagline, address "14 Carter Road, Bandra West, Mumbai 400050", hours, Instagram / Pinterest / WhatsApp links, copyright "built by Nexora".
  - `BookingSection.tsx` and `BookingModal.tsx`: address, phone "+91 98200 00000", WhatsApp number `919820000000`, WhatsApp message template, time slots (10:30 AM … 07:00 PM), "Book Aurelia Studio".
  - `SocialMediaSection.tsx`: handles, stats, URLs, share text, phone.
  - `HomeServicesSection.tsx`: Mumbai-specific availability check and messages.
  - `StaffModal.tsx`: "Senior Practitioner at Aurelia Studio since 2018", Instagram link logic.
  - Section headings in `MenuSection`, `GallerySection`, `VideoGallery`, `KindWords`, `OffersSection`, `WishlistSection`, `ServicesGrid`, `BookingSection`.
  - `index.html` title, `metadata.json`.
- Image paths use `/src/assets/images/...` which will NOT work in a production build.
- Dead leftovers from a previous "Nexora" furniture store: `src/data/products.ts`, `ProductGrid/ProductCard/ProductModal/CartDrawer/WishlistDrawer/LookbookSection/CraftsmanshipJournal/OrderConfirmationModal/StudioAIModal`, the Product/CartItem types and the `/api/studio-ai` route in `server.ts`. They are not used by `App.tsx`. **Delete them.**

## GOAL

One single source of truth, `SiteConfig` (JSON), edited through `/admin`, saved on the server, and read by every component. No business text, number, link, image or video may remain hardcoded in any component.

## WHAT MUST BE EDITABLE (everything except theme)

1. **Brand**: business name, wordmark display text (auto letter-spacing "A U R E L I A" style from the name, with a toggle), logo image upload (shown instead of the wordmark if set), favicon, tagline, footer watermark text, copyright line (remove all "Nexora" / "demo" text).
2. **Top announcement bar**: enable/disable, text, optional link + label. Remove the "Live preview / Customize This Design" bar by default.
3. **Navigation**: label and show/hide for each section; section order (drag or up/down arrows).
4. **Hero**: eyebrow, headline (two lines, second line italic), subtext, two button labels, hero image upload, rotating badge text, rating value, review count, "Next Available" pill (time, service, staff name), each toggleable.
5. **Business info**: address (lines), city, pincode, phone, WhatsApp number (digits only, with country code), email, Google Maps link.
6. **Opening hours**: structured per weekday (open time, close time, closed toggle, multiple ranges optional). Auto-generate display strings such as "Tue–Sun, 10am–8pm" and "Monday closed" for Hero, Footer and Booking.
7. **Marquee ticker**: add, edit, delete, reorder items.
8. **Services cards**: add, edit, delete, reorder; title, category, subtitle, price text and numeric price, image upload, "popular" flag. Categories must be editable too.
9. **Story / About**: eyebrow, heading (with italic part), paragraphs (add/remove), founder name and signature line, image, stats (label + value, 1 to 4).
10. **Staff**: add, edit, delete, reorder; name, role, specialties (tag input), experience, bio, photo upload, next available text, Instagram handle, "since year". Show/hide per member.
11. **Menu**: categories and items; title, description, duration, price (numeric price plus a currency symbol setting).
12. **Gallery**: upload, caption, reorder, grid span (normal or wide), delete.
13. **Videos**: title, category/label, duration, views, stylist, description, thumbnail upload, and video source as either (a) uploaded MP4, (b) direct MP4 URL, or (c) YouTube/Vimeo link (render the correct embed). Add, edit, delete, reorder.
14. **Offers**: title, subtitle, badge, discount tag, original and offer price, promo code, validity text, image, description, highlights list, active toggle.
15. **At-Home services**: all fields plus service-area text, and an editable list of served areas/pincodes that drives the availability check (replace the hardcoded Mumbai logic). Show/hide the whole section.
16. **Reviews / Kind words**: add, edit, delete; quote, author, service, location, rating.
17. **Social media**: Instagram, Facebook, YouTube, Pinterest, X, TikTok, WhatsApp, Telegram links and handles (empty ones are hidden automatically); the Instagram-style feed posts (image, caption, likes, comments, tags, URL); section heading text; share text.
18. **Booking**: WhatsApp number, WhatsApp message template with placeholders (`{name}`, `{phone}`, `{service}`, `{date}`, `{time}`), time-slot groups (Morning, Afternoon, Evening) editable, slot interval, closed days/holidays (blocked dates), form labels/placeholders, success message.
19. **Section visibility toggles** for every section (Videos, Offers, At-Home, Social, Wishlist, Gallery, etc.).
20. **Section headings & microcopy**: every heading, eyebrow and button label in every section.
21. **SEO**: page title, meta description, OG image, language.

## USER-FACING EDIT OPTION (MOST IMPORTANT)

The owner must be able to edit the site **directly on the site itself**, not only from a separate admin page:

1. **Visible "Edit Site" button**: a floating pill button (bottom-left, small pencil icon) on the public site. Clicking it asks for the owner password (or the first-run setup, see below) and then turns on **Edit Mode**. Visitors who are not logged in never see edit controls.
2. **Click-to-edit (inline) in Edit Mode**:
   - Every text (headings, paragraphs, labels, prices, address, hours, button text) becomes editable in place (`contentEditable` or a small popover input) with a dashed outline on hover.
   - Every image and video gets a **"Change" overlay button** (upload from device, or paste URL; videos also accept YouTube/Vimeo links).
   - Every list (services, staff, menu items, gallery, videos, offers, reviews, marquee items, social links) shows **"+ Add", "Duplicate", "Delete" and drag-handle reorder** controls on each item.
   - Every section shows an **eye icon** (show/hide) and a **gear icon** that opens a side drawer with the fields that cannot be edited inline (opening hours table, WhatsApp number, booking slots, SEO, social links, logo, favicon).
   - Logo: click the brand name or logo in the header to change the text or upload a logo image.
3. **Edit toolbar** (sticky top bar, only in Edit Mode): **Save & Publish**, **Discard**, **Undo / Redo**, **Preview (exit edit mode without saving)**, **Mobile / Desktop preview toggle**, **Export / Import backup**, **Logout**. Show an "Unsaved changes" badge and warn before leaving.
4. **Auto-draft**: keep unsaved edits in `localStorage` so nothing is lost on refresh; publishing writes them to the server.
5. **First-run setup (no `.env` editing needed)**: if no owner account exists yet, the first click on "Edit Site" opens a **"Set up your site" wizard**: owner name, email, password, business name, logo upload, phone/WhatsApp, address. After that it logs the owner in. Provide "Forgot password" via a secret recovery code shown once at setup.
6. **Multiple editors (optional)**: owner can add staff/editor accounts with the same edit rights (no access to backup/reset).
7. The separate `/admin` dashboard still exists as a form-based fallback for the same config (needed for hidden fields, backup, users), but **Edit Mode on the live site is the primary way** users edit.
8. Edit controls must never change the theme: no color/font/spacing pickers anywhere.

**NOT editable (must stay in code):** colors, fonts, font sizes, spacing, border radii, animations, layout structure. Do not build any theme/color/font controls.

## ARCHITECTURE REQUIREMENTS

1. **Types**: create `src/config/types.ts` with a full `SiteConfig` interface covering the list above. Keep a `src/config/defaultConfig.ts` containing the current Aurelia data as the default template (migrate everything from `aureliaData.ts` and the hardcoded component text into it).
2. **Storage (server)**: in `server.ts` add
   - `GET /api/config` (public) returns the config,
   - `PUT /api/config` (admin only) validates and saves to `data/site-config.json` (write atomically, keep the last 10 backups in `data/backups/`),
   - `POST /api/upload` (admin only, `multer`) accepts images (jpg/png/webp/svg/gif, max 5 MB) and videos (mp4/webm, max 100 MB), saves to `uploads/` with random file names, returns the URL,
   - `GET /api/auth/status` (is an owner set up?), `POST /api/auth/setup` (first-run only, creates owner with hashed password via `bcrypt`), `POST /api/auth/login` / `POST /api/auth/logout`, `POST /api/auth/recover`: httpOnly signed cookie session (`SESSION_SECRET`, auto-generated and stored in `data/` if not set in `.env`), rate-limited login (e.g. 5 attempts per 15 min). `ADMIN_PASSWORD` in `.env` is optional and only used as an override,
   - `POST /api/config/reset` (admin only) restores the default template,
   - `GET /api/config/export` and `POST /api/config/import` for JSON backup and restore.
   - Serve `/uploads` statically. If `data/site-config.json` doesn't exist, seed it from `defaultConfig.ts`.
   - Remove the `/api/studio-ai` route and the `@google/genai` dependency (unless I ask for an AI feature).
3. **Client data layer**: `ConfigProvider` (React context) loads `/api/config` once, exposes `useConfig()`. Show a lightweight skeleton while loading. Every component reads from `useConfig()`, with no direct imports from `aureliaData.ts` (delete that file after migration).
4. **Routing**: add `react-router-dom`. `/` = public site, `/admin` = admin panel. Server must fall back to `index.html` for both in dev and production.
5. **Admin panel** (`src/admin/*`):
   - Login screen, then a dashboard with a left sidebar of sections (Brand, Hero, Business Info & Hours, Services, Story, Staff, Menu, Gallery, Videos, Offers, At-Home, Reviews, Social, Booking, Sections & Navigation, SEO, Backup).
   - Generic reusable editors: text, textarea, number, toggle, image uploader with preview and crop/replace, video input, tag input, list editor with add / delete / duplicate / drag-reorder, time-range picker.
   - **Live preview**: split view with the real site in an iframe that updates as the user types (use `postMessage` or a draft-config endpoint). Buttons: **Save & Publish**, **Discard changes**, **Undo last save**. Warn on unsaved changes.
   - Form validation (required fields, valid URLs, phone digits, price numbers) with inline errors.
   - The admin UI itself should be clean and neutral (it is not the public theme) and fully responsive on mobile.
6. **Images**: move bundled demo images to `public/demo/` so paths work in production; the default config references `/demo/...`. Uploaded files go to `uploads/`. Add `loading="lazy"` and sensible `alt` text taken from the config.
7. **Dynamic rendering rules**: if a section's list is empty or the section is hidden, do not render the section or its nav link. If a social link is empty, hide its icon. If the logo image exists, use it instead of the wordmark. Currency symbol and number formatting come from config.
8. **Multi-tenant ready (nice-to-have, keep simple)**: structure the code so that a `TENANT_ID` env var or subdomain could later pick a different `data/<tenant>/site-config.json`. Do not over-engineer now, just do not hardcode paths in many places.
9. **Security**: sanitize all text rendered from config (no `dangerouslySetInnerHTML`), validate upload MIME types and extensions, never expose `ADMIN_PASSWORD`, set `helmet` and basic CSP, CORS off for admin routes.
10. **Env & docs**: update `.env.example` (`ADMIN_PASSWORD`, `SESSION_SECRET`, `PORT`), `package.json` (name, scripts: `dev`, `build`, `start`), `metadata.json`, and `index.html` (title/meta come from config, with a server-side injected fallback). Write a `README.md` with setup, first login, deployment (Node host / VPS / Railway / Render, with persistent disk for `data/` and `uploads/`) and a "how to white-label for a new client" checklist.

## STEP-BY-STEP PLAN (follow in this order)

1. Delete dead Nexora code and the Gemini route.
2. Define `SiteConfig` types and `defaultConfig.ts` from current data and hardcoded text.
3. Add server endpoints (config, auth, upload, backup) and file storage.
4. Add `ConfigProvider` and refactor every component to read from config (one component at a time, keep the UI pixel-identical to today when the default config is used).
5. Build the admin panel with generic editors, then each section form.
6. Add live preview, save/discard/undo, validation.
7. Fix image paths, SEO injection, responsive checks.
8. Test: run `npm run lint` and `npm run build`; manually verify that changing each field in the admin updates the public site; verify theme is untouched; verify empty and hidden sections don't break layout.
9. Write the README.

## ACCEPTANCE CHECKLIST

- [ ] Searching the codebase for "Aurelia", "Mumbai", "Bandra", "Leah", "98200", "Nexora" finds matches ONLY in `defaultConfig.ts` (and README examples).
- [ ] A visible "Edit Site" button exists on the public site; after login, clicking any text/image/video/list item edits it in place, and Save & Publish updates the live site.
- [ ] A new client can deploy the app, open the site, click "Edit Site", complete the setup wizard and fully customize everything with zero code or `.env` changes.
- [ ] A non-technical user can change logo, name, staff, services, prices, address, hours, social links, videos, offers and reviews from `/admin` and see the change on the live site immediately after saving.
- [ ] Colors, fonts and layout have no admin controls and are unchanged.
- [ ] Wrong password is rejected; `/api/config` PUT without login returns 401.
- [ ] Uploaded images and videos persist after a server restart.
- [ ] Site looks identical to the current design when using the default config.
- [ ] `npm run build` and `npm run lint` pass with no errors.
- [ ] Works on mobile for both the public site and the admin panel.

Work autonomously, make sensible decisions, and at the end give me a short summary of what was built, how to run it, and any assumptions you made.
