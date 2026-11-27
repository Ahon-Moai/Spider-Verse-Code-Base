import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Copy,
  Hash,
  Loader2,
  Phone,
  ShieldAlert,
  Smartphone,
  X,
} from 'lucide-react';
import { AdvancePaymentMethod } from '../types';
import {
  BANK_TRANSFER_CONFIG,
  MFS_METHODS,
  REQUIRED_ADVANCE_AMOUNT,
  isValidBangladeshMobile,
} from '../utils/advancePayment';

export interface AdvancePaymentSubmissionPayload {
  paymentMethod: AdvancePaymentMethod;
  senderNumber: string;
  transactionId: string;
  paymentNote: string;
}

interface AdvancePaymentModalProps {
  isOpen: boolean;
  currencySymbol: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  remainingCodAmount: number;
  submitting: boolean;
  submitError: string | null;
  onClose: () => void;
  onSubmitPayment: (payload: AdvancePaymentSubmissionPayload) => Promise<void>;
}

interface PaymentFormErrors {
  senderNumber?: string;
  transactionId?: string;
}

export const AdvancePaymentModal: React.FC<AdvancePaymentModalProps> = ({
  isOpen,
  currencySymbol,
  subtotal,
  deliveryFee,
  discount,
  totalAmount,
  remainingCodAmount,
  submitting,
  submitError,
  onClose,
  onSubmitPayment,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<AdvancePaymentMethod>('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2200);
    } catch {
      // Fallback copy for restricted environments
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopiedKey(key);
        setTimeout(() => {
          setCopiedKey((curr) => (curr === key ? null : curr));
        }, 2200);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleMethodChange = (nextMethod: AdvancePaymentMethod) => {
    setPaymentMethod(nextMethod);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const nextErrors: PaymentFormErrors = {};
    const isMfs = paymentMethod === 'bkash' || paymentMethod === 'nagad';

    if (isMfs) {
      if (!senderNumber.trim() || !isValidBangladeshMobile(senderNumber)) {
        nextErrors.senderNumber =
          'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01700000000).';
      }
      if (!transactionId.trim() || transactionId.trim().length < 3) {
        nextErrors.transactionId = `Please enter the Transaction ID from your ${
          paymentMethod === 'bkash' ? 'bKash' : 'Nagad'
        } payment.`;
      }
    } else {
      if (!transactionId.trim() || transactionId.trim().length < 3) {
        nextErrors.transactionId = 'Please enter your Bank Transfer Reference or Transaction ID.';
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmitPayment({
      paymentMethod,
      senderNumber: isMfs ? senderNumber.trim() : '',
      transactionId: transactionId.trim(),
      paymentNote: paymentNote.trim(),
    });
  };

  const activeMfs =
    paymentMethod === 'bkash'
      ? MFS_METHODS.bkash
      : paymentMethod === 'nagad'
      ? MFS_METHODS.nagad
      : null;

  const selectedMethodTitle =
    paymentMethod === 'bkash'
      ? 'bKash (Send Money)'
      : paymentMethod === 'nagad'
      ? 'Nagad (Send Money)'
      : 'Bank Transfer (City Bank)';

  return (
    <div
      className="fixed inset-0 z-50 bg-[#F4F2EE] sm:bg-black/75 sm:backdrop-blur-xs flex items-center justify-center sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="advance-payment-heading"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-[#F4F2EE] text-[#08090B] sm:border sm:border-zinc-300 sm:shadow-2xl flex flex-col overflow-hidden">
        {/* Sticky Payment Header */}
        <div className="bg-[#08090B] text-white px-4 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#C4C9D4] hover:text-white transition-colors cursor-pointer disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center min-w-0">
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#E10600] font-semibold block">
              Step 2 of 2 · Advance Payment Required
            </span>
            <h2
              id="advance-payment-heading"
              className="font-display font-bold text-lg sm:text-xl uppercase tracking-wide text-white leading-tight truncate"
            >
              Pay {currencySymbol}
              {REQUIRED_ADVANCE_AMOUNT} Advance to Confirm
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close payment window"
            className="p-2 text-[#C4C9D4] hover:text-white border border-white/15 hover:border-white/40 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Prominent Advance Hero Strip + Order Financial Split */}
          <div className="bg-white border border-zinc-300 overflow-hidden">
            <div className="bg-[#111317] text-white px-4 sm:px-5 py-4 flex items-center justify-between gap-4 border-b-2 border-[#E10600]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF] block">
                  Advance Payment Due Now
                </span>
                <p className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums mt-0.5">
                  {currencySymbol} {REQUIRED_ADVANCE_AMOUNT}
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF] block">
                  Remaining COD
                </span>
                <p className="font-mono text-lg sm:text-xl font-bold text-emerald-400 tabular-nums mt-0.5">
                  {currencySymbol} {remainingCodAmount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="px-4 sm:px-5 py-3.5 text-xs space-y-1.5 bg-[#FAF9F6]">
              <div className="flex justify-between text-zinc-600">
                <span>Products</span>
                <span className="font-mono font-medium text-[#08090B] tabular-nums">
                  {currencySymbol} {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Delivery</span>
                <span className="font-mono font-medium text-[#08090B] tabular-nums">
                  {deliveryFee === 0 ? 'FREE' : `${currencySymbol} ${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-mono font-semibold tabular-nums">
                    -{currencySymbol} {discount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-zinc-700 pt-1 border-t border-zinc-200 font-semibold">
                <span>Total Order Amount</span>
                <span className="font-mono text-[#08090B] tabular-nums">
                  {currencySymbol} {totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[#E10600] font-semibold">
                <span>Advance to pay now</span>
                <span className="font-mono tabular-nums">
                  -{currencySymbol} {REQUIRED_ADVANCE_AMOUNT}
                </span>
              </div>
              <div className="flex justify-between text-[#08090B] font-bold pt-1 border-t border-zinc-200">
                <span>Remaining Cash on Delivery</span>
                <span className="font-mono tabular-nums">
                  {currencySymbol} {remainingCodAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="space-y-2">
            <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600 font-semibold">
              Select Advance Payment Method
            </span>
            <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Payment Method">
              {/* bKash Tab */}
              <button
                type="button"
                role="tab"
                aria-selected={paymentMethod === 'bkash'}
                onClick={() => handleMethodChange('bkash')}
                className={`p-3 border-2 text-left transition-colors cursor-pointer flex flex-col justify-between gap-1.5 ${
                  paymentMethod === 'bkash'
                    ? 'border-[#E2136E] bg-white shadow-xs'
                    : 'border-zinc-300 bg-white/70 hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-flex items-center gap-1.5 font-display text-base sm:text-lg font-bold uppercase text-[#E2136E]">
                    <Smartphone className="w-4 h-4 shrink-0" />
                    <span>bKash</span>
                  </span>
                  {paymentMethod === 'bkash' && (
                    <span className="w-4 h-4 bg-[#E2136E] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase">
                  Send Money
                </span>
              </button>

              {/* Nagad Tab */}
              <button
                type="button"
                role="tab"
                aria-selected={paymentMethod === 'nagad'}
                onClick={() => handleMethodChange('nagad')}
                className={`p-3 border-2 text-left transition-colors cursor-pointer flex flex-col justify-between gap-1.5 ${
                  paymentMethod === 'nagad'
                    ? 'border-[#F7941D] bg-white shadow-xs'
                    : 'border-zinc-300 bg-white/70 hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-flex items-center gap-1.5 font-display text-base sm:text-lg font-bold uppercase text-[#D97706]">
                    <Smartphone className="w-4 h-4 shrink-0" />
                    <span>Nagad</span>
                  </span>
                  {paymentMethod === 'nagad' && (
                    <span className="w-4 h-4 bg-[#F7941D] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase">
                  Send Money
                </span>
              </button>

              {/* Bank Transfer Tab */}
              <button
                type="button"
                role="tab"
                aria-selected={paymentMethod === 'bank_transfer'}
                onClick={() => handleMethodChange('bank_transfer')}
                className={`p-3 border-2 text-left transition-colors cursor-pointer flex flex-col justify-between gap-1.5 ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-[#08090B] bg-white shadow-xs'
                    : 'border-zinc-300 bg-white/70 hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-flex items-center gap-1.5 font-display text-base sm:text-lg font-bold uppercase text-[#08090B]">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>Bank</span>
                  </span>
                  {paymentMethod === 'bank_transfer' && (
                    <span className="w-4 h-4 bg-[#08090B] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase truncate">
                  City Bank
                </span>
              </button>
            </div>
          </div>

          {/* Recipient Account & Step-by-Step Instructions Panel */}
          {activeMfs ? (
            <div
              className="bg-white border border-zinc-300 overflow-hidden"
              style={{ borderTopWidth: '4px', borderTopColor: activeMfs.accentColor }}
            >
              <div className="p-4 sm:p-5 border-b border-zinc-200 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-[#F4F2EE] p-2.5 border border-zinc-200">
                    <span className="font-mono text-[10px] uppercase text-zinc-500 block">
                      Payment Method
                    </span>
                    <span className="font-bold text-[#08090B] mt-0.5 block">
                      {activeMfs.label}
                    </span>
                  </div>
                  <div className="bg-[#F4F2EE] p-2.5 border border-zinc-200">
                    <span className="font-mono text-[10px] uppercase text-zinc-500 block">
                      Payment Type
                    </span>
                    <span className="font-bold text-[#08090B] mt-0.5 block">
                      {activeMfs.paymentType}
                    </span>
                  </div>
                  <div className="bg-[#F4F2EE] p-2.5 border border-zinc-200">
                    <span className="font-mono text-[10px] uppercase text-zinc-500 block">
                      Amount
                    </span>
                    <span className="font-mono font-bold text-[#E10600] mt-0.5 block tabular-nums">
                      {currencySymbol}
                      {REQUIRED_ADVANCE_AMOUNT}
                    </span>
                  </div>
                </div>

                {/* Recipient Number + Copy Button */}
                <div className="bg-[#FAF9F6] border border-zinc-300 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 block">
                      {activeMfs.label} Recipient Number
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-[#08090B] tracking-wider tabular-nums mt-0.5 block">
                      {activeMfs.recipientNumber}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(activeMfs.recipientNumber, `mfs-${activeMfs.id}`)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#08090B] hover:bg-zinc-800 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                  >
                    {copiedKey === `mfs-${activeMfs.id}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied Number</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Number</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Numbered Instructions */}
              <div className="p-4 sm:p-5 bg-[#FAF9F6]/70 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600 font-semibold block">
                  How to Pay via {activeMfs.label}
                </span>
                <ol className="space-y-1.5 text-xs text-zinc-700 list-decimal list-inside">
                  {activeMfs.instructions.map((step, i) => (
                    <li key={i} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-zinc-300 border-t-4 border-t-[#08090B] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-zinc-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-[#F4F2EE] p-3 border border-zinc-200">
                    <span className="font-mono text-[10px] uppercase text-zinc-500 block">
                      Bank
                    </span>
                    <span className="font-bold text-[#08090B] mt-0.5 block">
                      {BANK_TRANSFER_CONFIG.bankName}
                    </span>
                  </div>
                  <div className="bg-[#F4F2EE] p-3 border border-zinc-200">
                    <span className="font-mono text-[10px] uppercase text-zinc-500 block">
                      Account Holder
                    </span>
                    <span className="font-bold text-[#08090B] mt-0.5 block">
                      {BANK_TRANSFER_CONFIG.accountHolder}
                    </span>
                  </div>
                  <div className="bg-[#F4F2EE] p-3 border border-zinc-200">
                    <span className="font-mono text-[10px] uppercase text-zinc-500 block">
                      Branch
                    </span>
                    <span className="font-bold text-[#08090B] mt-0.5 block">
                      {BANK_TRANSFER_CONFIG.branch}
                    </span>
                  </div>
                  <div className="bg-[#F4F2EE] p-3 border border-zinc-200">
                    <span className="font-mono text-[10px] uppercase text-zinc-500 block">
                      Required Amount
                    </span>
                    <span className="font-mono font-bold text-[#E10600] mt-0.5 block tabular-nums">
                      {currencySymbol}
                      {BANK_TRANSFER_CONFIG.requiredAmount}
                    </span>
                  </div>
                </div>

                {/* Account Number + Copy */}
                <div className="bg-[#FAF9F6] border border-zinc-300 p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 block">
                      Account Number
                    </span>
                    <span className="font-mono text-base sm:text-lg font-bold text-[#08090B] tabular-nums block truncate">
                      {BANK_TRANSFER_CONFIG.accountNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(BANK_TRANSFER_CONFIG.accountNumber, 'bank-account')
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#08090B] hover:bg-zinc-800 text-white font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                  >
                    {copiedKey === 'bank-account' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Routing Number + Copy */}
                <div className="bg-[#FAF9F6] border border-zinc-300 p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 block">
                      Routing Number
                    </span>
                    <span className="font-mono text-base sm:text-lg font-bold text-[#08090B] tabular-nums block truncate">
                      {BANK_TRANSFER_CONFIG.routingNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(BANK_TRANSFER_CONFIG.routingNumber, 'bank-routing')
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#08090B] hover:bg-zinc-800 text-white font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                  >
                    {copiedKey === 'bank-routing' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-[#FAF9F6]/70 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600 font-semibold block">
                  Bank Transfer Instructions
                </span>
                <ol className="space-y-1.5 text-xs text-zinc-700 list-decimal list-inside">
                  {BANK_TRANSFER_CONFIG.instructions.map((step, i) => (
                    <li key={i} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Transaction Verification Form */}
          <form
            id="advance-payment-form"
            onSubmit={handleSubmit}
            noValidate
            className="bg-white border border-zinc-300 p-4 sm:p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3">
              <h3 className="font-display font-bold text-xl uppercase text-[#08090B]">
                Submit Advance Payment Details
              </h3>
              <span className="font-mono text-[11px] font-semibold text-zinc-600 uppercase">
                Method: {selectedMethodTitle}
              </span>
            </div>

            {submitError && (
              <div
                role="alert"
                className="bg-red-50 border border-[#E10600] px-3.5 py-3 text-xs text-[#E10600] font-medium"
              >
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paymentMethod !== 'bank_transfer' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="advance-sender-number"
                    className="block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-700 font-semibold"
                  >
                    Sender&apos;s Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                    />
                    <input
                      id="advance-sender-number"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={senderNumber}
                      onChange={(e) => {
                        setSenderNumber(e.target.value);
                        if (errors.senderNumber) {
                          setErrors((prev) => ({ ...prev, senderNumber: undefined }));
                        }
                      }}
                      placeholder="01700000000"
                      className={`w-full bg-[#F4F2EE] border pl-10 pr-3.5 py-2.5 text-sm font-mono text-[#08090B] placeholder:text-zinc-400 focus:outline-none transition-colors ${
                        errors.senderNumber
                          ? 'border-[#E10600] focus:border-[#E10600]'
                          : 'border-zinc-300 focus:border-[#08090B]'
                      }`}
                    />
                  </div>
                  {errors.senderNumber && (
                    <p className="text-[11px] text-[#E10600] font-medium">
                      {errors.senderNumber}
                    </p>
                  )}
                </div>
              )}

              <div
                className={`space-y-1.5 ${
                  paymentMethod === 'bank_transfer' ? 'sm:col-span-2' : ''
                }`}
              >
                <label
                  htmlFor="advance-transaction-id"
                  className="block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-700 font-semibold"
                >
                  {paymentMethod === 'bank_transfer'
                    ? 'Bank Transfer Reference *'
                    : 'Transaction ID (TrxID) *'}
                </label>
                <div className="relative">
                  <Hash
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                  />
                  <input
                    id="advance-transaction-id"
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => {
                      setTransactionId(e.target.value);
                      if (errors.transactionId) {
                        setErrors((prev) => ({ ...prev, transactionId: undefined }));
                      }
                    }}
                    placeholder={
                      paymentMethod === 'bank_transfer'
                        ? 'Enter bank transfer reference number'
                        : 'e.g. BL74K9M2PQ'
                    }
                    className={`w-full bg-[#F4F2EE] border pl-10 pr-3.5 py-2.5 text-sm font-mono text-[#08090B] placeholder:font-sans placeholder:text-zinc-400 focus:outline-none transition-colors ${
                      errors.transactionId
                        ? 'border-[#E10600] focus:border-[#E10600]'
                        : 'border-zinc-300 focus:border-[#08090B]'
                    }`}
                  />
                </div>
                {errors.transactionId && (
                  <p className="text-[11px] text-[#E10600] font-medium">
                    {errors.transactionId}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label
                  htmlFor="advance-payment-note"
                  className="block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-700 font-semibold"
                >
                  Payment Note (Optional)
                </label>
                <input
                  id="advance-payment-note"
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Optional reference or sender name"
                  className="w-full bg-[#F4F2EE] border border-zinc-300 px-3.5 py-2.5 text-sm text-[#08090B] placeholder:text-zinc-400 focus:outline-none focus:border-[#08090B] transition-colors"
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Orders are created with status <strong>Pending Verification</strong> and confirmed once an administrator manually verifies your {currencySymbol}
                {REQUIRED_ADVANCE_AMOUNT} transfer. Never enter any PIN or OTP.
              </p>
            </div>
          </form>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="bg-white border-t border-zinc-300 px-4 sm:px-6 py-3.5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-3 border border-zinc-300 hover:border-[#08090B] text-[#08090B] font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
          >
            Back to Checkout
          </button>

          <button
            type="submit"
            form="advance-payment-form"
            disabled={submitting}
            className="btn-f1 bg-[#E10600] hover:bg-[#ff1e18] text-white px-7 py-3.5 font-display text-base font-bold uppercase tracking-[0.08em] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="btn-f1-inner">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <span>Verify Advance &amp; Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
