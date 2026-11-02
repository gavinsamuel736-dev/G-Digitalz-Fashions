export type Currency = 'UGX' | 'USD';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  display_order: number;
  is_published: number | boolean;
  product_count?: number;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  tagline: string;
  category_id?: string;
  category?: string;
  category_name?: string;
  price_ugx?: number;
  priceUGX: number;
  compare_at_price_ugx?: number | null;
  compareAtPriceUGX?: number | null;
  price_usd?: number;
  priceUSD: number;
  image: string;
  gallery: string[];
  description: string;
  fabric: string;
  details: string[];
  care: string[];
  availableSizes: string[];
  colors?: string[];
  stock_quantity?: number;
  stockQuantity?: number;
  inStock: boolean;
  is_in_stock?: number;
  featured?: boolean;
  is_featured?: number;
  isNewArrival?: boolean;
  is_new_arrival?: number;
  badge?: string | null;
  rating: number;
  reviewCount: number;
  review_count?: number;
  is_published?: number | boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  color?: string;
  quantity: number;
}

export interface Review {
  id: string;
  product_id?: string;
  productName: string;
  product_name?: string;
  author: string;
  location: string;
  rating: number;
  date?: string;
  created_at?: string;
  title: string;
  comment: string;
  status?: 'pending' | 'approved' | 'rejected';
  verifiedBuyer: boolean;
  verified_buyer?: number | boolean;
  likes: number;
}

export type ViewType =
  | 'home'
  | 'catalogue'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'reviews'
  | 'admin'
  | 'order-success';

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  landmark: string;
  city: string;
  district: string;
  deliveryMethod: string;
  deliveryZoneId?: string;
  deliveryNotes?: string;
}

export type PaymentMethodType = 'mtn-momo' | 'airtel-money' | 'card' | 'cash-on-delivery';

export interface OrderItemSnapshot {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name_snapshot: string;
  size_snapshot: string;
  color_snapshot?: string;
  unit_price_ugx_snapshot: number;
  quantity: number;
  line_total_ugx: number;
  image_snapshot?: string;
}

export interface Order {
  id: string;
  order_number: string;
  orderNumber?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_landmark?: string;
  delivery_city: string;
  delivery_district: string;
  delivery_method: string;
  delivery_fee_ugx: number;
  delivery_notes?: string;
  subtotal_ugx: number;
  discount_ugx: number;
  total_ugx: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  payment_method: string;
  payment_status: 'Unpaid' | 'Pending Verification' | 'Paid' | 'Failed' | 'Refunded';
  momo_number?: string;
  internal_notes?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItemSnapshot[] | CartItem[];
}

export interface StoreBranding {
  storeName: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  physicalAddress: string;
  operatingHours: string;
  currencyPrimary: 'UGX';
  currencySecondary: 'USD';
  socialLinks: {
    instagram: string;
    facebook: string;
    x: string;
  };
  policies: {
    returnPolicy: string;
    privacyPolicy: string;
    termsConditions: string;
  };
}

export interface HomepageContent {
  headline: string;
  supportingText: string;
  heroBannerImage: string;
  primaryCtaText: string;
  primaryCtaDestination: string;
  secondaryCtaText: string;
  secondaryCtaDestination: string;
  announcementStrip: string;
  featuredCollectionTitle: string;
  featuredCollectionSubtitle: string;
  aboutSectionHeadline: string;
  aboutSectionStory: string;
  aboutSectionMetricsText: string;
  sectionVisibility: {
    announcement: boolean;
    hero: boolean;
    proofPillars: boolean;
    featuredProducts: boolean;
    categorySpotlight: boolean;
    craftsmanshipStory: boolean;
    customerReviews: boolean;
    newsletter: boolean;
  };
}

export interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackground: string;
  fontHeading: string;
  fontBody: string;
  buttonRadius: 'rounded-none' | 'rounded-xs' | 'rounded' | 'rounded-full';
  enablePromotionalBanner: boolean;
  themeMode: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  fee_ugx: number;
  estimated_time: string;
  free_threshold_ugx: number;
  is_active: number | boolean;
  display_order: number;
  notes?: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  provider: string;
  is_enabled: number | boolean;
  merchant_account?: string;
  instructions?: string;
  requires_verification: number | boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  full_name?: string;
  role: 'OWNER' | 'STAFF';
  permissions: string[];
  is_active?: number | boolean;
  created_at?: string;
  last_login?: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  target_type: string;
  target_id?: string;
  details?: any;
  created_at: string;
}
