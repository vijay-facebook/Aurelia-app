import React from 'react';
import {
  SiteConfig,
  DayHours,
  GalleryImageConfig,
  HomeServiceConfig,
  MenuItemConfig,
  ReviewItemConfig,
  SocialPostConfig,
  SocialLinksConfig,
  StoryStat,
  VideoItemConfig,
} from '../config/types';
import {
  AddButton,
  Card,
  MediaField,
  NumberField,
  Panel,
  SelectField,
  StringListField,
  TextAreaField,
  TextField,
  ToggleField,
  UploadHandler,
  humanize,
  newId,
  patchAt,
  removeAt,
} from './fields';

interface ExtraEditorsProps {
  tab: string;
  config: SiteConfig;
  update: (path: string, value: any) => void;
  /** Change several fields in one go (avoids one change overwriting another). */
  updateMany: (changes: Record<string, any>) => void;
  upload: UploadHandler;
  uploading: boolean;
}

const DAYS: { key: keyof SiteConfig['openingHours']; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const GALLERY_SPANS = [
  { value: 'col-span-1', label: 'Normal tile' },
  { value: 'col-span-1 md:col-span-2', label: 'Wide tile' },
];

const VIDEO_TYPES = [
  { value: 'upload', label: 'Uploaded video file (MP4 / WebM)' },
  { value: 'url', label: 'Direct video URL' },
  { value: 'embed', label: 'Embed link (YouTube / Vimeo embed URL)' },
];

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
];

