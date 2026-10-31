export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface WeeklyHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface NavItemConfig {
  id: string;
  label: string;
  show: boolean;
  order: number;
}

export interface ServiceItemConfig {
  id: string;
  title: string;
  category: 'hair' | 'skin' | 'bridal' | 'nails' | 'spa' | string;
  subtitle: string;
  price: string;
  numericPrice: number;
  image: string;
  popular?: boolean;
}

export interface StoryStat {
  label: string;
  value: string;
}

export interface StaffMemberConfig {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  experience: string;
  bio: string;
  image: string;
  availableNext: string;
  instagram: string;
  sinceYear: string;
  show: boolean;
}

export interface MenuItemConfig {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  price: string;
  numericPrice: number;
}

export interface GalleryImageConfig {
  id: string;
  title: string;
  image: string;
  span: string;
}

export interface VideoItemConfig {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  duration: string;
  views: string;
  stylist: string;
  thumbnail: string;
  videoType: 'upload' | 'url' | 'embed';
  videoUrl: string;
  description: string;
}

export interface OfferItemConfig {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  discountTag: string;
  originalPrice: string;
  offerPrice: string;
  code: string;
  validTill: string;
  image: string;
  description: string;
  highlights: string[];
  active: boolean;
}

export interface HomeServiceConfig {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  price: string;
  numericPrice: number;
  image: string;
  description: string;
  includes: string[];
  serviceArea: string;
}

export interface ReviewItemConfig {
  id: string;
  quote: string;
  author: string;
  service: string;
  location: string;
  rating: number;
}

export interface SocialPostConfig {
  id: string;
  platform: 'instagram' | 'pinterest' | 'youtube' | 'tiktok';
  handle: string;
  image: string;
  likes: string;
  comments: string;
  caption: string;
  tags: string[];
  url: string;
}

export interface SocialLinksConfig {
  instagram: string;
  youtube: string;
  pinterest: string;
  whatsapp: string;
  facebook: string;
  tiktok: string;
  telegram: string;
}

export interface SiteConfig {
  brand: {
    name: string;
    wordmark: string;
    autoLetterSpacing: boolean;
    logoImage: string;
    favicon: string;
    tagline: string;
    footerWatermark: string;
    copyright: string;
    currencySymbol: string;
    customSlug?: string;
  };
  announcementBar: {
    enabled: boolean;
    text: string;
    linkText: string;
    linkUrl: string;
  };
  navigation: NavItemConfig[];
  hero: {
    eyebrow: string;
    headlineLine1: string;
    headlineLine2: string;
    subtext: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    heroImage: string;
    rotatingBadgeText: string;
    ratingValue: string;
    reviewCount: string;
    showRating: boolean;
    nextAvailableText: string;
    showNextAvailable: boolean;
  };
  businessInfo: {
    addressLines: string[];
    city: string;
    pincode: string;
    phone: string;
    whatsappNumber: string;
    email: string;
    googleMapsLink: string;
    atHomeServedAreas: string[];
  };
  openingHours: WeeklyHours;
  marqueeItems: string[];
  services: ServiceItemConfig[];
  story: {
    eyebrow: string;
    headingPrefix: string;
    headingItalic: string;
    paragraphs: string[];
    founderName: string;
    founderTitle: string;
    signatureImage: string;
    storyImage: string;
    stats: StoryStat[];
  };
  staff: StaffMemberConfig[];
  menu: {
    categories: string[];
    items: MenuItemConfig[];
  };
  gallery: GalleryImageConfig[];
  videos: VideoItemConfig[];
  offers: OfferItemConfig[];
  homeServices: HomeServiceConfig[];
  reviews: ReviewItemConfig[];
  social: {
    links: SocialLinksConfig;
    posts: SocialPostPostConfig[];
    sectionHeading: string;
    shareText: string;
  };
  booking: {
    whatsappNumber: string;
    whatsappTemplate: string;
    timeSlots: string[];
    successMessage: string;
  };
  sectionsVisibility: {
    services: boolean;
    story: boolean;
    team: boolean;
    menu: boolean;
    gallery: boolean;
    videos: boolean;
    offers: boolean;
    homeServices: boolean;
    reviews: boolean;
    social: boolean;
    wishlist: boolean;
  };
  headings: {
    servicesEyebrow: string;
    servicesTitle: string;
    storyEyebrow: string;
    teamEyebrow: string;
    teamTitle: string;
    menuEyebrow: string;
    menuTitle: string;
    galleryEyebrow: string;
    galleryTitle: string;
    videosEyebrow: string;
    videosTitle: string;
    offersEyebrow: string;
    offersTitle: string;
    homeServicesEyebrow: string;
    homeServicesTitle: string;
    reviewsEyebrow: string;
    reviewsTitle: string;
    wishlistTitle: string;
    bookingTitle: string;
  };
  seo: {
    title: string;
    description: string;
    ogImage: string;
    language: string;
  };
}

export type SocialPostPostConfig = SocialPostConfig;
