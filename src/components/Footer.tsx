import React from 'react';
import { BrandLogo } from './BrandLogo';
import { buildWhatsAppUrl } from '../utils/contact';

interface FooterProps {
  storeSettings?: any;
}

const resolveStoreName = (raw?: string) => {
  if (!raw || /aromatica/i.test(raw)) return 'SPIDER VERSE';
  return raw;
};

export const Footer: React.FC<FooterProps> = ({ storeSettings }) => {
  const storeName = resolveStoreName(storeSettings?.store_name);
  const whatsappUrl = buildWhatsAppUrl(storeSettings?.contact_phone);

  return (
    <footer
      id="account-section"
      className="perf-section w-full bg-[#08090B] text-[#F4F2EE] pb-16 md:pb-0 overflow-hidden border-t border-white/10"
    >
      {/* Minimal Footer: Brand Logo + Facebook, Instagram, WhatsApp Icons */}
      <div className="w-full bg-[#07080A] py-10 sm:py-14 select-none overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-7 sm:gap-8 text-center">
          <BrandLogo name={storeName} variant="footer" />

          <div className="flex items-center justify-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              title="Facebook"
              className="w-11 h-11 flex items-center justify-center border border-white/15 bg-[#111317] text-[#C4C9D4] hover:text-white hover:border-[#E10600] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z" />
              </svg>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
              className="w-11 h-11 flex items-center justify-center border border-white/15 bg-[#111317] text-[#C4C9D4] hover:text-white hover:border-[#E10600] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
              className="w-11 h-11 flex items-center justify-center border border-white/15 bg-[#111317] text-[#C4C9D4] hover:text-white hover:border-[#E10600] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.031 2C6.486 2 2 6.486 2 12.031c0 1.771.463 3.498 1.342 5.02L2.05 21.848l4.918-1.29a9.98 9.98 0 0 0 5.063 1.372h.004c5.544 0 10.03-4.486 10.03-10.031C22.065 6.486 17.579 2 12.031 2zm5.847 14.252c-.245.69-1.434 1.318-1.992 1.402-.507.077-1.15.109-1.855-.117-.428-.136-.978-.318-1.685-.622-2.966-1.281-4.904-4.267-5.052-4.464-.148-.197-1.208-1.607-1.208-3.066 0-1.458.764-2.176 1.036-2.472.271-.296.592-.37.789-.37.197 0 .394.002.567.01.182.009.426-.069.666.508.246.591.838 2.043.912 2.191.074.148.123.32.025.518-.099.197-.148.32-.296.493-.148.173-.312.386-.444.518-.148.148-.302.309-.13.605.173.296.767 1.266 1.648 2.051 1.132 1.01 2.087 1.323 2.383 1.471.296.148.468.123.64-.074.173-.197.74-.862.937-1.158.197-.296.394-.247.666-.148.271.099 1.726.814 2.022.962.296.148.493.222.567.345.074.123.074.714-.171 1.405z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
