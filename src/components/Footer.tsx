import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

interface FooterProps {
  storeSettings?: any;
}

const resolveStoreName = (raw?: string) => {
  if (!raw || /aromatica/i.test(raw)) return 'SPIDER VERSE';
  return raw;
};

const resolveTagline = (raw?: string) => {
  if (!raw || /fragrance|scent|by the ml|perfume/i.test(raw)) {
    return 'Precision Formula 1 diecast & RC models. Built to display and race.';
  }
  return raw;
};

export const Footer: React.FC<FooterProps> = ({ storeSettings }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const storeName = resolveStoreName(storeSettings?.store_name);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
    }, 3000);
  };

  return (
    <footer
      id="account-section"
      className="perf-section w-full bg-[#07080A] text-[#F4F2EE] pt-10 pb-20 md:pb-12 overflow-hidden border-t border-white/10"
    >
      {/* Oversized Marvel-Style Brand Wordmark Banner */}
      <div className="w-full border-b border-white/10 bg-[#08090B] py-8 sm:py-12 select-none overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center flex items-center justify-center">
          <p className="font-logo bg-[#EC1D24] text-white px-5 sm:px-8 py-2 sm:py-3 text-[11vw] sm:text-[8.5vw] lg:text-[6.8vw] tracking-[-0.02em] uppercase leading-[0.86] whitespace-nowrap">
            {storeName}
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Dispatch Newsletter */}
          <div className="lg:col-span-5 space-y-5">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#E10600] font-semibold block">
              Paddock Dispatch
            </span>
            <h3 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">
              Stay In Pole Position
            </h3>

            <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed max-w-md">
              Receive immediate alerts on limited 1:18 championship drops, new seasonal team liveries, and 2.4GHz RC restocks.
            </p>

            <form onSubmit={handleSubscribe} className="max-w-md space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email address"
                  className="flex-1 bg-[#111317] border border-white/15 text-white placeholder-[#9CA3AF] text-xs px-4 py-3.5 focus:outline-none focus:border-[#E10600] transition-colors"
                />
                <button
                  type="submit"
                  className="btn-f1 px-6 py-3 bg-[#E10600] hover:bg-[#ff1e18] text-white font-display text-sm font-bold tracking-[0.08em] uppercase transition-colors flex items-center justify-center cursor-pointer shrink-0"
                >
                  <span className="btn-f1-inner">
                    {subscribed ? (
                      <>
                        <span>Joined</span>
                        <Check className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </span>
                </button>
              </div>

              {error && <p className="text-[#E10600] text-[11px] font-mono">{error}</p>}
              {subscribed && (
                <p className="text-emerald-400 text-[11px] font-mono">
                  Subscribed to {storeName} grid alerts.
                </p>
              )}
            </form>

            <p className="text-[11px] text-[#9CA3AF]">
              By subscribing, you agree to our{' '}
              <a href="#faq" className="underline hover:text-white">
                Privacy Policy
              </a>
              . Unsubscribe anytime.
            </p>
          </div>

          {/* Right Column: Navigation Columns */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            <p className="text-xs sm:text-sm font-mono text-[#C4C9D4] tracking-wide uppercase">
              {resolveTagline(storeSettings?.tagline)}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
              <div className="space-y-3">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E10600] font-semibold">
                  Shop
                </p>
                <ul className="space-y-2 text-[#9CA3AF]">
                  <li>
                    <a href="#new-arrivals" className="hover:text-white transition-colors">
                      New Arrivals
                    </a>
                  </li>
                  <li>
                    <a href="#for-him-her" className="hover:text-white transition-colors">
                      1:18 & 1:43 Divisions
                    </a>
                  </li>
                  <li>
                    <a href="#seasons" className="hover:text-white transition-colors">
                      Racing Series
                    </a>
                  </li>
                  <li>
                    <a href="#journal" className="hover:text-white transition-colors">
                      Scale Guides
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E10600] font-semibold">
                  Support
                </p>
                <ul className="space-y-2 text-[#9CA3AF]">
                  <li>
                    <a href="#faq" className="hover:text-white transition-colors">
                      1:18 vs 1:43 Guide
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-white transition-colors">
                      FAQs
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-white transition-colors">
                      Shipping & Delivery
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-white transition-colors">
                      Payment Methods
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-white transition-colors">
                      Wing Protection Policy
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E10600] font-semibold">
                  Garage
                </p>
                <ul className="space-y-2 text-[#9CA3AF]">
                  <li>
                    <a href="#studio-section" className="hover:text-white transition-colors">
                      Inside Our Pit Garage
                    </a>
                  </li>
                  <li>
                    <a href="#reviews" className="hover:text-white transition-colors">
                      Collector Reviews
                    </a>
                  </li>
                  <li className="font-mono text-[11px] text-[#C4C9D4] pt-1">
                    {storeSettings?.contact_phone || '+880 1700-000000'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-[#9CA3AF]">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>

          <div className="text-[11px] font-mono text-[#9CA3AF] text-center sm:text-right">
            © {new Date().getFullYear()} {storeName} · {storeSettings?.address || 'Dhaka, Bangladesh'}
          </div>
        </div>
      </div>
    </footer>
  );
};
