import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Loader2,
  ShoppingBag,
  Tag,
  X,
} from 'lucide-react';
import {
  CartItem,
  CompletedOrderData,
  OrderQuoteResponse,
} from '../types';
import {
  fetchOrderQuote,
  getErrorMessage,
  submitOrder,
} from '../services/api';
import {
  DeliveryZone,
  formatZoneLabel,
  getShippingConfig,
} from '../utils/checkout';

interface CheckoutPageProps {
  items: CartItem[];
  appliedCoupon: string;
  onChangeCoupon: (code: string) => void;
  storeSettings?: any;
  onNavigateHome: () => void;
  onNavigateToBag: () => void;
  onOrderSuccess: (order: CompletedOrderData) => void;
}

interface FieldErrors {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  streetAddress?: string;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  appliedCoupon,
  onChangeCoupon,
  storeSettings,
  onNavigateHome,
  onNavigateToBag,
  onOrderSuccess,
}) => {
  const { feeInside, feeOutside, freeThreshold, currencySymbol } =
    getShippingConfig(storeSettings);

  // ALWAYS defaults to Outside Chittagong on every checkout visit (never persisted)
  const [cityZone, setCityZone] = useState<DeliveryZone>('outside_dhaka');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const [couponInput, setCouponInput] = useState(appliedCoupon);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [quote, setQuote] = useState<OrderQuoteResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingLockRef = useRef(false);

  useEffect(() => {
    document.title = 'Checkout — SPIDER VERSE';
    // Guarantee default selection is Outside Chittagong on checkout mount
    setCityZone('outside_dhaka');
  }, []);

  // Redirect empty cart back to /cart
  useEffect(() => {
    if (items.length === 0) {
      onNavigateToBag();
    }
  }, [items.length, onNavigateToBag]);

  // Recalculate server-side totals whenever cart, delivery location, or coupon changes
  useEffect(() => {
    let active = true;
    if (items.length === 0) return;

    fetchOrderQuote({
      city_zone: cityZone,
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
  }, [items, cityZone, appliedCoupon, currencySymbol]);

  if (items.length === 0) {
    return null;
  }

  const localSubtotal = items.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );
  const subtotal = quote ? quote.subtotal : localSubtotal;
  const effectiveThreshold = quote?.free_shipping_threshold ?? freeThreshold;
  const effectiveFeeInside = quote?.shipping_fee_dhaka ?? feeInside;
  const effectiveFeeOutside = quote?.shipping_fee_outside_dhaka ?? feeOutside;

  // Immediate delivery charge calculation for instant feedback when switching locations
  const deliveryFee =
    subtotal >= effectiveThreshold
      ? 0
      : cityZone === 'outside_dhaka'
      ? effectiveFeeOutside
      : effectiveFeeInside;

  const discount = quote ? quote.discount : 0;
  const totalPayable = Math.max(0, subtotal - discount) + deliveryFee;
  const totalUnits = items.reduce((sum, it) => sum + it.quantity, 0);

  const handleApplyCoupon = async () => {
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
        city_zone: cityZone,
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
          message: 'Could not verify coupon right now.',
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
          message: res.coupon_error || 'Coupon code is not valid for this order.',
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

  const validateForm = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      errors.customerName = 'Please enter your full name.';
    }

    const normalizedPhone = customerPhone.replace(/[\s\-()]/g, '');
    if (!normalizedPhone || !/^\+?[0-9]{10,15}$/.test(normalizedPhone)) {
      errors.customerPhone = 'Please enter a valid 10–15 digit phone number.';
    }

    if (
      customerEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
    ) {
      errors.customerEmail = 'Please enter a valid email address.';
    }

    if (!streetAddress.trim() || streetAddress.trim().length < 5) {
      errors.streetAddress = 'Please enter your complete delivery address.';
    }

    return errors;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingLockRef.current || submitting) return;

    setSubmitError(null);
    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      document
        .getElementById(`field-${firstErrorField}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (cityZone !== 'outside_dhaka' && cityZone !== 'inside_dhaka') {
      setSubmitError('Please select a valid delivery location.');
      return;
    }

    submittingLockRef.current = true;
    setSubmitting(true);

    try {
      const cartPayloadItems = items.map((it) => ({
        product_id: it.product.id,
        selected_size: it.selectedSize,
        quantity: it.quantity,
      }));

      // Validate latest pricing & stock with backend prior to submission
      const latestQuote = await fetchOrderQuote({
        city_zone: cityZone,
        coupon_code: appliedCoupon || undefined,
        items: cartPayloadItems,
      });

      if (latestQuote) {
        setQuote(latestQuote);
        if (latestQuote.stock_issues && latestQuote.stock_issues.length > 0) {
          const issue = latestQuote.stock_issues[0];
          setSubmitError(
            `Only ${issue.available_stock} unit(s) available for ${issue.product_name} (${issue.selected_size}). Please update your bag quantity before placing the order.`
          );
          return;
        }
      }

      const formattedAddress = deliveryInstructions.trim()
        ? `${streetAddress.trim()} (Note: ${deliveryInstructions.trim()})`
        : streetAddress.trim();

      const result = await submitOrder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim(),
        shipping_address: formattedAddress,
        city_zone: cityZone,
        payment_method: 'cod',
        coupon_code:
          latestQuote && appliedCoupon && !latestQuote.coupon_applied
            ? undefined
            : appliedCoupon || undefined,
        items: cartPayloadItems,
      });

      if (result.success && result.data) {
        onOrderSuccess(result.data as CompletedOrderData);
      } else {
        setSubmitError(
          getErrorMessage(
            result?.error || result,
            'Could not place order. Please review your details and try again.'
          )
        );
      }
    } catch {
      setSubmitError(
        'Connection error while placing order. Your bag is safe — please try again.'
      );
    } finally {
      setSubmitting(false);
      submittingLockRef.current = false;
    }
  };

  const inputBaseCls =
    'w-full bg-[#F4F2EE] border px-3.5 py-2.5 text-sm text-[#212428] placeholder:text-zinc-400 focus:outline-none transition-colors';

  const selectedLocationLabel = formatZoneLabel(cityZone);

  return (
    <div className="bg-[#F4F2EE] text-[#212428] min-h-screen selection:bg-[#E10600] selection:text-white">
      {/* Dark Breadcrumb Bar */}
      <div className="bg-[#212428] text-[#C4C9D4] border-b border-white/10">
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
            <button
              type="button"
              onClick={onNavigateToBag}
              className="hover:text-white transition-colors uppercase tracking-wider cursor-pointer shrink-0"
            >
              Shopping Bag
            </button>
            <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
            <span className="text-white font-semibold uppercase tracking-wider truncate">
              Checkout
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateToBag}
            className="flex items-center gap-1.5 text-[#C4C9D4] hover:text-[#E10600] transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Bag</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#212428] pb-4 mb-8 gap-3">
          <div>
            <span className="font-mono text-[11px] tracking-[0.2em] text-[#E10600] uppercase font-semibold block">
              Order Placement
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#212428] uppercase leading-none mt-1">
              Checkout
            </h1>
          </div>

          <p className="font-mono text-xs uppercase tracking-wider text-zinc-600 tabular-nums">
            {totalUnits} {totalUnits === 1 ? 'Item' : 'Items'} · {currencySymbol}{' '}
            {totalPayable.toLocaleString()}
          </p>
        </div>

        {submitError && (
          <div
            role="alert"
            className="mb-6 bg-red-50 border border-[#E10600] px-4 py-3.5 text-xs sm:text-sm text-[#E10600] font-medium"
          >
            {submitError}
          </div>
        )}

        <form
          id="dedicated-checkout-form"
          onSubmit={handlePlaceOrder}
          noValidate
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start"
        >
          {/* Left Column: Customer Info, Delivery Location & Address, COD Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 01 – Customer Information */}
            <section className="bg-white border border-zinc-300 p-6 sm:p-7 space-y-5">
              <div className="border-b border-zinc-200 pb-3 flex items-baseline justify-between">
                <h2 className="font-display font-bold text-2xl uppercase text-[#212428]">
                  01. Customer Information
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  Required Fields *
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5" id="field-customerName">
                  <label
                    htmlFor="checkout-name"
                    className="block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-700 font-semibold"
                  >
                    Full Name *
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (fieldErrors.customerName) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          customerName: undefined,
                        }));
                      }
                    }}
                    placeholder="Enter your full name"
                    className={`${inputBaseCls} ${
                      fieldErrors.customerName
                        ? 'border-[#E10600] focus:border-[#E10600]'
                        : 'border-zinc-300 focus:border-[#212428]'
                    }`}
                  />
                  {fieldErrors.customerName && (
                    <p className="text-[11px] text-[#E10600] font-medium">
                      {fieldErrors.customerName}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5" id="field-customerPhone">
                  <label
                    htmlFor="checkout-phone"
                    className="block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-700 font-semibold"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (fieldErrors.customerPhone) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          customerPhone: undefined,
                        }));
                      }
                    }}
                    placeholder="01700000000"
                    className={`${inputBaseCls} font-mono ${
                      fieldErrors.customerPhone
                        ? 'border-[#E10600] focus:border-[#E10600]'
                        : 'border-zinc-300 focus:border-[#212428]'
                    }`}
                  />
                  {fieldErrors.customerPhone && (
                    <p className="text-[11px] text-[#E10600] font-medium">
                      {fieldErrors.customerPhone}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5" id="field-customerEmail">
                  <label
                    htmlFor="checkout-email"
                    className="block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-700 font-semibold"
                  >
                    Email Address (Optional)
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (fieldErrors.customerEmail) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          customerEmail: undefined,
                        }));
                      }
                    }}
                    placeholder="you@example.com"
                    className={`${inputBaseCls} ${
                      fieldErrors.customerEmail
                        ? 'border-[#E10600] focus:border-[#E10600]'
                        : 'border-zinc-300 focus:border-[#212428]'
                    }`}
                  />
                  {fieldErrors.customerEmail && (
                    <p className="text-[11px] text-[#E10600] font-medium">
                      {fieldErrors.customerEmail}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 02 – Delivery Location & Address */}
            <section className="bg-white border border-zinc-300 p-6 sm:p-7 space-y-5">
              <div className="border-b border-zinc-200 pb-3 flex items-baseline justify-between">
                <h2 className="font-display font-bold text-2xl uppercase text-[#212428]">
                  02. Delivery Location
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {selectedLocationLabel}
                </span>
              </div>

              {/* Two Mutually Exclusive Delivery Location Cards */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
                role="radiogroup"
                aria-label="Delivery Location"
              >
                {/* Option 1: Outside Chittagong (Always Default) */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={cityZone === 'outside_dhaka'}
                  onClick={() => setCityZone('outside_dhaka')}
                  className={`p-4 sm:p-5 border-2 text-left transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                    cityZone === 'outside_dhaka'
                      ? 'border-[#E10600] bg-[#FAF9F6]'
                      : 'border-zinc-200 bg-white hover:border-[#212428]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 w-5 h-5 border flex items-center justify-center shrink-0 transition-colors ${
                        cityZone === 'outside_dhaka'
                          ? 'border-[#E10600] bg-[#E10600] text-white'
                          : 'border-zinc-400 bg-white'
                      }`}
                    >
                      {cityZone === 'outside_dhaka' && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-[#212428] block">
                        Outside Chittagong
                      </span>
                      <span className="text-xs text-zinc-600 block mt-0.5">
                        Nationwide courier delivery
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-bold text-[#212428] tabular-nums shrink-0">
                    {subtotal >= effectiveThreshold
                      ? 'FREE'
                      : `${currencySymbol} ${effectiveFeeOutside}`}
                  </span>
                </button>

                {/* Option 2: Inside Chittagong */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={cityZone === 'inside_dhaka'}
                  onClick={() => setCityZone('inside_dhaka')}
                  className={`p-4 sm:p-5 border-2 text-left transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                    cityZone === 'inside_dhaka'
                      ? 'border-[#E10600] bg-[#FAF9F6]'
                      : 'border-zinc-200 bg-white hover:border-[#212428]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 w-5 h-5 border flex items-center justify-center shrink-0 transition-colors ${
                        cityZone === 'inside_dhaka'
                          ? 'border-[#E10600] bg-[#E10600] text-white'
                          : 'border-zinc-400 bg-white'
                      }`}
                    >
                      {cityZone === 'inside_dhaka' && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-[#212428] block">
                        Inside Chittagong
                      </span>
                      <span className="text-xs text-zinc-600 block mt-0.5">
                        City area delivery
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-bold text-[#212428] tabular-nums shrink-0">
                    {subtotal >= effectiveThreshold
                      ? 'FREE'
                      : `${currencySymbol} ${effectiveFeeInside}`}
                  </span>
                </button>
              </div>

              <div className="space-y-1.5 pt-1" id="field-streetAddress">
                <label
                  htmlFor="checkout-address"
                  className="block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-700 font-semibold"
                >
                  Complete Delivery Address *
                </label>
                <textarea
                  id="checkout-address"
                  rows={3}
                  required
                  autoComplete="street-address"
                  value={streetAddress}
                  onChange={(e) => {
                    setStreetAddress(e.target.value);
                    if (fieldErrors.streetAddress) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        streetAddress: undefined,
                      }));
                    }
                  }}
                  placeholder="House #, Road #, Area / Thana, District"
                  className={`${inputBaseCls} resize-y ${
                    fieldErrors.streetAddress
                      ? 'border-[#E10600] focus:border-[#E10600]'
                      : 'border-zinc-300 focus:border-[#212428]'
                  }`}
                />
                {fieldErrors.streetAddress && (
                  <p className="text-[11px] text-[#E10600] font-medium">
                    {fieldErrors.streetAddress}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="checkout-instructions"
                  className="block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-700 font-semibold"
                >
                  Delivery Instructions (Optional)
                </label>
                <input
                  id="checkout-instructions"
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="Optional notes for courier or delivery time preference"
                  className={`${inputBaseCls} border-zinc-300 focus:border-[#212428]`}
                />
              </div>
            </section>

            {/* Section 03 – Payment Method (Cash on Delivery Only) */}
            <section className="bg-white border border-zinc-300 p-6 sm:p-7 space-y-4">
              <div className="border-b border-zinc-200 pb-3">
                <h2 className="font-display font-bold text-2xl uppercase text-[#212428]">
                  03. Payment Method
                </h2>
              </div>

              <div className="p-4 sm:p-5 border-2 border-[#212428] bg-[#FAF9F6] flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 w-5 h-5 bg-[#212428] text-white flex items-center justify-center shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#212428]">
                      Cash on Delivery
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Pay when your order arrives.
                    </p>
                  </div>
                </div>

                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-600 shrink-0">
                  COD
                </span>
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Order Summary + Place Order CTA */}
          <aside className="lg:col-span-5 lg:sticky lg:top-20">
            <div className="bg-white border border-zinc-300 p-6 space-y-5">
              <div className="border-b border-zinc-200 pb-3 flex items-center justify-between">
                <h2 className="font-display font-bold text-2xl uppercase text-[#212428]">
                  Order Summary
                </h2>
                <button
                  type="button"
                  onClick={onNavigateToBag}
                  className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 hover:text-[#E10600] underline cursor-pointer"
                >
                  Edit Bag
                </button>
              </div>

              {/* Ordered Items */}
              <div className="divide-y divide-zinc-200 max-h-[320px] overflow-y-auto pr-1">
                {items.map((item) => {
                  const quoteItem = quote?.items?.find(
                    (qi) =>
                      qi.product_id === item.product.id &&
                      qi.selected_size === item.selectedSize
                  );
                  const unitPrice = quoteItem ? quoteItem.unit_price : item.price;
                  const lineTotal = unitPrice * item.quantity;

                  return (
                    <div
                      key={`${item.product.id}-${item.selectedSize}`}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3.5"
                    >
                      <div className="w-16 h-16 bg-[#FAF9F6] border border-zinc-200 p-1.5 shrink-0 flex items-center justify-center">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="max-h-full max-w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-display text-base font-bold uppercase text-[#212428] truncate">
                          {item.product.name}
                        </p>
                        <p className="font-mono text-[11px] text-zinc-500 mt-0.5 tabular-nums">
                          {item.selectedSize} · Qty {item.quantity} × {currencySymbol}{' '}
                          {unitPrice.toLocaleString()}
                        </p>
                      </div>

                      <span className="font-mono text-xs sm:text-sm font-bold text-[#212428] tabular-nums shrink-0">
                        {currencySymbol} {lineTotal.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Input */}
              <div className="pt-4 border-t border-zinc-200 space-y-2">
                {appliedCoupon && quote?.coupon_applied ? (
                  <div className="flex items-center justify-between gap-2 bg-[#FAF9F6] border border-emerald-700/40 px-3 py-2 text-xs">
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
                  <div className="flex items-stretch gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      placeholder="Coupon code (optional)"
                      aria-label="Coupon code"
                      className="flex-1 min-w-0 bg-[#F4F2EE] border border-zinc-300 px-3 py-2 text-xs font-mono uppercase text-[#212428] placeholder:normal-case placeholder:text-zinc-400 focus:outline-none focus:border-[#212428]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon}
                      className="px-4 py-2 bg-[#212428] hover:bg-zinc-800 text-white font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
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

              {/* Totals */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-200 text-xs">
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Products Subtotal</span>
                  <span className="font-mono font-semibold text-[#212428] tabular-nums">
                    {currencySymbol} {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-600">
                  <span>Delivery Location</span>
                  <span className="font-semibold text-[#212428]">
                    {selectedLocationLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-600">
                  <span>Delivery Charge</span>
                  <span className="font-mono font-semibold text-[#212428] tabular-nums">
                    {deliveryFee === 0
                      ? 'FREE'
                      : `${currencySymbol} ${deliveryFee.toLocaleString()}`}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-mono font-semibold tabular-nums">
                      -{currencySymbol} {discount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-zinc-600">
                  <span>Payment Method</span>
                  <span className="font-semibold text-[#212428]">
                    Cash on Delivery
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-3 border-t border-zinc-300">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#212428]">
                    Final Payable Amount
                  </span>
                  <span className="font-mono text-2xl font-bold text-[#212428] tabular-nums">
                    {currencySymbol} {totalPayable.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-f1 w-full bg-[#E10600] hover:bg-[#ff1e18] text-white py-4 px-6 font-display text-base font-bold tracking-[0.08em] uppercase flex items-center justify-center transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="btn-f1-inner">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};
