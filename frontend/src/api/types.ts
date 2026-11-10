export interface ProductVariant {
  id?: string;
  product_id?: string;
  size: string; // e.g. "1:43 Scale", "1:18 Scale", "1:64 Pocket"
  price: number;
  cost_price?: number;
  sku?: string;
  stock_qty: number;
  image?: string;
  is_available?: number;
}

export interface GalleryImage {
  id?: number | string;
  product_id?: string;
  image_path: string;
  alt_text?: string | null;
  display_order?: number;
  is_primary?: number;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  slug: string;
  category: string;
  gender?: string; // used in backend schema as secondary category
  concentration?: string; // edition type e.g. "Diecast Carbon Edition", "Telemetry Spec"
  starting_price: number;
  cost_price?: number;
  short_description?: string;
  description?: string;
  image?: string;
  notes?: string[]; // Telemetry tags / features
  top_notes?: string[];
  heart_notes?: string[];
  base_notes?: string[];
  attributes?: Record<string, any>;
  scent_profile?: Record<string, any>;
  status?: string;
  inventory_qty?: number;
  is_featured?: number | boolean;
  is_new_arrival?: number | boolean;
  variants?: ProductVariant[];
  images?: string[];
  additional_images?: string[];
  gallery_images?: GalleryImage[];
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  rule_type?: string;
  rule_value?: string;
  display_order?: number;
  is_enabled?: number;
}

export interface StoreSettings {
  store_name?: string;
  tagline?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  currency?: string;
  currency_symbol?: string;
  shipping_fee_dhaka?: string;
  shipping_fee_outside_dhaka?: string;
  free_shipping_threshold?: string;
  enable_cod?: string;
  enable_bkash?: string;
  enable_nagad?: string;
  enable_card?: string;
  announcement_bar?: string;
  [key: string]: string | undefined;
}

export interface HomepageReview {
  id: string;
  quote: string;
  content: string;
  author: string;
  rating: number;
  verified: number;
}

export interface HomepageFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface HomepageArticle {
  id: string;
  title: string;
  date: string;
  publisher: string;
  description: string;
  image: string;
}

export interface HomepageSocialCard {
  id: string;
  handle: string;
  image: string;
  likes: number;
  comments: number;
  tag: string;
}

export interface HomepageSection {
  title?: string;
  subtitle?: string;
  content?: any;
}

export interface HomepageData {
  sections?: Record<string, HomepageSection>;
  reviews?: HomepageReview[];
  faqs?: HomepageFAQ[];
  articles?: HomepageArticle[];
  socialCards?: HomepageSocialCard[];
  brands?: Array<{ name: string; isNew?: boolean }>;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: string;
  product_name: string;
  brand_name?: string;
  selected_size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface OrderDetail {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  city_zone: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  errors?: string[] | null;
  status?: number;
}
