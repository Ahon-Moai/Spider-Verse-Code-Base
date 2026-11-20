import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { FragranceProduct } from '../types';

interface TrustSectionProps {
  storeSettings?: any;
  products?: FragranceProduct[];
  onNavigateToCollection?: (slug: string) => void;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ storeSettings }) => {
  const feeDhaka = storeSettings?.shipping_fee_dhaka || '70';
  const feeOutside = storeSettings?.shipping_fee_outside_dhaka || '130';
  const freeThreshold = storeSettings?.free_shipping_threshold || '3000';

  const telemetrySpecs = [
    {
      label: 'CHASSIS IN VAULT',
      value: '1,000+',
      sub: 'Diecast & RC F1 models stocked',
    },
    {
      label: 'MAKERS & TEAMS',
      value: '35+',
      sub: 'Official licensed constructors & brands',
    },
    {
      label: 'MODELS DISPATCHED',
      value: '89,000+',
      sub: 'Foam-cradled collector shipments',
    },
    {
      label: 'COLLECTOR ROSTER',
      value: '29,000+',
      sub: 'Verified motorsport enthusiasts',
    },
    {
      label: 'LIVERY AUTHENTICITY',
      value: '100%',
      sub: 'Official licensed team decals',
    },
    {
      label: 'NATIONWIDE DISPATCH',
      value: `৳${feeDhaka} / ৳${feeOutside}`,
      sub: `Dhaka / Outside · Free over ৳${freeThreshold}`,
    },
    {
      label: 'SCALE CALIBRATION',
      value: '1:18 · 1:43 · 1:64',
      sub: 'Zinc alloy · rubber Pirelli slicks',
    },
    {
      label: 'TRANSIT GUARANTEE',
      value: 'WING PROTECTED',
      sub: 'Instant replacement on aero damage',
    },
  ];

  return (
    <section
      id="trust-section"
      className="w-full bg-[#08090B] text-[#F4F2EE] py-16 sm:py-24 border-b border-white/10 apex-grid-dark select-none"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Paddock Telemetry Matrix */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/15 pb-4 mb-8 gap-3">
            <div>
              <span className="font-mono text-[11px] tracking-[0.22em] text-[#E10600] uppercase font-semibold block">
                Engineering & Standards
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white leading-none mt-1">
                Licensed. Detailed. Race Ready.
              </h2>
            </div>
            <span className="font-mono text-xs text-[#9CA3AF] uppercase tracking-[0.16em]">
              Official Pit Garage · Dhaka
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {telemetrySpecs.map((spec) => (
              <div
                key={spec.label}
                className="bg-[#111317] border border-white/10 hover:border-[#E10600] p-5 flex flex-col justify-between min-h-[128px] transition-colors duration-200 group"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#9CA3AF] group-hover:text-[#E10600] transition-colors">
                  {spec.label}
                </span>
                <p className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white my-2 tabular-nums">
                  {spec.value}
                </p>
                <p className="text-xs text-[#C4C9D4]">{spec.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payments Verification Strip */}
        <div className="bg-[#111317] border border-white/15 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E10600]" />
              <h4 className="font-display text-lg font-bold text-white uppercase tracking-wide">
                Verified Checkout · Cash On Delivery & SSLCommerz
              </h4>
            </div>
            <p className="text-xs text-[#9CA3AF]">
              Visa · Mastercard · Amex · bKash · Nagad · Rocket · Cash on Delivery nationwide
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.14em] text-[#C4C9D4]">
            <span className="px-2.5 py-1 bg-[#08090B] border border-white/15">VISA</span>
            <span className="px-2.5 py-1 bg-[#08090B] border border-white/15">MASTERCARD</span>
            <span className="px-2.5 py-1 bg-[#08090B] border border-white/15">BKASH</span>
            <span className="px-2.5 py-1 bg-[#08090B] border border-white/15">NAGAD</span>
            <span className="px-2.5 py-1 bg-[#08090B] border border-[#E10600]/60 text-white">
              256-BIT SSL
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
