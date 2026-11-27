import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { CompletedOrderData } from '../types';
import { fetchOrderByNumber } from '../services/api';
import {
  formatPaymentLabel,
  formatZoneLabel,
  getShippingConfig,
} from '../utils/checkout';

interface OrderConfirmationPageProps {
  orderNumber?: string;
  initialOrder?: CompletedOrderData | null;
  storeSettings?: any;
  onNavigateHome: () => void;
  onNavigateShop: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderNumber,
  initialOrder,
  storeSettings,
  onNavigateHome,
  onNavigateShop,
}) => {
  const [order, setOrder] = useState<CompletedOrderData | null>(
    initialOrder || null
  );
  const [loading, setLoading] = useState<boolean>(!initialOrder && !!orderNumber);
  const { currencySymbol } = getShippingConfig(storeSettings);

  useEffect(() => {
    document.title = order?.order_number
      ? `Order ${order.order_number} Confirmed — SPIDER VERSE`
      : 'Order Confirmation — SPIDER VERSE';
  }, [order?.order_number]);

  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
      setLoading(false);
      return;
    }
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    fetchOrderByNumber(orderNumber).then((data) => {
      if (!active) return;
      if (data && data.order) {
        setOrder({
          ...data.order,
          status: data.order.order_status || data.order.status || 'pending',
          subtotal: Number(data.order.subtotal || 0),
          discount: Number(data.order.discount || 0),
          delivery_fee: Number(data.order.delivery_fee || 0),
          total_amount: Number(data.order.total_amount || 0),
          items: Array.isArray(data.items)
            ? data.items.map((it: any) => ({
                ...it,
                quantity: Number(it.quantity),
                unit_price: Number(it.unit_price),
                line_total: Number(it.line_total),
              }))
            : [],
        });
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [orderNumber, initialOrder]);

  return (
    <div className="bg-[#F4F2EE] text-[#08090B] min-h-[75vh] selection:bg-[#E10600] selection:text-white">
      {/* Breadcrumb Bar */}
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
              Order Confirmation
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {loading ? (
          <div className="bg-white border border-zinc-300 p-12 text-center space-y-3">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#08090B]" />
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-600">
              Loading Order Receipt...
            </p>
          </div>
        ) : !order ? (
          <div className="bg-white border border-zinc-300 p-10 sm:p-14 text-center space-y-5">
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase text-[#08090B]">
              Order Not Found
            </h1>
            <p className="text-sm text-zinc-600 max-w-md mx-auto">
              We could not locate this order confirmation. Browse our catalog to continue shopping.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateShop}
                className="btn-f1 inline-flex items-center justify-center bg-[#E10600] hover:bg-[#ff1e18] text-white px-8 py-3.5 font-display text-sm font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer"
              >
                <span className="btn-f1-inner">
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-zinc-300 p-6 sm:p-10 space-y-8">
            {/* Top Confirmation Banner */}
            <div className="border-b border-zinc-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-emerald-700 font-mono text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Order Confirmed</span>
                </div>
                <h1 className="font-display font-black text-3xl sm:text-5xl uppercase text-[#08090B] tracking-tight leading-none tabular-nums">
                  {order.order_number}
                </h1>
                <p className="text-sm text-zinc-600 leading-relaxed pt-1">
                  Thank you, <strong className="text-[#08090B]">{order.customer_name}</strong>. Your order has been received and queued for dispatch verification.
                </p>
              </div>

              <div className="bg-[#FAF9F6] border border-zinc-200 px-4 py-3 text-left sm:text-right shrink-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block">
                  Order Status
                </span>
                <span className="font-mono text-xs font-bold uppercase text-emerald-700">
                  {order.status || order.order_status || 'pending'}
                </span>
              </div>
            </div>

            {/* Customer & Delivery Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 block">
                  Customer &amp; Payment
                </span>
                <p className="font-semibold text-sm text-[#08090B]">
                  {order.customer_name}
                </p>
                {order.customer_phone && (
                  <p className="font-mono text-zinc-700">{order.customer_phone}</p>
                )}
                {order.whatsapp_number && (
                  <p className="font-mono text-zinc-700">
                    WhatsApp: {order.whatsapp_number}
                  </p>
                )}
                {order.customer_email && (
                  <p className="text-zinc-600">{order.customer_email}</p>
                )}
                <p className="text-zinc-700 pt-1">
                  Payment:{' '}
                  <strong className="text-[#08090B]">
                    {formatPaymentLabel(order.payment_method)}
                  </strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 block">
                  Delivery Details
                </span>
                {order.city_zone && (
                  <p className="font-semibold text-sm text-[#08090B]">
                    {formatZoneLabel(order.city_zone)}
                  </p>
                )}
                {order.shipping_address && (
                  <p className="text-zinc-700 leading-relaxed">
                    {order.shipping_address}
                  </p>
                )}
              </div>
            </div>

            {/* Ordered Items */}
            {order.items && order.items.length > 0 && (
              <div className="border-t border-zinc-200 pt-6 space-y-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 block">
                  Items Ordered
                </span>
                <div className="divide-y divide-zinc-200 border border-zinc-200 bg-[#FAF9F6]">
                  {order.items.map((item, idx) => (
                    <div
                      key={`${item.product_name}-${item.selected_size}-${idx}`}
                      className="px-4 py-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[#08090B] truncate">
                          {item.product_name}
                        </p>
                        <p className="font-mono text-[11px] text-zinc-500 tabular-nums">
                          {item.selected_size} · Qty {item.quantity} × {currencySymbol}{' '}
                          {Number(item.unit_price).toLocaleString()}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-[#08090B] tabular-nums shrink-0">
                        {currencySymbol} {Number(item.line_total).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-[#F4F2EE] border border-zinc-300 p-5 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-[#08090B] tabular-nums">
                  {currencySymbol} {Number(order.subtotal || 0).toLocaleString()}
                </span>
              </div>

              {Number(order.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-mono font-semibold tabular-nums">
                    -{currencySymbol} {Number(order.discount).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-zinc-600">
                <span>Delivery Charge</span>
                <span className="font-mono font-medium text-[#08090B] tabular-nums">
                  {Number(order.delivery_fee || 0) === 0
                    ? 'FREE'
                    : `${currencySymbol} ${Number(order.delivery_fee).toLocaleString()}`}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-3 border-t border-zinc-300">
                <span className="font-mono font-bold uppercase tracking-wider text-[#08090B]">
                  Order Total
                </span>
                <span className="font-mono text-2xl font-bold text-[#08090B] tabular-nums">
                  {currencySymbol} {Number(order.total_amount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={onNavigateShop}
                className="btn-f1 bg-[#E10600] hover:bg-[#ff1e18] text-white px-8 py-3.5 font-display text-sm font-bold uppercase tracking-[0.08em] flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="btn-f1-inner">
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>

              <button
                type="button"
                onClick={onNavigateHome}
                className="px-6 py-3.5 border border-zinc-300 hover:border-[#08090B] text-[#08090B] font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Return Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
