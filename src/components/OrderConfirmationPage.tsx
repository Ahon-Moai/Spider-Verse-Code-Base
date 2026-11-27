import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  XCircle,
} from 'lucide-react';
import { CompletedOrderData } from '../types';
import { fetchOrderByNumber } from '../services/api';
import {
  formatZoneLabel,
  getShippingConfig,
} from '../utils/checkout';
import {
  REQUIRED_ADVANCE_AMOUNT,
  formatAdvancePaymentMethod,
  formatVerificationStatus,
} from '../utils/advancePayment';

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
      ? `Order ${order.order_number} Submitted — SPIDER VERSE`
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
        const totalAmt = Number(data.order.total_amount || 0);
        const advAmt = Number(data.order.advance_amount || REQUIRED_ADVANCE_AMOUNT) || REQUIRED_ADVANCE_AMOUNT;
        const remCod =
          data.order.remaining_cod_amount !== undefined &&
          data.order.remaining_cod_amount !== null
            ? Number(data.order.remaining_cod_amount)
            : Math.max(0, totalAmt - advAmt);

        setOrder({
          ...data.order,
          status: data.order.order_status || data.order.status || 'pending',
          subtotal: Number(data.order.subtotal || 0),
          discount: Number(data.order.discount || 0),
          delivery_fee: Number(data.order.delivery_fee || 0),
          total_amount: totalAmt,
          advance_amount: advAmt,
          remaining_cod_amount: remCod,
          payment_verification_status:
            data.order.payment_verification_status || 'pending_verification',
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

  const totalAmount = Number(order?.total_amount || 0);
  const advanceAmount = Number(order?.advance_amount || REQUIRED_ADVANCE_AMOUNT) || REQUIRED_ADVANCE_AMOUNT;
  const remainingCodAmount =
    order?.remaining_cod_amount !== undefined && order?.remaining_cod_amount !== null
      ? Number(order.remaining_cod_amount)
      : Math.max(0, totalAmount - advanceAmount);

  const verificationInfo = formatVerificationStatus(order?.payment_verification_status);

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
              Order Submitted
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
          <div className="bg-white border border-zinc-300 p-6 sm:p-10 space-y-7">
            {/* Top Confirmation Banner */}
            <div className="border-b border-zinc-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-emerald-700 font-mono text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Order Submitted Successfully!</span>
                </div>
                <h1 className="font-display font-black text-3xl sm:text-5xl uppercase text-[#08090B] tracking-tight leading-none tabular-nums">
                  {order.order_number}
                </h1>
                <p className="text-sm text-zinc-700 leading-relaxed pt-1">
                  Your order has been submitted and is awaiting advance-payment verification.
                </p>
              </div>

              <div className="bg-[#FAF9F6] border border-zinc-300 px-4 py-3 text-left sm:text-right shrink-0 space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block">
                  Payment Verification
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase ${
                    verificationInfo.tone === 'verified'
                      ? 'text-emerald-700'
                      : verificationInfo.tone === 'rejected'
                      ? 'text-[#E10600]'
                      : 'text-amber-700'
                  }`}
                >
                  {verificationInfo.tone === 'verified' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : verificationInfo.tone === 'rejected' ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  <span>{verificationInfo.label}</span>
                </span>
              </div>
            </div>

            {/* Verification Notice */}
            {verificationInfo.tone === 'rejected' ? (
              <div className="bg-red-50 border border-[#E10600] px-4 py-3.5 text-xs sm:text-sm text-[#E10600] space-y-1">
                <p className="font-semibold">
                  Advance payment verification was rejected by admin.
                </p>
                {order.payment_rejection_reason && (
                  <p className="text-xs text-zinc-800">
                    Reason: {order.payment_rejection_reason}
                  </p>
                )}
              </div>
            ) : verificationInfo.tone === 'verified' ? (
              <div className="bg-emerald-50 border border-emerald-200 px-4 py-3.5 text-xs sm:text-sm text-emerald-900">
                Your {currencySymbol}
                {advanceAmount} advance payment has been verified. Remaining{' '}
                <strong className="font-mono tabular-nums">
                  {currencySymbol} {remainingCodAmount.toLocaleString()}
                </strong>{' '}
                will be collected upon delivery.
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 px-4 py-3.5 text-xs sm:text-sm text-amber-950 leading-relaxed">
                We will verify your advance payment and confirm your order shortly. The remaining amount will be paid upon delivery.
              </div>
            )}

            {/* Advance Payment Verification Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF9F6] border border-zinc-300 p-4 sm:p-5 text-xs">
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 block">
                  Advance Payment Proof
                </span>
                <p className="font-semibold text-[#08090B]">
                  Method: {formatAdvancePaymentMethod(order.payment_method)}
                </p>
                {order.sender_number && (
                  <p className="font-mono text-zinc-700 tabular-nums">
                    Sender Number: {order.sender_number}
                  </p>
                )}
                {order.transaction_ref && (
                  <p className="font-mono text-[#08090B] font-semibold">
                    Transaction ID / Ref: {order.transaction_ref}
                  </p>
                )}
                <p className="text-zinc-600">
                  Verification Status:{' '}
                  <strong
                    className={
                      verificationInfo.tone === 'verified'
                        ? 'text-emerald-700'
                        : verificationInfo.tone === 'rejected'
                        ? 'text-[#E10600]'
                        : 'text-amber-700'
                    }
                  >
                    {verificationInfo.label}
                  </strong>
                </p>
              </div>

              <div className="space-y-1.5 sm:text-right">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 block">
                  Payment Split
                </span>
                <p className="text-zinc-700">
                  Total Order Amount:{' '}
                  <strong className="font-mono text-[#08090B] tabular-nums">
                    {currencySymbol} {totalAmount.toLocaleString()}
                  </strong>
                </p>
                <p className="text-zinc-700">
                  Advance Payment:{' '}
                  <strong className="font-mono text-[#E10600] tabular-nums">
                    {currencySymbol} {advanceAmount.toLocaleString()}
                  </strong>
                </p>
                <p className="text-zinc-900 font-semibold pt-1">
                  Remaining Payable on Delivery:{' '}
                  <strong className="font-mono text-base text-[#08090B] tabular-nums">
                    {currencySymbol} {remainingCodAmount.toLocaleString()}
                  </strong>
                </p>
              </div>
            </div>

            {/* Customer & Delivery Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 block">
                  Customer Information
                </span>
                <p className="font-semibold text-sm text-[#08090B]">
                  {order.customer_name}
                </p>
                {order.customer_phone && (
                  <p className="font-mono text-zinc-700 tabular-nums">{order.customer_phone}</p>
                )}
                {order.whatsapp_number && (
                  <p className="font-mono text-zinc-700 tabular-nums">
                    WhatsApp: {order.whatsapp_number}
                  </p>
                )}
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

              <div className="flex justify-between text-[#08090B] font-semibold pt-2 border-t border-zinc-200">
                <span>Total Order Amount</span>
                <span className="font-mono tabular-nums">
                  {currencySymbol} {totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-[#E10600] font-semibold">
                <span>Advance Payment</span>
                <span className="font-mono tabular-nums">
                  -{currencySymbol} {advanceAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-3 border-t border-zinc-300">
                <span className="font-mono font-bold uppercase tracking-wider text-[#08090B]">
                  Remaining COD on Delivery
                </span>
                <span className="font-mono text-2xl font-bold text-[#08090B] tabular-nums">
                  {currencySymbol} {remainingCodAmount.toLocaleString()}
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
