export interface DecantSize {
  id?: string;
  size: string; // e.g. "3ml", "5ml", "9ml", "15ml"
  price: number; // in BDT (৳)
  stock_qty?: number;
  image?: string; // custom size/bottle image URL
}

export interface FragranceAttribute {
  id: string;
  name: string; // e.g. "Longevity", "Sillage", "Projection", "Intensity"
  value: number; // 0 to 100 percentage
  enabled: boolean;
}

export interface MainAccord {
  id?: string;
  name: string; // e.g. "iris", "woody", "powdery"
  color: string; // Hex color code e.g. "#b4a3db"
  intensity: number; // 0 to 100 percentage bar length
}

export interface ScentProfile {
  fragranceFamilies?: string[];
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];
  seasons?: string[];
  occasions?: string[];
  moods?: string[];
  intensity?: string;
  projection?: string;
  longevity?: string;
  concentration?: string;
  genderPositioning?: string;
  daytimeNighttime?: string[];
  sweetness?: string;
  scentDescription?: string;
  recommendationExplanation?: string;
  accords?: MainAccord[];
}

export interface FragranceProduct {
  id: string;
  brand: string;
  name: string;
  slug?: string;
  category: string; // e.g. "Woody", "Floral", "Gourmand", "Amber"
  gender?: "Him" | "Her" | "Unisex";
  startingPrice: number;
  image: string;
  images?: string[];
  additionalImages?: string[];
  notes?: string[];
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];
  attributes?: FragranceAttribute[];
  accords?: MainAccord[];
  scentProfile?: ScentProfile;
  scent_profile?: ScentProfile;
  sizes: DecantSize[];
  concentration?: string; // e.g. "Eau de Parfum", "Extrait de Parfum"
  shortDescription?: string;
  description?: string;
  inventoryQty?: number;
}

export interface CartItem {
  product: FragranceProduct;
  selectedSize: string;
  price: number;
  quantity: number;
}

export interface OrderQuoteItem {
  product_id: string;
  product_name: string;
  brand_name: string;
  selected_size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  available_stock: number;
}

export type AdvancePaymentMethod = 'bkash' | 'nagad' | 'bank_transfer';

export type PaymentVerificationStatus = 'pending_verification' | 'verified' | 'rejected';

export interface OrderQuoteResponse {
  items: OrderQuoteItem[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total_amount: number;
  advance_amount?: number;
  remaining_cod_amount?: number;
  shipping_fee_dhaka: number;
  shipping_fee_outside_dhaka: number;
  free_shipping_threshold: number;
  coupon_applied: boolean;
  coupon_code: string | null;
  coupon_error: string | null;
  stock_issues: Array<{
    product_id: string;
    product_name: string;
    selected_size: string;
    requested_qty: number;
    available_stock: number;
  }>;
}

export interface CompletedOrderData {
  order_number: string;
  customer_name: string;
  customer_phone?: string;
  whatsapp_number?: string;
  customer_email?: string;
  shipping_address?: string;
  city_zone?: string;
  subtotal: number;
  discount?: number;
  delivery_fee?: number;
  total_amount: number;
  advance_amount?: number;
  remaining_cod_amount?: number;
  payment_method: string;
  sender_number?: string;
  transaction_ref?: string;
  payment_note?: string;
  payment_verification_status?: PaymentVerificationStatus;
  payment_rejection_reason?: string | null;
  status: string;
  order_status?: string;
  created_at?: string;
  items?: Array<{
    product_id?: string;
    product_name: string;
    brand_name?: string;
    selected_size: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
}

export interface ReviewItem {
  id: string;
  quote: string;
  content: string;
  author: string;
  rating: number;
  verified?: boolean;
}

export interface SocialCard {
  id: string;
  handle: string;
  image: string;
  likes: number;
  comments: number;
  tag?: string;
}

export interface JournalArticle {
  id: string;
  date: string;
  publisher: string;
  title: string;
  description: string;
  image: string;
}

export interface VideoShowcaseCard {
  id: string;
  product_id?: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  display_order?: number;
  is_enabled?: boolean;
}

export interface VideoShowcaseSectionData {
  headline?: string;
  tagline?: string;
  badge_text?: string;
  is_enabled?: boolean;
  cards?: VideoShowcaseCard[];
}

export interface CampaignBannersData {
  section_title?: string;
  for_him_title?: string;
  for_him_button_text?: string;
  for_him_image?: string;
  for_her_title?: string;
  for_her_button_text?: string;
  for_her_image?: string;
}

export interface SeasonCardData {
  id: string;
  name: string;
  description: string;
  image: string;
  slug?: string;
  alt?: string;
}

export interface SeasonsGalleryData {
  section_title?: string;
  section_subtitle?: string;
  cards?: SeasonCardData[];
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  rule_type?: 'manual' | 'gender' | 'category' | 'featured' | 'new_arrival' | 'all';
  rule_value?: string;
  display_order?: number;
  is_enabled?: boolean;
  mapped_product_ids?: string[];
}

export interface FilterState {
  gender: string[];
  family: string[];
  season: string[];
  occasion: string[];
  brand: string[];
  size: string[];
  concentration: string[];
  minPrice: string;
  maxPrice: string;
  featured: boolean;
  newArrival: boolean;
  sort: string;
  search: string;
}
