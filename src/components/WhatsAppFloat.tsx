import React from 'react';
import { buildWhatsAppUrl } from '../utils/contact';

interface WhatsAppFloatProps {
  storeSettings?: any;
  hidden?: boolean;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({
  storeSettings,
  hidden = false,
}) => {
  if (hidden) return null;

  const href = buildWhatsAppUrl(storeSettings?.contact_phone);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed bottom-16 md:bottom-6 right-4 md:right-6 z-40 w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.4)] hover:scale-105 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090B]"
    >
      <svg
        className="w-6 h-6 fill-current"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12.031 2C6.486 2 2 6.486 2 12.031c0 1.771.463 3.498 1.342 5.02L2.05 21.848l4.918-1.29a9.98 9.98 0 0 0 5.063 1.372h.004c5.544 0 10.03-4.486 10.03-10.031C22.065 6.486 17.579 2 12.031 2zm5.847 14.252c-.245.69-1.434 1.318-1.992 1.402-.507.077-1.15.109-1.855-.117-.428-.136-.978-.318-1.685-.622-2.966-1.281-4.904-4.267-5.052-4.464-.148-.197-1.208-1.607-1.208-3.066 0-1.458.764-2.176 1.036-2.472.271-.296.592-.37.789-.37.197 0 .394.002.567.01.182.009.426-.069.666.508.246.591.838 2.043.912 2.191.074.148.123.32.025.518-.099.197-.148.32-.296.493-.148.173-.312.386-.444.518-.148.148-.302.309-.13.605.173.296.767 1.266 1.648 2.051 1.132 1.01 2.087 1.323 2.383 1.471.296.148.468.123.64-.074.173-.197.74-.862.937-1.158.197-.296.394-.247.666-.148.271.099 1.726.814 2.022.962.296.148.493.222.567.345.074.123.074.714-.171 1.405z" />
      </svg>
    </a>
  );
};
