import {
  AccentPalette,
  AccentPaletteId,
  AspectSpec,
  PlatformGeneratedContent,
  PosterAspectRatio,
  PromotionAdData,
  PromotionTemplateMeta,
  SocialPlatformTarget,
} from './types';

export const PROMOTION_TEMPLATES: PromotionTemplateMeta[] = [
  {
    id: 'editorial-arch',
    name: 'Editorial Arch',
    description: 'Warm sanctuary layout with arched portrait framing and serif typography.',
    recommendedRatio: '4:5',
  },
  {
    id: 'obsidian-luxe',
    name: 'Obsidian Luxe',
    description: 'High-contrast dark evening backdrop with brushed champagne gold accents.',
    recommendedRatio: '1:1',
  },
  {
    id: 'botanical-minimal',
    name: 'Botanical Minimal',
    description: 'Airy gallery composition placing generous whitespace around the offer.',
    recommendedRatio: '4:5',
  },
  {
    id: 'seasonal-split',
    name: 'Seasonal Split',
    description: '50/50 split showcase separating full-bleed imagery from campaign details.',
    recommendedRatio: '16:9',
  },
];

export const ACCENT_PALETTES: Record<AccentPaletteId, AccentPalette> = {
  champagne: {
    id: 'champagne',
    name: 'Warm Champagne',
    bg: '#F6F1EA',
    surface: '#EFE6DA',
    text: '#1D1612',
    muted: '#6F5F51',
    accent: '#8C6A43',
    accentText: '#F6F1EA',
    border: '#D8C8B4',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Gold',
    bg: '#161210',
    surface: '#241D18',
    text: '#F6F1EA',
    muted: '#C8B9A6',
    accent: '#D9B98F',
    accentText: '#1D1612',
    border: '#3D3129',
  },
  sage: {
    id: 'sage',
    name: 'Botanical Sage',
    bg: '#EEF1EC',
    surface: '#E0E6DC',
    text: '#1B241E',
    muted: '#536156',
    accent: '#3B5944',
    accentText: '#F6F8F5',
    border: '#C5D0C1',
  },
  rosewood: {
    id: 'rosewood',
    name: 'Velvet Rosewood',
    bg: '#F7EFF0',
    surface: '#EDE0E2',
    text: '#26171A',
    muted: '#6B4F54',
    accent: '#8A4855',
    accentText: '#FCF8F8',
    border: '#DCC5C9',
  },
};

export const ASPECT_SPECS: Record<PosterAspectRatio, AspectSpec> = {
  '1:1': {
    id: '1:1',
    label: '1:1 Square',
    useCase: 'Instagram Feed / Facebook',
    width: 1080,
    height: 1080,
    previewClass: 'aspect-square',
  },
  '4:5': {
    id: '4:5',
    label: '4:5 Portrait',
    useCase: 'Instagram Editorial Post',
    width: 1080,
    height: 1350,
    previewClass: 'aspect-[4/5]',
  },
  '9:16': {
    id: '9:16',
    label: '9:16 Vertical',
    useCase: 'Stories / Reels / WhatsApp Status',
    width: 1080,
    height: 1920,
    previewClass: 'aspect-[9/16]',
  },
  '16:9': {
    id: '16:9',
    label: '16:9 Wide',
    useCase: 'Website Banner / WhatsApp Header',
    width: 1200,
    height: 675,
    previewClass: 'aspect-video',
  },
};

export const PLATFORM_TARGETS: { id: SocialPlatformTarget; label: string }[] = [
  { id: 'instagram-post', label: 'Instagram Post' },
  { id: 'instagram-story', label: 'Instagram Story' },
  { id: 'whatsapp-broadcast', label: 'WhatsApp Broadcast' },
  { id: 'facebook-ad', label: 'Facebook Ad' },
  { id: 'print-flyer', label: 'Studio Flyer' },
];

