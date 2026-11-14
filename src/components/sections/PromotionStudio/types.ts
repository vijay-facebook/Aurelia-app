export type PromotionStep = 1 | 2 | 3;

export type PromotionTemplateId =
  | 'editorial-arch'
  | 'obsidian-luxe'
  | 'botanical-minimal'
  | 'seasonal-split';

export type PosterAspectRatio = '1:1' | '4:5' | '9:16' | '16:9';

export type AccentPaletteId = 'champagne' | 'obsidian' | 'sage' | 'rosewood';

export type SocialPlatformTarget =
  | 'instagram-post'
  | 'instagram-story'
  | 'whatsapp-broadcast'
  | 'facebook-ad'
  | 'print-flyer';

export interface PromotionAdData {
  // Step 1: Salon Details
  salonName: string;
  tagline: string;
  city: string;
  phone: string;
  whatsappNumber: string;
  bookingUrl: string;
  includeQrCode: boolean;

  // Step 2: Template & Visuals
  templateId: PromotionTemplateId;
  aspectRatio: PosterAspectRatio;
  paletteId: AccentPaletteId;
  featuredImage: string;

  // Step 3: Text & Campaign Offer
  eyebrow: string;
  headline: string;
  subheadline: string;
  offerBadge: string;
  promoCode: string;
  priceHighlight: string;
  validUntil: string;
  ctaLabel: string;
}

export interface PromotionTemplateMeta {
  id: PromotionTemplateId;
  name: string;
  description: string;
  recommendedRatio: PosterAspectRatio;
}

export interface AccentPalette {
  id: AccentPaletteId;
  name: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  border: string;
}

export interface AspectSpec {
  id: PosterAspectRatio;
  label: string;
  useCase: string;
  width: number;
  height: number;
  previewClass: string;
}

export interface PlatformGeneratedContent {
  platform: SocialPlatformTarget;
  label: string;
  dimensions: string;
  recommendedRatio: PosterAspectRatio;
  headline: string;
  caption: string;
  hashtags: string[];
  ctaText: string;
  fullShareText: string;
}
