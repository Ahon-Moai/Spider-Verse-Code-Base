import { AdvancePaymentMethod, PaymentVerificationStatus } from '../types';

export const REQUIRED_ADVANCE_AMOUNT = 250;

export interface MobileFinancialServiceConfig {
  id: 'bkash' | 'nagad';
  label: string;
  paymentType: string;
  recipientNumber: string;
  accentColor: string;
  badgeBg: string;
  instructions: string[];
}

export const MFS_METHODS: Record<'bkash' | 'nagad', MobileFinancialServiceConfig> = {
  bkash: {
    id: 'bkash',
    label: 'bKash',
    paymentType: 'Send Money',
    recipientNumber: '0189163720',
    accentColor: '#E2136E',
    badgeBg: 'bg-[#E2136E]',
    instructions: [
      'Open your bKash app.',
      'Select Send Money.',
      'Enter the recipient number shown above.',
      'Send exactly ৳250.',
      'Complete the transaction using your bKash account.',
      'Return to this website.',
      'Enter the Sender Number and Transaction ID below.',
    ],
  },
  nagad: {
    id: 'nagad',
    label: 'Nagad',
    paymentType: 'Send Money',
    recipientNumber: '01333247811',
    accentColor: '#F7941D',
    badgeBg: 'bg-[#F7941D]',
    instructions: [
      'Open your Nagad app.',
      'Select Send Money.',
      'Enter the recipient number shown above.',
      'Send exactly ৳250.',
      'Complete the transaction using your Nagad account.',
      'Return to this website.',
      'Enter the Sender Number and Transaction ID below.',
    ],
  },
};

export const BANK_TRANSFER_CONFIG = {
  id: 'bank_transfer' as const,
  label: 'Bank Transfer',
  bankName: 'City Bank',
  accountHolder: 'MISKATUR RAHAMAN',
  accountNumber: '2304967765001',
  branch: 'O.R. Nizam Road',
  routingNumber: '22155806',
  requiredAmount: REQUIRED_ADVANCE_AMOUNT,
  instructions: [
    'Transfer exactly ৳250 to the displayed bank account.',
    'Complete your bank transfer.',
    'Enter the transfer reference or transaction details in the form below.',
  ],
};

export function isValidBangladeshMobile(phone: string): boolean {
  const normalized = phone.replace(/[\s\-()]/g, '').trim();
  return /^(?:\+?88)?01[3-9][0-9]{8}$/.test(normalized);
}

export function formatAdvancePaymentMethod(method?: string): string {
  const m = (method || '').toLowerCase().trim();
  if (m === 'bkash') return 'bKash (Send Money)';
  if (m === 'nagad') return 'Nagad (Send Money)';
  if (m === 'bank_transfer' || m === 'bank') return 'City Bank Transfer';
  if (m === 'cod') return 'Cash on Delivery';
  return method || 'Manual Advance';
}

export function formatVerificationStatus(status?: PaymentVerificationStatus | string): {
  label: string;
  tone: 'pending' | 'verified' | 'rejected';
} {
  const s = (status || 'pending_verification').toLowerCase().trim();
  if (s === 'verified') {
    return { label: 'Verified', tone: 'verified' };
  }
  if (s === 'rejected') {
    return { label: 'Rejected', tone: 'rejected' };
  }
  return { label: 'Pending Verification', tone: 'pending' };
}

export function computeAdvanceSplit(totalOrderAmount: number) {
  const total = Math.max(0, Math.round(totalOrderAmount * 100) / 100);
  const advanceAmount = REQUIRED_ADVANCE_AMOUNT;
  const remainingCodAmount = Math.max(0, Math.round((total - advanceAmount) * 100) / 100);
  return { total, advanceAmount, remainingCodAmount };
}

export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ord-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export type { AdvancePaymentMethod };