export const ExtraEditors: React.FC<ExtraEditorsProps> = ({ tab, config, update, updateMany, upload, uploading }) => {
  const media = { upload, uploading };

  switch (tab) {
    /* ------------------------------------------------ QUICK SETUP */
    case 'quickstart':
      return (
        <div className="space-y-6">
          <div className="bg-[#0D1117] border border-[#238636]/50 rounded-xl p-5 text-xs text-[#C9D1D9] space-y-1.5">
            <p className="text-sm font-semibold text-[#F2F4F8]">Go live in 30 minutes</p>
            <p>1. Fill in the essentials on this page (about 5 minutes).</p>
            <p>
              2. Use the left menu to add your Services, Team, Gallery, Videos, Offers and Reviews. Hide anything you do
              not need under &quot;Sections &amp; Headings&quot;.
            </p>
            <p>3. Click &quot;Save &amp; Publish&quot; at the top. Your website updates instantly.</p>
          </div>

          <Panel title="1. Your Business" subtitle="Name, tagline and logo shown in the header and footer.">
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField
                label="Business name"
                value={config.brand.name}
                onChange={(v) => updateMany({ 'brand.name': v, 'brand.wordmark': v.toUpperCase() })}
                hint="Also used as the text logo when no logo image is uploaded."
              />
              <TextField
                label="Tagline"
                value={config.brand.tagline}
                onChange={(v) => update('brand.tagline', v)}
              />
            </div>
            <MediaField
              label="Logo image (optional)"
              value={config.brand.logoImage}
              onChange={(v) => update('brand.logoImage', v)}
              {...media}
            />
            <TextField
              label="Copyright line"
              value={config.brand.copyright}
              onChange={(v) => update('brand.copyright', v)}
              placeholder="© Your Salon. All rights reserved."
            />
          </Panel>

          <Panel title="2. Home Page Banner" subtitle="The first thing visitors see.">
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField
                label="Headline - line 1"
                value={config.hero.headlineLine1}
                onChange={(v) => update('hero.headlineLine1', v)}
              />
              <TextField
                label="Headline - line 2"
                value={config.hero.headlineLine2}
                onChange={(v) => update('hero.headlineLine2', v)}
              />
            </div>
            <TextAreaField
              label="Short description"
              rows={2}
              value={config.hero.subtext}
              onChange={(v) => update('hero.subtext', v)}
            />
            <MediaField
              label="Banner (hero) image"
              value={config.hero.heroImage}
              onChange={(v) => update('hero.heroImage', v)}
              {...media}
            />
          </Panel>

          <Panel title="3. Contact & Location" subtitle="Where customers find and reach you.">
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField
                label="Phone number"
                value={config.businessInfo.phone}
                onChange={(v) => update('businessInfo.phone', v)}
                placeholder="+91 98765 43210"
              />
              <TextField
                label="WhatsApp number (for bookings)"
                value={config.businessInfo.whatsappNumber}
                onChange={(v) =>
                  updateMany({ 'businessInfo.whatsappNumber': v, 'booking.whatsappNumber': v })
                }
                placeholder="919876543210"
                hint="Digits only with country code, no + sign. Used for the contact link and booking messages."
              />
              <TextField
                label="Email"
                value={config.businessInfo.email}
                onChange={(v) => update('businessInfo.email', v)}
              />
              <TextField
                label="City"
                value={config.businessInfo.city}
                onChange={(v) => update('businessInfo.city', v)}
              />
              <TextField
                label="Pincode"
                value={config.businessInfo.pincode}
                onChange={(v) => update('businessInfo.pincode', v)}
              />
              <TextField
                label="Google Maps link"
                value={config.businessInfo.googleMapsLink}
                onChange={(v) => update('businessInfo.googleMapsLink', v)}
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>
            <StringListField
              label="Address lines"
              values={config.businessInfo.addressLines}
              onChange={(v) => update('businessInfo.addressLines', v)}
              addLabel="Add line"
            />
          </Panel>

          <Panel title="4. Google Search Appearance" subtitle="How your site looks in Google and when shared on WhatsApp.">
            <TextField
              label="Page title"
              value={config.seo.title}
              onChange={(v) => update('seo.title', v)}
            />
            <TextAreaField
              label="Page description"
              rows={2}
              value={config.seo.description}
              onChange={(v) => update('seo.description', v)}
            />
          </Panel>
        </div>
      );

    /* ------------------------------------------------ ADDRESS & MAP */
    case 'location':
      return (
        <Panel
          title="Address & Map Location"
          subtitle="Shown in the footer, booking section and contact areas. City, pincode and phone are in 'Business Info & Hours'."
        >
          <StringListField
            label="Address lines"
            values={config.businessInfo.addressLines}
            onChange={(v) => update('businessInfo.addressLines', v)}
            addLabel="Add line"
            hint="Example: '14 Carter Road' then 'Bandra West'."
          />
          <TextField
            label="Google Maps link"
            value={config.businessInfo.googleMapsLink}
            onChange={(v) => update('businessInfo.googleMapsLink', v)}
            placeholder="https://maps.app.goo.gl/..."
            hint="Open your place in Google Maps, click Share, and paste the link here."
          />
          <StringListField
            label="At-home service areas"
            values={config.businessInfo.atHomeServedAreas}
            onChange={(v) => update('businessInfo.atHomeServedAreas', v)}
            addLabel="Add area"
            hint="Customers typing one of these areas in the at-home checker are shown as serviceable."
          />
        </Panel>
      );

    /* ------------------------------------------------ OPENING HOURS */
    case 'hours':
      return (
        <Panel title="Opening Hours" subtitle="Set the timings for every day, or mark a day as closed.">
          <div className="space-y-3">
            {DAYS.map(({ key, label }) => {
              const hours: DayHours = config.openingHours[key];
              const set = (patch: Partial<DayHours>) => update(`openingHours.${key}`, { ...hours, ...patch });
              return (
                <div
                  key={key}
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 grid sm:grid-cols-[120px_1fr_1fr_auto] gap-4 items-end"
                >
                  <span className="text-xs text-[#F2F4F8] font-medium self-center">{label}</span>
                  <TextField
                    label="Opens"
                    type="time"
                    value={hours.open}
                    onChange={(v) => set({ open: v })}
                  />
                  <TextField
                    label="Closes"
                    type="time"
                    value={hours.close}
                    onChange={(v) => set({ close: v })}
                  />
                  <label className="flex items-center gap-2 text-xs text-[#C9D1D9] pb-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => set({ closed: e.target.checked })}
                      className="w-4 h-4 accent-[#238636]"
                    />
                    Closed
                  </label>
                </div>
              );
            })}
          </div>
        </Panel>
      );

    /* ------------------------------------------------ SECTIONS & HEADINGS */
    case 'sections':
      return (
        <div className="space-y-6">
          <Panel
            title="Show / Hide Sections"
            subtitle="Turn whole sections of the website on or off. Hidden sections disappear from the page."
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.keys(config.sectionsVisibility).map((key) => (
                <ToggleField
                  key={key}
                  label={humanize(key)}
                  checked={(config.sectionsVisibility as Record<string, boolean>)[key]}
                  onChange={(v) => update(`sectionsVisibility.${key}`, v)}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Section Headings" subtitle="Small eyebrow labels and big titles shown above each section.">
            <div className="grid sm:grid-cols-2 gap-4">
              {Object.keys(config.headings).map((key) => (
                <TextField
                  key={key}
                  label={humanize(key)}
                  value={(config.headings as Record<string, string>)[key]}
                  onChange={(v) => update(`headings.${key}`, v)}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Scrolling Ticker" subtitle="The moving text strip between sections.">
            <StringListField
              label="Ticker items"
              values={config.marqueeItems}
              onChange={(v) => update('marqueeItems', v)}
              addLabel="Add item"
            />
          </Panel>
        </div>
      );

    /* ------------------------------------------------ STORY */
    case 'story': {
      const s = config.story;
      return (
        <Panel title="Story / About" subtitle="The brand story section with founder details and key numbers.">
          <div className="grid sm:grid-cols-3 gap-4">
            <TextField label="Eyebrow label" value={s.eyebrow} onChange={(v) => update('story.eyebrow', v)} />
            <TextField
              label="Heading (normal text)"
              value={s.headingPrefix}
              onChange={(v) => update('story.headingPrefix', v)}
            />
            <TextField
              label="Heading (italic text)"
              value={s.headingItalic}
              onChange={(v) => update('story.headingItalic', v)}
            />
          </div>
          <StringListField
            label="Story paragraphs"
            values={s.paragraphs}
            onChange={(v) => update('story.paragraphs', v)}
            addLabel="Add paragraph"
            multiline
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Founder name" value={s.founderName} onChange={(v) => update('story.founderName', v)} />
            <TextField
              label="Founder title"
              value={s.founderTitle}
              onChange={(v) => update('story.founderTitle', v)}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <MediaField
              label="Story image"
              value={s.storyImage}
              onChange={(v) => update('story.storyImage', v)}
              {...media}
            />
            <MediaField
              label="Signature image (optional)"
              value={s.signatureImage}
              onChange={(v) => update('story.signatureImage', v)}
              {...media}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#C9D1D9]">Key numbers</span>
              <AddButton
                label="Add stat"
                onClick={() => update('story.stats', [...s.stats, { label: 'Label', value: '0' } as StoryStat])}
              />
            </div>
            {s.stats.map((stat, i) => (
              <Card key={i} title={`Stat #${i + 1}`} onDelete={() => update('story.stats', removeAt(s.stats, i))}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField
                    label="Value"
                    value={stat.value}
                    onChange={(v) => update('story.stats', patchAt(s.stats, i, { value: v }))}
                  />
                  <TextField
                    label="Label"
                    value={stat.label}
                    onChange={(v) => update('story.stats', patchAt(s.stats, i, { label: v }))}
                  />
                </div>
              </Card>
            ))}
          </div>
        </Panel>
      );
    }

    /* ------------------------------------------------ MENU */
    case 'menu': {
      const items = config.menu.items;
      const categories = config.menu.categories;
      const categoryOptions = (current: string) => {
        const list = categories.includes(current) || !current ? categories : [...categories, current];
        return list.map((c) => ({ value: c, label: c }));
      };
      return (
        <Panel
          title="Service Menu & Price List"
          subtitle="Categories and every priced item in your menu."
          action={
            <AddButton
              label="Add menu item"
              onClick={() =>
                update('menu.items', [
                  ...items,
                  {
                    id: newId('menu'),
                    title: 'New Item',
                    category: categories[0] ?? '',
                    description: 'Short description.',
                    duration: '60 min',
                    price: '₹1,000',
                    numericPrice: 1000,
                  } as MenuItemConfig,
                ])
              }
            />
          }
        >
          <StringListField
            label="Menu categories"
            values={categories}
            onChange={(v) => update('menu.categories', v)}
            addLabel="Add category"
            hint="If you rename a category, re-select it on the items that used the old name."
          />
          <div className="space-y-5">
            {items.map((item, i) => (
              <Card key={item.id} title={`Menu item #${i + 1}`} onDelete={() => update('menu.items', removeAt(items, i))}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField
                    label="Title"
                    value={item.title}
                    onChange={(v) => update('menu.items', patchAt(items, i, { title: v }))}
                  />
                  <SelectField
                    label="Category"
                    value={item.category}
                    options={categoryOptions(item.category)}
                    onChange={(v) => update('menu.items', patchAt(items, i, { category: v }))}
                  />
                </div>
                <TextAreaField
                  label="Description"
                  rows={2}
                  value={item.description}
                  onChange={(v) => update('menu.items', patchAt(items, i, { description: v }))}
                />
                <div className="grid sm:grid-cols-3 gap-4">
                  <TextField
                    label="Duration"
                    value={item.duration}
                    onChange={(v) => update('menu.items', patchAt(items, i, { duration: v }))}
                  />
                  <TextField
                    label="Price text"
                    value={item.price}
                    onChange={(v) => update('menu.items', patchAt(items, i, { price: v }))}
                  />
                  <NumberField
                    label="Price (number)"
                    value={item.numericPrice}
                    onChange={(v) => update('menu.items', patchAt(items, i, { numericPrice: v }))}
                  />
                </div>
              </Card>
            ))}
          </div>
        </Panel>
      );
    }

    /* ------------------------------------------------ GALLERY */
    case 'gallery': {
      const items = config.gallery;
      return (
        <Panel
          title="Photo Gallery"
          subtitle="Upload or link photos. Choose 'Wide tile' to make a photo larger in the grid."
          action={
            <AddButton
              label="Add photo"
              onClick={() =>
                update('gallery', [
                  ...items,
                  {
                    id: newId('gallery'),
                    title: 'New photo',
                    image: items[0]?.image || '',
                    span: 'col-span-1',
                  } as GalleryImageConfig,
                ])
              }
            />
          }
        >
          <div className="space-y-5">
            {items.map((item, i) => (
              <Card key={item.id} title={`Photo #${i + 1}`} onDelete={() => update('gallery', removeAt(items, i))}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField
                    label="Caption"
                    value={item.title}
                    onChange={(v) => update('gallery', patchAt(items, i, { title: v }))}
                  />
                  <SelectField
                    label="Tile size"
                    value={item.span}
                    options={
                      GALLERY_SPANS.some((s) => s.value === item.span)
                        ? GALLERY_SPANS
                        : [...GALLERY_SPANS, { value: item.span, label: `Custom (${item.span})` }]
                    }
                    onChange={(v) => update('gallery', patchAt(items, i, { span: v }))}
                  />
                </div>
                <MediaField
                  label="Photo"
                  value={item.image}
                  onChange={(v) => update('gallery', patchAt(items, i, { image: v }))}
                  {...media}
                />
              </Card>
            ))}
          </div>
        </Panel>
      );
    }

    /* ------------------------------------------------ VIDEOS */
    case 'videos': {
      const items = config.videos;
      return (
        <Panel
          title="Video Gallery"
          subtitle="Upload videos (MP4/WebM), or link a video URL or a YouTube/Vimeo embed link."
          action={
            <AddButton
              label="Add video"
              onClick={() =>
                update('videos', [
                  ...items,
                  {
                    id: newId('video'),
                    title: 'New video',
                    category: 'all',
                    categoryLabel: 'Featured',
                    duration: '0:30',
                    views: '0',
                    stylist: '',
                    thumbnail: items[0]?.thumbnail || '',
                    videoType: 'url',
                    videoUrl: '',
                    description: '',
                  } as VideoItemConfig,
                ])
              }
            />
          }
        >
          <div className="space-y-5">
            {items.map((item, i) => {
              const set = (patch: Partial<VideoItemConfig>) => update('videos', patchAt(items, i, patch));
              return (
                <Card key={item.id} title={`Video #${i + 1}`} onDelete={() => update('videos', removeAt(items, i))}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField label="Title" value={item.title} onChange={(v) => set({ title: v })} />
                    <TextField
                      label="Stylist / presenter"
                      value={item.stylist}
                      onChange={(v) => set({ stylist: v })}
                    />
                  </div>
                  <div className="grid sm:grid-cols-4 gap-4">
                    <TextField
                      label="Filter key"
                      value={item.category}
                      onChange={(v) => set({ category: v })}
                      hint="Lowercase word used by filters, e.g. hair"
                    />
                    <TextField
                      label="Category label"
                      value={item.categoryLabel}
                      onChange={(v) => set({ categoryLabel: v })}
                    />
                    <TextField label="Duration" value={item.duration} onChange={(v) => set({ duration: v })} />
                    <TextField label="Views" value={item.views} onChange={(v) => set({ views: v })} />
                  </div>
                  <TextAreaField
                    label="Description"
                    rows={2}
                    value={item.description}
                    onChange={(v) => set({ description: v })}
                  />
                  <MediaField
                    label="Thumbnail image"
                    value={item.thumbnail}
                    onChange={(v) => set({ thumbnail: v })}
                    {...media}
                  />
                  <SelectField
                    label="Video source"
                    value={item.videoType}
                    options={VIDEO_TYPES}
                    onChange={(v) => set({ videoType: v as VideoItemConfig['videoType'] })}
                  />
                  {item.videoType === 'upload' ? (
                    <MediaField
                      label="Video file"
                      kind="video"
                      value={item.videoUrl}
                      onChange={(v) => set({ videoUrl: v })}
                      {...media}
                    />
                  ) : (
                    <TextField
                      label={item.videoType === 'embed' ? 'Embed URL' : 'Video URL'}
                      value={item.videoUrl}
                      onChange={(v) => set({ videoUrl: v })}
                      placeholder={
                        item.videoType === 'embed'
                          ? 'https://www.youtube.com/embed/VIDEO_ID'
                          : 'https://example.com/video.mp4'
                      }
                      hint={
                        item.videoType === 'embed'
                          ? "For YouTube use the 'embed' form of the link, not the normal watch link."
                          : undefined
                      }
                    />
                  )}
                </Card>
              );
            })}
          </div>
        </Panel>
      );
    }

    /* ------------------------------------------------ AT-HOME SERVICES */
    case 'homeServices': {
      const items = config.homeServices;
      return (
        <Panel
          title="At-Home Services"
          subtitle="Services you offer at the customer's location. Service areas are set under 'Address & Map'."
          action={
            <AddButton
              label="Add at-home service"
              onClick={() =>
                update('homeServices', [
                  ...items,
                  {
                    id: newId('home'),
                    title: 'New at-home service',
                    subtitle: 'Short subtitle',
                    duration: '90 min',
                    price: '₹3,000',
                    numericPrice: 3000,
                    image: items[0]?.image || '',
                    description: 'Describe what the customer gets.',
                    includes: [],
                    serviceArea: '',
                  } as HomeServiceConfig,
                ])
              }
            />
          }
        >
          <div className="space-y-5">
            {items.map((item, i) => {
              const set = (patch: Partial<HomeServiceConfig>) => update('homeServices', patchAt(items, i, patch));
              return (
                <Card
                  key={item.id}
                  title={`At-home service #${i + 1}`}
                  onDelete={() => update('homeServices', removeAt(items, i))}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField label="Title" value={item.title} onChange={(v) => set({ title: v })} />
                    <TextField label="Subtitle" value={item.subtitle} onChange={(v) => set({ subtitle: v })} />
                  </div>
                  <TextAreaField
                    label="Description"
                    rows={2}
                    value={item.description}
                    onChange={(v) => set({ description: v })}
                  />
                  <div className="grid sm:grid-cols-4 gap-4">
                    <TextField label="Duration" value={item.duration} onChange={(v) => set({ duration: v })} />
                    <TextField label="Price text" value={item.price} onChange={(v) => set({ price: v })} />
                    <NumberField
                      label="Price (number)"
                      value={item.numericPrice}
                      onChange={(v) => set({ numericPrice: v })}
                    />
                    <TextField
                      label="Service area note"
                      value={item.serviceArea}
                      onChange={(v) => set({ serviceArea: v })}
                    />
                  </div>
                  <StringListField
                    label="What's included"
                    values={item.includes}
                    onChange={(v) => set({ includes: v })}
                    addLabel="Add item"
                  />
                  <MediaField label="Image" value={item.image} onChange={(v) => set({ image: v })} {...media} />
                </Card>
              );
            })}
          </div>
        </Panel>
      );
    }

    /* ------------------------------------------------ REVIEWS */
    case 'reviews': {
      const items = config.reviews;
      return (
        <Panel
          title="Reviews & Kind Words"
          subtitle="Customer testimonials shown on the site. Only add genuine reviews from real customers."
          action={
            <AddButton
              label="Add review"
              onClick={() =>
                update('reviews', [
                  ...items,
                  {
                    id: newId('review'),
                    quote: '',
                    author: '',
                    service: '',
                    location: '',
                    rating: 5,
                  } as ReviewItemConfig,
                ])
              }
            />
          }
        >
          <div className="space-y-5">
            {items.map((item, i) => {
              const set = (patch: Partial<ReviewItemConfig>) => update('reviews', patchAt(items, i, patch));
              return (
                <Card key={item.id} title={`Review #${i + 1}`} onDelete={() => update('reviews', removeAt(items, i))}>
                  <TextAreaField label="Review text" value={item.quote} onChange={(v) => set({ quote: v })} />
                  <div className="grid sm:grid-cols-4 gap-4">
                    <TextField label="Customer name" value={item.author} onChange={(v) => set({ author: v })} />
                    <TextField label="Service taken" value={item.service} onChange={(v) => set({ service: v })} />
                    <TextField label="Location" value={item.location} onChange={(v) => set({ location: v })} />
                    <SelectField
                      label="Rating"
                      value={String(item.rating)}
                      options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? 's' : ''}` }))}
                      onChange={(v) => set({ rating: Number(v) })}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </Panel>
      );
    }

    /* ------------------------------------------------ SOCIAL */
    case 'social': {
      const posts = config.social.posts;
      const linkKeys = Object.keys(config.social.links) as (keyof SocialLinksConfig)[];
      return (
        <div className="space-y-6">
          <Panel title="Social Links" subtitle="Leave a field empty to hide that network.">
            <div className="grid sm:grid-cols-2 gap-4">
              {linkKeys.map((key) => (
                <TextField
                  key={key}
                  label={humanize(key)}
                  value={config.social.links[key]}
                  onChange={(v) => update(`social.links.${key}`, v)}
                  placeholder={key === 'whatsapp' ? 'https://wa.me/91XXXXXXXXXX' : 'https://...'}
                />
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField
                label="Social section heading"
                value={config.social.sectionHeading}
                onChange={(v) => update('social.sectionHeading', v)}
              />
              <TextField
                label="Share text"
                value={config.social.shareText}
                onChange={(v) => update('social.shareText', v)}
              />
            </div>
          </Panel>

          <Panel
            title="Social Feed Posts"
            subtitle="Photos shown in the social feed section."
            action={
              <AddButton
                label="Add post"
                onClick={() =>
                  update('social.posts', [
                    ...posts,
                    {
                      id: newId('post'),
                      platform: 'instagram',
                      handle: '',
                      image: posts[0]?.image || '',
                      likes: '0',
                      comments: '0',
                      caption: '',
                      tags: [],
                      url: '',
                    } as SocialPostConfig,
                  ])
                }
              />
            }
          >
            <div className="space-y-5">
              {posts.map((post, i) => {
                const set = (patch: Partial<SocialPostConfig>) => update('social.posts', patchAt(posts, i, patch));
                return (
                  <Card
                    key={post.id}
                    title={`Post #${i + 1}`}
                    onDelete={() => update('social.posts', removeAt(posts, i))}
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <SelectField
                        label="Platform"
                        value={post.platform}
                        options={SOCIAL_PLATFORMS}
                        onChange={(v) => set({ platform: v as SocialPostConfig['platform'] })}
                      />
                      <TextField label="Handle" value={post.handle} onChange={(v) => set({ handle: v })} />
                    </div>
                    <TextAreaField
                      label="Caption"
                      rows={2}
                      value={post.caption}
                      onChange={(v) => set({ caption: v })}
                    />
                    <div className="grid sm:grid-cols-3 gap-4">
                      <TextField label="Likes" value={post.likes} onChange={(v) => set({ likes: v })} />
                      <TextField label="Comments" value={post.comments} onChange={(v) => set({ comments: v })} />
                      <TextField label="Post URL" value={post.url} onChange={(v) => set({ url: v })} />
                    </div>
                    <StringListField
                      label="Tags"
                      values={post.tags}
                      onChange={(v) => set({ tags: v })}
                      addLabel="Add tag"
                    />
                    <MediaField label="Photo" value={post.image} onChange={(v) => set({ image: v })} {...media} />
                  </Card>
                );
              })}
            </div>
          </Panel>
        </div>
      );
    }

    /* ------------------------------------------------ BOOKING */
    case 'booking': {
      const b = config.booking;
      return (
        <Panel
          title="Booking & WhatsApp"
          subtitle="Bookings are sent to your WhatsApp as a pre-filled message."
        >
          <TextField
            label="WhatsApp number for bookings"
            value={b.whatsappNumber}
            onChange={(v) => update('booking.whatsappNumber', v)}
            placeholder="919876543210"
            hint="Digits only, with country code and no + sign. Example for India: 919876543210"
          />
          <TextAreaField
            label="WhatsApp message template"
            rows={8}
            value={b.whatsappTemplate}
            onChange={(v) => update('booking.whatsappTemplate', v)}
            hint="Placeholders you can use: {service} {date} {time} {name} {phone}"
          />
          <StringListField
            label="Time slots offered to customers"
            values={b.timeSlots}
            onChange={(v) => update('booking.timeSlots', v)}
            addLabel="Add slot"
          />
          <TextField
            label="Success message"
            value={b.successMessage}
            onChange={(v) => update('booking.successMessage', v)}
          />
        </Panel>
      );
    }

    default:
      return null;
  }
};
