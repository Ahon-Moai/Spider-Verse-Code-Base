import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { CartItem, FragranceProduct, OrderQuoteResponse } from '../types';
import { fetchOrderQuote } from '../services/api';
import {
  getItemMaxStock,
  getShippingConfig,
} from '../utils/checkout';

interface ShoppingBagPageProps {
  items: CartItem[];
  appliedCoupon: string;
  onChangeCoupon: (code: string) => void;
  storeSettings?: any;
  onUpdateQty: (productId: string, size: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onNavigateToProduct: (product: FragranceProduct) => void;
  onProceedToCheckout: () => void;
}

export const ShoppingBagPage: React.FC<ShoppingBagPageProps> = ({
  items,
  appliedCoupon,
  onChangeCoupon,
  storeSettings,
  onUpdateQty,
  onRemoveItem,
  onNavigateHome,
  onNavigateShop,
  onNavigateToProduct,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState(appliedCoupon);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [quote, setQuote] = useState<OrderQuoteResponse | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.title = 'Your Shopping Bag — SPIDER VERSE';
  }, []);

  useEffect(() => {
    setCouponInput(appliedCoupon);
  }, [appliedCoupon]);

  const { currencySymbol } = getShippingConfig(storeSettings);

  useEffect(() => {
    let active = true;
    if (items.length === 0) {
      setQuote(null);
      return;
    }

    fetchOrderQuote({
      city_zone: 'outside_dhaka',
      coupon_code: appliedCoupon || undefined,
      items: items.map((it) => ({
        product_id: it.product.id,
        selected_size: it.selectedSize,
        quantity: it.quantity,
      })),
    }).then((res) => {
      if (!active || !res) return;
      setQuote(res);
      if (appliedCoupon && res.coupon_error) {
        setCouponFeedback({ type: 'error', message: res.coupon_error });
      } else if (appliedCoupon && res.coupon_applied) {
        setCouponFeedback({
          type: 'success',
          message: `Coupon ${res.coupon_code} applied (-${currencySymbol} ${res.discount.toLocaleString()})`,
        });
      }
    });

    return () => {
      active = false;
    };
  }, [items, appliedCoupon, currencySymbol]);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const localSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const subtotal = quote ? quote.subtotal : localSubtotal;
  const discount = quote ? quote.discount : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = couponInput.trim().toUpperCase();
    if (!cleaned) {
      setCouponFeedback({
        type: 'error',
        message: 'Please enter a coupon code.',
      });
      return;
    }

    setApplyingCoupon(true);
    setCouponFeedback(null);
    try {
      const res = await fetchOrderQuote({
        city_zone: 'outside_dhaka',
        coupon_code: cleaned,
        items: items.map((it) => ({
          product_id: it.product.id,
          selected_size: it.selectedSize,
          quantity: it.quantity,
        })),
      });

      if (!res) {
        setCouponFeedback({
          type: 'error',
          message: 'Unable to validate coupon right now. It will be verified at checkout.',
        });
        return;
      }

      setQuote(res);
      if (res.coupon_applied && res.coupon_code) {
        onChangeCoupon(res.coupon_code);
        setCouponFeedback({
          type: 'success',
          message: `Coupon ${res.coupon_code} applied (-${currencySymbol} ${res.discount.toLocaleString()})`,
        });
      } else {
        onChangeCoupon('');
        setCouponFeedback({
          type: 'error',
          message: res.coupon_error || 'Invalid or ineligible coupon code.',
        });
      }
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    onChangeCoupon('');
    setCouponInput('');
    setCouponFeedback(null);
  };

  return (
    <div className="bg-[#F4F2EE] text-[#08090B] min-h-[75vh] selection:bg-[#E10600] selection:text-white">
      {/* Dark Breadcrumb Bar */}
      <div className="bg-[#08090B] text-[#C4C9D4] border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 truncate">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
            <span className="text-white font-semibold uppercase tracking-wider truncate">
              Shopping Bag
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateShop}
            className="hidden sm:flex items-center gap-1.5 text-[#C4C9D4] hover:text-[#E10600] transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#08090B] pb-4 mb-8 gap-3">
          <div>
            <span className="font-mono text-[11px] tracking-[0.2em] text-[#E10600] uppercase font-semibold block">
              Order Review
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#08090B] uppercase leading-none mt-1">
              Your Shopping Bag
            </h1>
          </div>

