export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: 'Furniture' | 'Lighting' | 'Ceramics' | 'Textiles';
  price: number;
  originalPrice?: number;
  image: string;
  secondaryImage?: string;
  material: string;
  finish: string;
  dimensions: {
    height: string;
    width: string;
    depth: string;
    weight: string;
  };
  edition: string;
  inStock: boolean;
  leadTime: string;
  description: string;
  craftsmanshipNotes: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  hotspot?: {
    top: string;
    left: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedFinish?: string;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  verifiedPurchase: boolean;
  comment: string;
  productName: string;
}

export interface JournalArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  excerpt: string;
  image: string;
  author: string;
}

export interface FilterState {
  category: string;
  material: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating';
  searchQuery: string;
  inStockOnly: boolean;
}
