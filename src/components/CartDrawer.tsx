import React, { useState } from 'react';
import { X, Trash2, ShieldCheck, ArrowRight, PackageCheck } from 'lucide-react';
import { CartItem } from '../types';
import { submitOrder, getErrorMessage } from '../services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (productId: string, size: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onClearCart?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [cityZone, setCityZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [paymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = 3000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const shippingFee =
    subtotal >= freeShippingThreshold ? 0 : cityZone === 'outside_dhaka' ? 130 : 70;
  const estimatedTotal = subtotal + shippingFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const orderPayload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      shipping_address: shippingAddress,
      city_zone: cityZone,
      payment_method: paymentMethod,
      items: items.map((it) => ({
        product_id: it.product.id,
        selected_size: it.selectedSize,
        quantity: it.quantity,
      })),
    };

    try {
      const result = await submitOrder(orderPayload);
      if (result.success && result.data) {
        setCompletedOrder(result.data);
        if (onClearCart) onClearCart();
      } else {
        setErrorMsg(
          getErrorMessage(result?.error || result, 'Failed to place order. Please try again.')
        );
      }
    } catch {
      setErrorMsg('Connection error during checkout. Please check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-md bg-[#F4F2EE] text-[#08090B] shadow-2xl flex flex-col justify-between border-l border-zinc-300">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#08090B] text-white">
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                Your Bag
              </h2>
              <p className="text-[11px] text-[#9CA3AF] font-mono tracking-[0.16em] uppercase mt-0.5 tabular-nums">
                {items.length} {items.length === 1 ? 'Model' : 'Models'} Selected
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close cart"
              className="p-2 border border-white/15 text-[#C4C9D4] hover:text-white hover:border-[#E10600] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Telemetry Bar */}
          {!completedOrder && (
            <div className="px-6 py-3.5 bg-[#111317] text-white border-b border-white/10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span>
                  {subtotal >= freeShippingThreshold ? (
                    <span className="text-emerald-400 font-semibold">
                      Free Wing-Protected Shipping Unlocked
                    </span>
                  ) : (
                    <span className="text-[#C4C9D4]">
                      Add <strong className="text-white font-mono">৳ {freeShippingThreshold - subtotal}</strong> for Free Shipping
                    </span>
                  )}
                </span>
                <span className="font-mono text-[11px] text-[#E10600] tabular-nums">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-1 bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#E10600] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Completed Order View */}
          {completedOrder ? (
            <div className="flex-1 p-8 text-center space-y-6 overflow-y-auto flex flex-col justify-center items-center bg-white">
              <div className="w-16 h-16 bg-[#08090B] text-[#E10600] flex items-center justify-center">
                <PackageCheck className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-[0.22em] text-emerald-700 uppercase font-bold">
                  Order Confirmed
                </span>
                <h3 className="font-display text-3xl text-[#08090B] font-black uppercase mt-1 tabular-nums">
                  {completedOrder.order_number}
                </h3>
                <p className="text-xs text-zinc-600 mt-2">
                  Thank you, <span className="font-semibold text-[#08090B]">{completedOrder.customer_name}</span>. Your F1 model allocation is queued for wing-safe packing.
                </p>
              </div>

              <div className="w-full bg-[#F4F2EE] border border-zinc-300 p-4 text-xs text-left space-y-2.5">
                <div className="flex justify-between text-zinc-600">
                  <span>Order Total</span>
                  <span className="font-mono font-bold text-[#08090B] tabular-nums">
                    ৳ {completedOrder.total_amount}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Payment Method</span>
                  <span className="font-mono uppercase font-medium text-[#08090B]">
                    {completedOrder.payment_method} (COD)
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Status</span>
                  <span className="font-mono text-emerald-700 font-bold uppercase">
                    {completedOrder.status}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Our pit garage team will verify delivery details via phone prior to courier dispatch.
              </p>

              <button
                type="button"
                onClick={() => {
                  setCompletedOrder(null);
                  setIsCheckoutOpen(false);
                  onClose();
                }}
                className="btn-f1 w-full py-3.5 bg-[#E10600] hover:bg-[#ff1e18] text-white font-display text-sm font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer"
              >
                <span className="btn-f1-inner">Continue Shopping</span>
              </button>
            </div>
          ) : isCheckoutOpen ? (
            /* Checkout Form */
            <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar bg-white">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <h3 className="font-display text-2xl font-bold uppercase text-[#08090B]">
                  Delivery Details
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-xs font-mono text-[#E10600] font-semibold hover:underline uppercase cursor-pointer"
                >
                  ← Back to Bag
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-[#E10600] text-[#E10600] text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full bg-[#F4F2EE] border border-zinc-300 px-3 py-2.5 text-[#08090B] focus:outline-none focus:border-[#08090B]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mb-1.5">
                    Phone Number (Confirmation) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01700000000"
                    className="w-full bg-[#F4F2EE] border border-zinc-300 px-3 py-2.5 text-[#08090B] font-mono focus:outline-none focus:border-[#08090B]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="collector@example.com"
                    className="w-full bg-[#F4F2EE] border border-zinc-300 px-3 py-2.5 text-[#08090B] focus:outline-none focus:border-[#08090B]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mb-1.5">
                    Delivery Zone *
                  </label>
                  <select
                    value={cityZone}
                    onChange={(e) => setCityZone(e.target.value as 'inside_dhaka' | 'outside_dhaka')}
                    className="w-full bg-[#F4F2EE] border border-zinc-300 px-3 py-2.5 text-[#08090B] font-mono focus:outline-none focus:border-[#08090B]"
                  >
                    <option value="inside_dhaka">Inside Dhaka (৳ 70)</option>
                    <option value="outside_dhaka">Outside Dhaka (৳ 130)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mb-1.5">
                    Full Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="House/Apartment #, Road #, Area, District"
                    className="w-full bg-[#F4F2EE] border border-zinc-300 px-3 py-2.5 text-[#08090B] focus:outline-none focus:border-[#08090B]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mb-1.5">
                    Payment Method
                  </label>
                  <div className="p-3 bg-[#F4F2EE] border border-zinc-300 text-[#08090B] flex items-center justify-between">
                    <span className="font-medium">Cash / bKash / Nagad on Delivery</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* Bag Items List */
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-white">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                  <p className="font-display text-2xl font-bold uppercase text-zinc-400">
                    Your Bag Is Empty
                  </p>
                  <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                    Select any Formula 1 diecast or RC toy car to start building your starting grid.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-f1 mt-4 px-8 py-3 bg-[#E10600] hover:bg-[#ff1e18] text-white font-display text-sm font-bold tracking-[0.08em] uppercase transition-colors cursor-pointer"
                  >
                    <span className="btn-f1-inner">Explore Models</span>
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="flex gap-4 pb-4 border-b border-zinc-200 last:border-b-0"
                  >
                    <div className="w-20 h-20 bg-[#F4F2EE] border border-zinc-200 p-2 shrink-0 flex items-center justify-center">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-mono tracking-[0.14em] text-zinc-500 uppercase truncate">
                            {item.product.brand} · {item.selectedSize}
                          </p>
                          <h4 className="font-display text-base font-bold uppercase text-[#08090B] truncate">
                            {item.product.name}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                          aria-label="Remove item"
                          className="text-zinc-400 hover:text-[#E10600] transition-colors p-1 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-zinc-300 bg-[#F4F2EE] text-xs">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.product.id, item.selectedSize, -1)}
                            className="px-2.5 py-1 text-zinc-700 hover:bg-zinc-200 font-mono cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-1 font-mono text-[11px] min-w-[24px] text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.product.id, item.selectedSize, 1)}
                            className="px-2.5 py-1 text-zinc-700 hover:bg-zinc-200 font-mono cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-mono text-xs font-bold text-[#08090B] tabular-nums">
                          ৳ {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Footer */}
          {items.length > 0 && !completedOrder && (
            <div className="p-6 border-t border-zinc-300 bg-[#F4F2EE] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-[#08090B] tabular-nums">
                    ৳ {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Nationwide Shipping</span>
                  <span className="font-mono text-zinc-700 tabular-nums">
                    {subtotal >= freeShippingThreshold ? 'FREE' : `৳ ${shippingFee}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-[#08090B] pt-2 border-t border-zinc-300">
                  <span className="uppercase tracking-wider text-xs font-mono">Estimated Total</span>
                  <span className="font-mono text-lg tabular-nums">
                    ৳ {estimatedTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {isCheckoutOpen ? (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="btn-f1 w-full bg-[#E10600] hover:bg-[#ff1e18] text-white py-3.5 px-6 font-display text-sm sm:text-base font-bold tracking-[0.08em] uppercase flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="btn-f1-inner">
                    <span>
                      {submitting
                        ? 'CONFIRMING ORDER...'
                        : `CONFIRM ORDER · ৳ ${estimatedTotal.toLocaleString()}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="btn-f1 w-full bg-[#E10600] hover:bg-[#ff1e18] text-white py-3.5 px-6 font-display text-sm sm:text-base font-bold tracking-[0.08em] uppercase flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="btn-f1-inner">
                    <span>Proceed To Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E10600]" />
                <span>Official Licensed F1 Toy & Collector Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
