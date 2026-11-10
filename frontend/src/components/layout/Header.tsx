import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { StoreSettings } from '../../api/types';

export interface HeaderProps {
  settings?: StoreSettings | null;
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ settings, cartCount = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Sanitize announcement to ensure Spider Verse F1 Toys branding even if backend db was seeded with old brand
  const rawAnnouncement = settings?.announcement_bar || '';
  const isOldBranding = /DECANTS|AROMATICA|PERFUME|FRAGRANCE/i.test(rawAnnouncement);
  const announcement =
    rawAnnouncement && !isOldBranding
      ? rawAnnouncement
      : 'FREE SPEEDWAY SHIPPING ACROSS DHAKA ON ORDERS OVER ৳ 3,000 · COLLECTOR GRADE F1 DIECAST';

  return (
    <header className="sticky top-0 z-50 bg-[#0b0d10]/95 backdrop-blur-md border-b border-[#202736]">
      {/* Top Telemetry / Announcement Bar */}
      <div className="bg-[#e10600] text-white text-xs font-mono-telemetry py-1.5 px-4 overflow-hidden relative">
        <div className="absolute inset-0 speed-stripes opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            <span className="font-bold tracking-widest uppercase truncate">{announcement}</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] uppercase tracking-wider shrink-0 font-bold">
            <span className="text-[#ffe600]">CIRCUIT: DHAKA</span>
            <span>STATUS: PIT LANE OPEN</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          {/* F1 x Marvel Badge Mark */}
          <div className="w-11 h-11 bg-gradient-to-br from-[#e10600] via-[#b30500] to-[#0b0d10] border border-[#ff3d38] clip-corner-tr flex items-center justify-center shadow-[0_0_15px_rgba(225,6,0,0.4)] group-hover:shadow-[0_0_25px_rgba(255,230,0,0.6)] group-hover:border-[#ffe600] transition-all">
            <span className="font-mono-telemetry font-black text-xl italic text-white group-hover:text-[#ffe600] transition-colors">
              SV
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black italic tracking-wider text-white uppercase font-condensed">
                SPIDER
              </span>
              <span className="text-2xl sm:text-3xl font-black italic tracking-wider text-[#e10600] uppercase font-condensed">
                VERSE
              </span>
            </div>
            <span className="text-[10px] font-mono-telemetry tracking-[0.25em] uppercase text-[#ffe600] -mt-1 font-bold">
              F1 TOYS & MOTORSPORT
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-base font-condensed italic uppercase font-extrabold tracking-wider">
          <Link
            to="/"
            className="text-[#f0f2f5] hover:text-[#e10600] transition-colors flex items-center gap-1.5 py-1"
          >
            GRID
          </Link>
          <Link
            to="/products"
            className="text-[#8e9bb0] hover:text-white hover:text-[#ffe600] transition-colors flex items-center gap-1.5 py-1"
          >
            F1 DIECAST MODELS
          </Link>
          <Link
            to="/collections/championship"
            className="text-[#8e9bb0] hover:text-white hover:text-[#00d2ff] transition-colors flex items-center gap-1.5 py-1"
          >
            HERO EDITIONS
          </Link>
          <Link
            to="/about"
            className="text-[#8e9bb0] hover:text-white transition-colors py-1"
          >
            MISSION BRIEF
          </Link>
          <Link
            to="/contact"
            className="text-[#8e9bb0] hover:text-white transition-colors py-1"
          >
            PIT CREW
          </Link>
        </nav>

        {/* Actions (Search, Cart & Mobile Menu Toggle) */}
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2.5 text-[#8e9bb0] hover:text-white hover:bg-[#181d26] border border-transparent hover:border-[#2b3548] transition-colors clip-corner-tr"
            title="Search Catalog"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Cart Trigger (Routes to /cart placeholder or drawer in Task 3) */}
          <Link
            to="/cart"
            className="relative p-2.5 bg-[#181d26] text-white hover:bg-[#202736] border border-[#2b3548] hover:border-[#e10600] transition-all clip-corner-tr group"
            title="View Pit Bag"
          >
            <ShoppingBag className="w-5 h-5 group-hover:text-[#e10600] transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e10600] text-white font-mono-telemetry text-xs font-bold flex items-center justify-center rounded-none clip-racing-tag">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 text-[#8e9bb0] hover:text-white hover:bg-[#181d26] border border-[#242c3d]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e1218] border-b border-[#242c3d] px-6 py-6 space-y-4">
          <nav className="flex flex-col gap-3 font-condensed italic uppercase text-lg font-black tracking-wide">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-[#e10600] py-2 border-b border-[#1b2230]"
            >
              GRID // HOME
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#8e9bb0] hover:text-[#ffe600] py-2 border-b border-[#1b2230]"
            >
              F1 DIECAST CATALOG
            </Link>
            <Link
              to="/collections/all"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#8e9bb0] hover:text-[#00d2ff] py-2 border-b border-[#1b2230]"
            >
              HERO EDITIONS
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#8e9bb0] hover:text-white py-2 border-b border-[#1b2230]"
            >
              TELEMETRY ORDER TRACKER
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#8e9bb0] hover:text-white py-2 border-b border-[#1b2230]"
            >
              MISSION BRIEF (ABOUT)
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#8e9bb0] hover:text-white py-2"
            >
              PIT CREW (CONTACT)
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
