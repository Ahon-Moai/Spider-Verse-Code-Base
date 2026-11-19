import React, { useState } from 'react';
import { X, Search, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onNavigateHome?: () => void;
  onNavigateToCollection?: (slug: string) => void;
  storeSettings?: any;
}

const resolveBrandName = (rawName?: string) => {
  if (!rawName || /aromatica/i.test(rawName)) return 'APEX PADDOCK';
  return rawName;
};

const resolveEmail = (rawEmail?: string) => {
  if (!rawEmail || /aromatica/i.test(rawEmail)) return 'concierge@apexpaddock.com.bd';
  return rawEmail;
};

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onNavigateHome,
  onNavigateToCollection,
  storeSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandName = resolveBrandName(storeSettings?.store_name);

  const handleCollectionClick = (slug: string) => {
    setMobileMenuOpen(false);
    if (onNavigateToCollection) {
      onNavigateToCollection(slug);
    } else {
      window.location.href = `/collections/${slug}`;
    }
  };

  const scrollToSection = (id: string, fallbackSlug?: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (fallbackSlug) {
      handleCollectionClick(fallbackSlug);
    } else if (onNavigateHome) {
      onNavigateHome();
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08090B]/95 backdrop-blur-md border-b border-white/10 transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-11 md:h-12 flex items-center justify-between gap-4 md:gap-8">
        {/* Mobile Left: Clean Search Icon (no bg, no border) */}
        <div className="flex items-center justify-start w-10 md:hidden">
          <button
            type="button"
            onClick={onOpenSearch}
            className="p-2 -ml-2 text-[#F4F2EE] hover:text-[#E10600] bg-transparent border-0 transition-colors cursor-pointer shrink-0"
            aria-label="Search F1 Models"
            title="Search F1 Models"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Zone 1: Marvel-style Compressed Block Brand Wordmark (Flush Top-to-Bottom of Navbar) */}
        <a
          href="/"
          onClick={(e) => {
            if (onNavigateHome) {
              e.preventDefault();
              onNavigateHome();
            }
          }}
          className="h-full inline-flex items-center justify-center bg-[#EC1D24] text-white px-1 sm:px-1.5 font-logo text-[32px] md:text-[38px] tracking-[-0.035em] leading-[0.78] uppercase hover:brightness-110 transition-all whitespace-nowrap shrink-0 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={`${brandName} Home`}
        >
          <span className="inline-block scale-y-[1.08] translate-y-[0.02em]">{brandName}</span>
        </a>

        {/* Zone 2: Concise Single-Line Navigation Links (PC) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-[0.16em] uppercase text-[#C4C9D4]">
          <button
            type="button"
            onClick={() => handleCollectionClick('all')}
            className="relative py-1 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[#E10600] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-200"
          >
            Shop
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('new-arrivals', 'new-arrivals')}
            className="relative py-1 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[#E10600] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-200"
          >
            New Arrivals
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('for-him-her', 'featured')}
            className="relative py-1 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[#E10600] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-200"
          >
            Scales
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('trust-section')}
            className="relative py-1 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[#E10600] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-200"
          >
            Garage
          </button>
        </nav>

        {/* Mobile Right: Just the Cart Icon */}
        <div className="flex items-center justify-end w-10 md:hidden">
          <button
            type="button"
            onClick={onOpenCart}
            className="relative p-2 -mr-2 text-[#F4F2EE] hover:text-[#E10600] bg-transparent border-0 transition-colors cursor-pointer shrink-0"
            aria-label={`Shopping Bag (${cartCount})`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0 min-w-[16px] h-4 px-1 bg-[#E10600] text-white font-mono text-[10px] font-bold flex items-center justify-center rounded-full tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Zone 3: PC Primary Action & Search (Unchanged on Desktop) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            className="p-2 text-[#C4C9D4] hover:text-white border border-white/10 hover:border-white/30 bg-[#111317] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            aria-label="Search F1 Models"
            title="Search F1 Models"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="btn-f1 px-4 py-1.5 bg-[#E10600] hover:bg-[#ff1e18] text-white text-sm font-display font-bold tracking-[0.08em] uppercase transition-colors cursor-pointer whitespace-nowrap shrink-0"
            aria-label={`Shopping Bag (${cartCount})`}
          >
            <span className="btn-f1-inner">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="tabular-nums">Bag ({cartCount})</span>
            </span>
          </button>
        </div>
      </div>

      {/* Slide-out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="bg-[#0B0D11] text-[#F4F2EE] w-full max-w-sm h-full p-6 sm:p-8 border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-display font-extrabold text-2xl tracking-[0.14em] uppercase">
                  {brandName}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 border border-white/15 text-[#C4C9D4] hover:text-white hover:border-[#E10600] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col space-y-2">
                {[
                  { label: 'Shop All F1 Cars', action: () => handleCollectionClick('all') },
                  { label: '1:18 Pro Diecast', action: () => handleCollectionClick('forhim') },
                  { label: '1:43 Acrylic Grid', action: () => handleCollectionClick('forher') },
                  { label: 'New Arrivals', action: () => scrollToSection('new-arrivals', 'new-arrivals') },
                  { label: 'Garage & Standards', action: () => scrollToSection('trust-section') },
                  { label: 'Collector Reviews & FAQ', action: () => scrollToSection('faq') },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className="w-full text-left py-3 px-2 font-display text-2xl font-bold uppercase tracking-wide text-[#F4F2EE] hover:text-[#E10600] border-b border-white/5 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSearch();
                  }}
                  className="w-full text-left py-3 px-2 font-sans text-sm font-semibold uppercase tracking-[0.14em] text-[#C4C9D4] hover:text-white inline-flex items-center gap-2.5 pt-4 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-[#E10600]" />
                  <span>Search Models</span>
                </button>
              </nav>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-[#9CA3AF]">
                <p className="font-mono tracking-[0.2em] uppercase text-[10px] text-[#E10600]">
                  Paddock Concierge
                </p>
                <p>{storeSettings?.address || 'Banani High Street, Block 11, Dhaka 1213'}</p>
                <p className="font-mono">{resolveEmail(storeSettings?.contact_email)}</p>
                <p className="font-mono">{storeSettings?.contact_phone || '+880 1700-000000'}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-[11px] font-mono text-[#9CA3AF] flex justify-between items-center">
              <span>{brandName}</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
