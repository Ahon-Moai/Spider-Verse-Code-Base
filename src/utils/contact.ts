const DEFAULT_WHATSAPP_DIGITS = '8801700000000';
const DEFAULT_GREETING = 'Hello SPIDER VERSE, I have a question about your F1 models.';

export function buildWhatsAppUrl(phone?: string, message: string = DEFAULT_GREETING): string {
  const rawDigits = (phone || '').replace(/[^0-9]/g, '');
  let normalized = rawDigits;

  if (!normalized) {
    normalized = DEFAULT_WHATSAPP_DIGITS;
  } else if (normalized.startsWith('0')) {
    normalized = `88${normalized}`;
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
