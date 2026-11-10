import { apiRequest } from './client';
import {
  Product,
  Collection,
  StoreSettings,
  HomepageData,
  OrderDetail,
  OrderItem,
} from './types';

export interface ProductFilters {
  id?: string;
  slug?: string;
  category?: string;
  gender?: string;
  featured?: boolean | number;
  new_arrival?: boolean | number;
  search?: string;
}

/**
 * Fetch product catalog with optional filtering
 */
export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.gender) params.set('gender', filters.gender);
  if (filters.featured) params.set('featured', '1');
  if (filters.new_arrival) params.set('new_arrival', '1');
  if (filters.search) params.set('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const data = await apiRequest<Product[] | Product>(`/products.php${query}`);
  // If API returns single product when 'id' or 'slug' passed, normalize to array or return list
  return Array.isArray(data) ? data : [data];
}

/**
 * Fetch a single product by slug or id
 */
export async function getProductBySlugOrId(slugOrId: string): Promise<Product | null> {
  try {
    // Try by slug first
    const data = await apiRequest<Product>(`/products.php?slug=${encodeURIComponent(slugOrId)}`);
    if (data && data.id) return data;
  } catch (err: any) {
    // If not found by slug, try by ID
    try {
      const dataById = await apiRequest<Product>(`/products.php?id=${encodeURIComponent(slugOrId)}`);
      if (dataById && dataById.id) return dataById;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Fetch all collections
 */
export async function getCollections(): Promise<Collection[]> {
  const data = await apiRequest<Collection[] | Collection>('/collections.php');
  return Array.isArray(data) ? data : [data];
}

/**
 * Fetch single collection by slug or ID
 */
export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    const data = await apiRequest<Collection>(`/collections.php?slug=${encodeURIComponent(slug)}`);
    return data || null;
  } catch {
    return null;
  }
}

/**
 * Fetch public homepage CMS sections
 */
export async function getHomepageData(): Promise<HomepageData> {
  return await apiRequest<HomepageData>('/homepage.php');
}

/**
 * Fetch public store settings (currency, contact, announcements)
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  return await apiRequest<StoreSettings>('/settings.php');
}

/**
 * Track an order by order number
 */
export async function trackOrder(orderNumber: string): Promise<{ order: OrderDetail; items: OrderItem[] }> {
  return await apiRequest<{ order: OrderDetail; items: OrderItem[] }>(
    `/orders.php?order_number=${encodeURIComponent(orderNumber)}`
  );
}

export * from './types';
export * from './client';
