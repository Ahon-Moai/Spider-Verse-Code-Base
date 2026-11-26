import { FragranceProduct } from '../types';

export type DeliveryZone = 'outside_dhaka' | 'inside_dhaka';

export function getItemMaxStock(
  product: FragranceProduct,
  selectedSize: string
): number | null {
  const matchedVariant = product.sizes?.find((s) => s.size === selectedSize);
  if (matchedVariant && typeof matchedVariant.stock_qty === 'number' && matchedVariant.stock_qty > 0) {
    return matchedVariant.stock_qty;
  }
  if (typeof product.inventoryQty === 'number' && product.inventoryQty > 0) {
    return product.inventoryQty;
  }
  return null;
}

export function getShippingConfig(storeSettings?: any) {
  const parseNum = (val: any, fallback: number) => {
    const n = Number(val);
    return Number.isFinite(n) && n >= 0 && val !== '' && val !== null && val !== undefined
      ? n
      : fallback;
  };

  return {
    feeInside: parseNum(storeSettings?.shipping_fee_dhaka, 70),
    feeOutside: parseNum(storeSettings?.shipping_fee_outside_dhaka, 130),
    freeThreshold: parseNum(storeSettings?.free_shipping_threshold, 3000),
    currencySymbol: storeSettings?.currency_symbol || '৳',
  };
}

export function formatZoneLabel(zone?: string): string {
  const normalized = (zone || '').toLowerCase().trim();
  if (normalized === 'inside_dhaka' || normalized === 'inside_chittagong') {
    return 'Inside Chittagong';
  }
  return 'Outside Chittagong';
}

export function formatPaymentLabel(_method?: string): string {
  return 'Cash on Delivery';
}
