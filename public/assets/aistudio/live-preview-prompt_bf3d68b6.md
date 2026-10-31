# Prompt: Section-Focused Live Preview + One-Click Full Website View (inside the CMS page)

Paste this into your AI coding tool with the current project open. It extends the existing "SalonWhiteLabelCMS" (left sidebar of CMS sections, center form, top bar with Live Preview / Open Live Site / Reset Default / Save & Publish).

---

## PROBLEM

Right now the editor shows a form, but the user cannot see what their change looks like. I want the CMS page to show a **live preview that follows what the user is editing**: only the section being edited is shown, it updates as they type, and when they finish they can view the **complete website with one click without leaving this page**.

## REQUIRED BEHAVIOUR

### 1. Layout of the CMS page
- Three areas: **left sidebar** (CMS sections, existing), **center editor form** (existing), **right Live Preview panel** (new, docked, resizable by dragging the divider, default about 45% width).
- On screens below 1024px, show Editor and Preview as two tabs ("Edit" | "Preview") with a floating "Preview" button on the Edit tab; never squeeze them side by side.
- The preview panel has a small toolbar: **Section name label**, **Focus ⇄ Full Website toggle**, **Desktop / Tablet / Mobile width switch**, **Refresh**, **Fullscreen**.

### 2. Focus mode (default): preview shows ONLY the section being edited
- When the user clicks a sidebar item (Brand & Identity, Hero, Services Grid, Master Artists, Menu, Gallery, Videos, Offers, At-Home, Reviews, Social, Booking, etc.), the preview instantly shows **only that section** rendered with the real site components and the real theme, centered with comfortable padding, on the site background.
- Section to preview mapping (put in one `previewMap.ts` file):
  - Brand & Identity → Header + Footer brand block (logo/wordmark, tagline, copyright)
  - Announcement Bar → top bar + header
  - Navigation & Order → Header navigation
  - Hero → Hero
  - Business Info & Hours → Footer "Visit / Hours" block + Booking contact block + Hero hours line
  - Services Grid → ServicesGrid (+ Marquee ticker)
  - Story / About → StorySection
  - Master Artists → StaffSection
  - Service Menu → MenuSection
  - Gallery → GallerySection
  - Video Gallery → VideoGallery
  - Session Offers → OffersSection
  - At-Home Services → HomeServicesSection
  - Reviews & Kind Words → KindWords
  - Social & Feed → SocialMediaSection + Footer social links
  - Booking → BookingSection (and the booking modal when the user edits slots or the WhatsApp template)
  - SEO → a small "search result + share card" mock preview
- Header and Footer are hidden in focus mode unless the mapping says otherwise. Add a checkbox **"Show page header/footer for context"** (off by default).

### 3. Real-time updates (no save needed to see changes)
- The preview is the real public site rendered in an **iframe** at `/?preview=1`. The CMS sends the **draft config** to it with `postMessage` on every change (debounced about 150 ms). The iframe applies it through the same `ConfigProvider` the public site uses, so preview and live site can never look different.
- Message types: `CONFIG_UPDATE {config}`, `FOCUS_SECTION {sectionId}`, `SET_MODE {mode: 'focus' | 'full'}`, `HIGHLIGHT_FIELD {fieldPath}`, `SET_DEVICE {width}`, and `PREVIEW_READY` back from iframe to CMS. Validate `event.origin` on both sides and ignore unknown messages.
- Uploaded images and videos must appear in the preview immediately (use a local object URL while uploading, then swap to the server URL).
- Adding, deleting or reordering list items (services, staff, menu items, etc.) is reflected live with a short highlight animation on the changed item.
- Switching sidebar sections must **not lose unsaved draft changes**. Draft lives in one CMS state store and is autosaved to `localStorage`.

### 4. Field-level highlight and scroll
- Every rendered element in the public components gets `data-cms-field="hero.headline"` (path in config). When the user focuses or hovers an input in the form, the matching element in the preview gets a soft outline and scrolls into view. Clicking an element in the preview (only inside preview mode) focuses the matching input in the form (two-way link).

### 5. One-click "View Complete Website" (without leaving the page)
- A prominent button in the preview toolbar and in the top bar: **"View Complete Website"**.
- One click switches the preview to **Full mode**: all visible sections rendered in the real order, header and footer included, with smooth scrolling. The sidebar highlights the section currently in the viewport; clicking a sidebar item in Full mode scrolls the preview to that section (and does not hide the others).
- **Fullscreen** button opens the full preview as an overlay over the whole CMS page (Esc to close) with a device switcher and a **"Back to editing"** button.
- A **Focus ⇄ Full** toggle is always visible, so the user can return to editing the same section instantly.
- Draft vs published: show a badge **"Draft preview (unsaved)"** when the draft differs from the published config, and **"Matches live site"** when equal.
- Top bar buttons, clarified:
  - **Live Preview** → toggles the preview panel on or off.
  - **View Complete Website** → full-site draft preview in this page.
  - **Open Live Site** → opens the **published** site in a new tab (disabled and tooltip "Publish first" if never published).
  - **Save & Publish** → saves the draft to the server, shows a success toast with a "View live site" link, and updates the badge.
  - **Reset Default** → asks for confirmation before restoring the default template.

### 6. Edge cases
- Empty or hidden section: preview shows a friendly placeholder ("This section is hidden. Turn it on to see it here") instead of a blank area.
- Missing required content (for example no services): show the component's empty state, not a crash.
- Invalid input (bad URL or number): show the inline error in the form and keep the last valid value in the preview.
- Very large images: compress in the browser before upload and preview.
- Preview must never expose edit controls to the public: `?preview=1` only works inside the CMS iframe when an admin session cookie exists; otherwise it redirects to `/`.
- Do not add any theme controls (colors, fonts). The preview uses the fixed theme.

### 7. Implementation notes
- Reuse the existing section components; add a `PreviewShell` component that reads `?preview=1&focus=<sectionId>&mode=<focus|full>` and listens for `postMessage`.
- Wrap each section in `<div data-cms-section="hero" id="hero">` so scroll and focus work.
- Keep the CMS draft in a single store (React context or Zustand) with `draftConfig`, `publishedConfig`, `isDirty`, `activeSection`, `previewMode`, `device`.
- Performance: memoize sections, update only the changed section, and keep typing latency under 100 ms.
- Accessibility: the iframe has a title, the toolbar is keyboard-accessible, and buttons have labels.

## ACCEPTANCE CHECKLIST
- [ ] Typing in any field changes the preview within about 0.3 seconds without saving.
- [ ] Clicking a sidebar item shows only that section in the preview (Focus mode).
- [ ] One click on "View Complete Website" shows the entire draft site, with all sections, inside the CMS page; one click returns to Focus mode.
- [ ] Fullscreen preview works, with device switcher and a Back to editing button.
- [ ] Focusing a form field highlights and scrolls to the matching element in the preview, and clicking an element in the preview focuses its field.
- [ ] Switching sections or tabs never loses unsaved edits; a refresh restores the draft.
- [ ] "Open Live Site" opens the published site; "Save & Publish" updates it, and the badge shows "Matches live site".
- [ ] Works on mobile (tabbed Edit/Preview) and desktop (split view).
- [ ] No theme controls were added, and `npm run lint` and `npm run build` pass.

Work autonomously, keep the existing CMS look, and finish with a short summary of what changed and how to test it.