export function generatePlatformContent(
  ad: PromotionAdData,
  platform: SocialPlatformTarget
): PlatformGeneratedContent {
  const slugTag = ad.salonName.replace(/[^a-zA-Z0-9]/g, '') || 'LuxurySalon';
  const cityTag = ad.city.replace(/[^a-zA-Z0-9]/g, '') || 'CityStudio';
  const baseHashtags = [
    `#${slugTag}`,
    `#${cityTag}Salon`,
    '#HairArtistry',
    '#LuxuryWellness',
    '#BotanicalCare',
    '#SelfCareRitual',
  ];

  const offerLine = [ad.offerBadge, ad.priceHighlight].filter(Boolean).join(' · ');
  const codeLine = ad.promoCode ? `Use code ${ad.promoCode}` : '';
  const validLine = ad.validUntil ? `Valid through ${ad.validUntil}` : '';

  switch (platform) {
    case 'instagram-post': {
      const caption = [
        `${ad.eyebrow ? `${ad.eyebrow} — ` : ''}${ad.headline}`,
        '',
        ad.subheadline,
        offerLine ? `\nFeatured Offer: ${offerLine}` : '',
        codeLine ? `Booking Code: ${codeLine}` : '',
        validLine,
        '',
        `${ad.ctaLabel} via link in bio or call ${ad.phone}.`,
        `${ad.salonName}${ad.city ? `, ${ad.city}` : ''}.`,
      ]
        .filter((line) => line !== '')
        .join('\n');

      return {
        platform,
        label: 'Instagram Feed Post',
        dimensions: '1080 × 1350 px (4:5) or 1080 × 1080 px (1:1)',
        recommendedRatio: '4:5',
        headline: ad.headline,
        caption,
        hashtags: baseHashtags,
        ctaText: ad.ctaLabel,
        fullShareText: `${caption}\n\n${baseHashtags.join(' ')}`,
      };
    }

    case 'instagram-story': {
      const caption = [
        `${ad.headline.toUpperCase()}`,
        offerLine || ad.subheadline,
        codeLine ? `TAP LINK & ENTER: ${ad.promoCode}` : `${ad.ctaLabel} Today`,
        `${ad.salonName} · ${ad.city}`,
      ]
        .filter(Boolean)
        .join('\n');

      return {
        platform,
        label: 'Instagram Story / Reel Cover',
        dimensions: '1080 × 1920 px (9:16)',
        recommendedRatio: '9:16',
        headline: ad.headline,
        caption,
        hashtags: baseHashtags.slice(0, 4),
        ctaText: `${ad.ctaLabel} →`,
        fullShareText: `${caption}\n\nLink Sticker URL: ${ad.bookingUrl}`,
      };
    }

    case 'whatsapp-broadcast': {
      const caption = [
        `*${ad.salonName}*${ad.city ? ` (${ad.city})` : ''}`,
        `*${ad.headline}*`,
        '',
        ad.subheadline,
        offerLine ? `*Offer:* ${offerLine}` : '',
        ad.promoCode ? `*Privilege Code:* ${ad.promoCode}` : '',
        validLine ? `_${validLine}_` : '',
        '',
        `${ad.ctaLabel}: ${ad.bookingUrl}`,
        `Concierge Desk: ${ad.phone}`,
      ]
        .filter((line) => line !== '')
        .join('\n');

      return {
        platform,
        label: 'WhatsApp Client Broadcast',
        dimensions: '1080 × 1080 px (1:1) or 1200 × 675 px (16:9)',
        recommendedRatio: '1:1',
        headline: ad.headline,
        caption,
        hashtags: [],
        ctaText: `Reserve via WhatsApp`,
        fullShareText: caption,
      };
    }

    case 'facebook-ad': {
      const caption = [
        `Primary Text: ${ad.subheadline} ${offerLine ? `Enjoy ${offerLine} at ${ad.salonName}.` : ''} ${codeLine ? `${codeLine}.` : ''} ${validLine}`,
        `Ad Headline: ${ad.headline} | ${ad.salonName}`,
        `Description: ${ad.tagline || `Book online in 30 seconds · ${ad.city}`}`,
        `Destination URL: ${ad.bookingUrl}`,
      ].join('\n\n');

      return {
        platform,
        label: 'Meta / Facebook Sponsored Ad',
        dimensions: '1080 × 1080 px (1:1) or 1200 × 675 px (16:9)',
        recommendedRatio: '1:1',
        headline: `${ad.headline} — ${offerLine || ad.salonName}`,
        caption,
        hashtags: baseHashtags.slice(0, 3),
        ctaText: ad.ctaLabel,
        fullShareText: caption,
      };
    }

    case 'print-flyer': {
      const caption = [
        `${ad.salonName.toUpperCase()} · ${ad.city.toUpperCase()}`,
        `${ad.headline}`,
        `${ad.subheadline}`,
        offerLine ? `Privilege: ${offerLine}` : '',
        ad.promoCode ? `Present Code: ${ad.promoCode}` : '',
        validLine,
        `Reservations: ${ad.phone} | ${ad.bookingUrl}`,
      ]
        .filter(Boolean)
        .join('\n');

      return {
        platform,
        label: 'In-Studio Reception Counter / Flyer',
        dimensions: '1080 × 1350 px (4:5 Editorial Print)',
        recommendedRatio: '4:5',
        headline: ad.headline,
        caption,
        hashtags: [],
        ctaText: 'Scan QR to Reserve',
        fullShareText: caption,
      };
    }
  }
}
