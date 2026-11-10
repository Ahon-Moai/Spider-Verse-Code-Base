import React from 'react';
import { Link } from 'react-router-dom';
import { StoreSettings } from '../../api/types';
import { ShieldCheck, Zap, Gauge, Award, Phone, Mail, MapPin } from 'lucide-react';

export interface FooterProps {
  settings?: StoreSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  return (
    <footer className="bg-[#07080a] border-t-2 border-[#1c2230] text-[#8e9bb0] relative overflow-hidden">
      {/* Decorative top speed stripes */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#e10600] via-[#ffe600] to-[#00d2ff]" />

      {/* Halftone watermark background */}
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-halftone-pattern opacity-10 pointer-events-none" />

      {/* Pit Stop Trust Badges */}
      <div className="border-b border-[#181e2b] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e10600]/10 border border-[#e10600]/40 clip-racing-tag flex items-center justify-center text-[#e10600]">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-condensed font-black italic uppercase text-sm sm:text-base">
                PRECISION RATIO
              </div>
              <div className="text-xs text-[#8e9bb0]">1:43 & 1:18 Telemetry Specs</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ffe600]/10 border border-[#ffe600]/40 clip-racing-tag flex items-center justify-center text-[#ffe600]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-condensed font-black italic uppercase text-sm sm:text-base">
                100% DIECAST METAL
              </div>
              <div className="text-xs text-[#8e9bb0]">Authentic Collector Grade</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00d2ff]/10 border border-[#00d2ff]/40 clip-racing-tag flex items-center justify-center text-[#00d2ff]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-condensed font-black italic uppercase text-sm sm:text-base">
                EXPRESS PIT DELIVERY
              </div>
              <div className="text-xs text-[#8e9bb0]">Same-Day Dispatch in Dhaka</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 border border-white/20 clip-racing-tag flex items-center justify-center text-white">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-condensed font-black italic uppercase text-sm sm:text-base">
                LIMITED PODIUM EDITIONS
              </div>
              <div className="text-xs text-[#8e9bb0]">Serialized Numbered Plaques</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Overview */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e10600] clip-corner-tr flex items-center justify-center font-mono-telemetry text-white font-bold text-sm">
              SV
            </div>
            <span className="text-2xl font-black italic tracking-wider text-white font-condensed">
              SPIDER <span className="text-[#e10600]">VERSE</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[#8e9bb0]">
            The intersection of raw Formula 1 aerodynamics and superhuman comic book energy. Engineering the fiercest miniature machines on the planet.
          </p>
          <div className="pt-2 text-xs font-mono-telemetry text-[#ffe600]">
            EST. 2026 // DHAKA PADDOCK
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white text-base font-bold italic uppercase tracking-wider mb-4 border-l-2 border-[#e10600] pl-2 font-condensed">
            CIRCUIT SECTIONS
          </h4>
          <ul className="space-y-2 text-sm font-medium">
            <li>
              <Link to="/products" className="hover:text-[#ffe600] transition-colors">
                All Diecast Cars
              </Link>
            </li>
            <li>
              <Link to="/collections/f1-championship" className="hover:text-[#ffe600] transition-colors">
                Championship Grid
              </Link>
            </li>
            <li>
              <Link to="/collections/hero-editions" className="hover:text-[#ffe600] transition-colors">
                Spider-Hero Editions
              </Link>
            </li>
            <li>
              <Link to="/track" className="hover:text-[#ffe600] transition-colors">
                Telemetry Order Tracker
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Static Pages */}
        <div>
          <h4 className="text-white text-base font-bold italic uppercase tracking-wider mb-4 border-l-2 border-[#00d2ff] pl-2 font-condensed">
            PIT OPERATIONS
          </h4>
          <ul className="space-y-2 text-sm font-medium">
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                Mission & Workshop
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">
                Pit Crew Support
              </Link>
            </li>
            <li>
              <Link to="/track" className="hover:text-white transition-colors">
                Order Tracking
              </Link>
            </li>
            <li>
              <Link to="/admin" className="text-xs text-[#505f79] hover:text-[#e10600] transition-colors flex items-center gap-1 mt-4">
                [Paddock Telemetry Admin]
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info from store settings */}
        <div>
          <h4 className="text-white text-base font-bold italic uppercase tracking-wider mb-4 border-l-2 border-[#ffe600] pl-2 font-condensed">
            PADDOCK HEADQUARTERS
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#e10600] shrink-0 mt-0.5" />
              <span>{settings?.address || 'Banani High Street, Block 11, Dhaka 1213, Bangladesh'}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#ffe600] shrink-0" />
              <span>{settings?.contact_phone || '+880 1700-000000'}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#00d2ff] shrink-0" />
              <span>{settings?.contact_email || 'pitcrew@spiderverse.toys'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#141822] py-6 text-xs text-[#505f79] font-mono-telemetry">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} SPIDER VERSE RACING COLLECTIBLES. ALL SPECIFICATIONS RESERVED.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>DESIGN THEME: F1 MEETS MARVEL</span>
            <span>•</span>
            <span className="text-[#e10600]">MAX DOWNFORCE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