          {items.length > 0 && (
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-600 tabular-nums">
              {totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'} in Bag
            </p>
          )}
        </div>

        {/* Empty Cart State (No Order Summary Rendered) */}
        {items.length === 0 ? (
          <div className="bg-white border border-zinc-300 px-6 py-16 sm:py-24 text-center">
            <div className="max-w-md mx-auto space-y-5">
              <div className="w-16 h-16 mx-auto bg-[#F4F2EE] border border-zinc-300 flex items-center justify-center text-[#08090B]">
                <ShoppingBag className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="font-display font-bold text-3xl sm:text-4xl uppercase text-[#08090B] tracking-tight">
                  Your bag is looking a little empty.
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Explore our latest Formula 1 diecast collectibles and RC models to add items to your bag.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNavigateShop}
                  className="btn-f1 inline-flex items-center justify-center bg-[#E10600] hover:bg-[#ff1e18] text-white px-8 py-3.5 font-display text-base font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer"
                >
                  <span className="btn-f1-inner">
                    <span>Continue Shopping</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Shopping Bag Items */}
            <div className="lg:col-span-8 space-y-4">
              {/* Cart Items List */}
              <div className="bg-white border border-zinc-300 divide-y divide-zinc-200">
                {items.map((item) => {
                  const key = `${item.product.id}-${item.selectedSize}`;
                  const quoteItem = quote?.items?.find(
                    (qi) =>
                      qi.product_id === item.product.id &&
                      qi.selected_size === item.selectedSize
                  );
                  const unitPrice = quoteItem ? quoteItem.unit_price : item.price;
                  const lineSubtotal = unitPrice * item.quantity;

                  const localMaxStock = getItemMaxStock(
                    item.product,
                    item.selectedSize
                  );
                  const serverMaxStock =
                    quoteItem && quoteItem.available_stock > 0
                      ? quoteItem.available_stock
                      : null;
                  const maxStock = serverMaxStock ?? localMaxStock;
                  const atMaxStock =
                    maxStock !== null && item.quantity >= maxStock;
                  const imgFailed = imageErrors[key];

                  return (
                    <div
                      key={key}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center"
                    >
                      {/* Product Image Linking to Product Page */}
                      <a
                        href={`/products/${item.product.slug || item.product.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigateToProduct(item.product);
                        }}
                        className="w-24 h-24 sm:w-28 sm:h-28 bg-[#FAF9F6] border border-zinc-200 p-2.5 shrink-0 flex items-center justify-center overflow-hidden hover:border-[#08090B] transition-colors"
                      >
                        {!imgFailed && item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="max-h-full max-w-full object-contain"
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setImageErrors((prev) => ({
                                ...prev,
                                [key]: true,
                              }))
                            }
                          />
                        ) : (
                          <ShoppingBag className="w-7 h-7 text-zinc-400" />
                        )}
                      </a>

                      {/* Details & Controls */}
                      <div className="flex-1 min-w-0 w-full space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-zinc-500 truncate">
                              {item.product.brand}
                              {item.product.category ? ` · ${item.product.category}` : ''}
                            </p>
                            <a
                              href={`/products/${item.product.slug || item.product.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                onNavigateToProduct(item.product);
                              }}
                              className="font-display text-xl sm:text-2xl font-bold uppercase text-[#08090B] hover:text-[#E10600] transition-colors block leading-tight mt-0.5 break-words"
                            >
                              {item.product.name}
                            </a>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-zinc-600 font-mono">
                              <span>
                                Variant: <strong className="text-[#08090B]">{item.selectedSize}</strong>
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">
                                Unit: {currencySymbol} {unitPrice.toLocaleString()}
                              </span>
                              {maxStock !== null && maxStock <= 10 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-amber-700 font-semibold tabular-nums">
                                    {maxStock} in stock
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              onRemoveItem(item.product.id, item.selectedSize)
                            }
                            aria-label={`Remove ${item.product.name}`}
                            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-[#E10600] transition-colors py-1 px-2 -mr-2 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>

                        {/* Bottom Row: Quantity Stepper + Item Subtotal */}
                        <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-100">
                          <div className="flex items-center gap-3">
                            <div
                              className="inline-flex items-center border border-zinc-300 bg-[#F4F2EE]"
                              role="group"
                              aria-label={`Quantity for ${item.product.name}`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQty(item.product.id, item.selectedSize, -1)
                                }
                                className="w-10 h-10 flex items-center justify-center text-[#08090B] hover:bg-zinc-200 transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-10 text-center font-mono text-xs font-bold text-[#08090B] tabular-nums select-none">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQty(item.product.id, item.selectedSize, 1)
                                }
                                disabled={atMaxStock}
                                className="w-10 h-10 flex items-center justify-center text-[#08090B] hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                                aria-label="Increase quantity"
                                title={
                                  atMaxStock
                                    ? `Maximum available stock (${maxStock}) reached`
                                    : 'Increase quantity'
                                }
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {atMaxStock && (
                              <span className="text-[11px] font-mono text-amber-700">
                                Max stock reached
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block">
                              Item Subtotal
                            </span>
                            <span className="font-mono text-base sm:text-lg font-bold text-[#08090B] tabular-nums">
                              {currencySymbol} {lineSubtotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNavigateShop}
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-zinc-600 hover:text-[#E10600] transition-colors cursor-pointer py-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Shopping</span>
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <aside className="lg:col-span-4 lg:sticky lg:top-20">
              <div className="bg-white border border-zinc-300 p-6 space-y-6">
                <div className="border-b border-zinc-200 pb-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-2xl uppercase text-[#08090B]">
                    Order Summary
                  </h2>
                  <span className="font-mono text-[11px] text-zinc-500 uppercase tabular-nums">
                    {totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'}
                  </span>
                </div>

                {/* Coupon / Promo Code */}
                <div className="space-y-2">
                  <label
                    htmlFor="bag-coupon-input"
                    className="block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600 font-semibold"
                  >
                    Promo / Coupon Code
                  </label>

                  {appliedCoupon && quote?.coupon_applied ? (
                    <div className="flex items-center justify-between gap-2 bg-[#FAF9F6] border border-emerald-700/40 px-3 py-2.5 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Tag className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="font-mono font-bold text-emerald-800 truncate">
                          {appliedCoupon}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-zinc-500 hover:text-[#E10600] p-1 cursor-pointer"
                        aria-label="Remove coupon"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex items-stretch gap-2">
                      <input
                        id="bag-coupon-input"
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 min-w-0 bg-[#F4F2EE] border border-zinc-300 px-3 py-2.5 text-xs font-mono uppercase text-[#08090B] placeholder:normal-case placeholder:text-zinc-400 focus:outline-none focus:border-[#08090B]"
                      />
                      <button
                        type="submit"
                        disabled={applyingCoupon}
                        className="px-4 py-2.5 bg-[#08090B] hover:bg-zinc-800 text-white font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {applyingCoupon ? 'Checking...' : 'Apply'}
                      </button>
                    </form>
                  )}

                  {couponFeedback && (
                    <p
                      className={`text-[11px] font-medium ${
                        couponFeedback.type === 'success'
                          ? 'text-emerald-700'
                          : 'text-[#E10600]'
                      }`}
                    >
                      {couponFeedback.message}
                    </p>
                  )}
                </div>

                {/* Totals Breakdown */}
                <div className="space-y-2.5 pt-4 border-t border-zinc-200 text-xs">
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Products Subtotal</span>
                    <span className="font-mono font-semibold text-[#08090B] tabular-nums">
                      {currencySymbol} {subtotal.toLocaleString()}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Discount{appliedCoupon ? ` (${appliedCoupon})` : ''}</span>
                      <span className="font-mono font-semibold tabular-nums">
                        -{currencySymbol} {discount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline justify-between pt-3 border-t border-zinc-300">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#08090B]">
                      Subtotal
                    </span>
                    <span className="font-mono text-2xl font-bold text-[#08090B] tabular-nums">
                      {currencySymbol} {finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={onProceedToCheckout}
                  className="btn-f1 w-full bg-[#E10600] hover:bg-[#ff1e18] text-white py-3.5 px-6 font-display text-base font-bold tracking-[0.08em] uppercase flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="btn-f1-inner">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};
