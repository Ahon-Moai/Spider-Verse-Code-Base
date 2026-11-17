import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { FragranceProduct } from '../types';

interface BrandItem {
  name: string;
  slug: string;
  image?: string;
  count?: number;
}

interface TrustSectionProps {
  storeSettings?: any;
  products?: FragranceProduct[];
  onNavigateToCollection?: (slug: string) => void;
}

const BRAND_FALLBACK_IMAGES: Record<string, string> = {
  bburago: '/src/assets/images/campaign_f1_pro_118_1794664772367.jpg',
  minichamps: '/src/assets/images/series_f1_classic_red_1794664772823.jpg',
  'spark-model': '/src/assets/images/series_f1_carbon_stealth_1794664773109.jpg',
  'maisto-tech': '/src/assets/images/series_f1_night_aero_1794664771085.jpg',
  'rastar-rc': '/src/assets/images/series_f1_rc_sprint_1794664772832.jpg',
  solido: '/src/assets/images/campaign_f1_display_143_1794664770809.jpg',
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export const TrustSection: React.FC<TrustSectionProps> = ({
  storeSettings,
  products = [],
  onNavigateToCollection,
}) => {
  const feeDhaka = storeSettings?.shipping_fee_dhaka || '70';
  const feeOutside = storeSettings?.shipping_fee_outside_dhaka || '130';
  const freeThreshold = storeSettings?.free_shipping_threshold || '3000';

  const brandsList: BrandItem[] = React.useMemo(() => {
    const brandMap = new Map<string, { count: number; image: string; name: string }>();

    products.forEach((p) => {
      if (!p.brand) return;
      const bName = p.brand.trim();
      const existing = brandMap.get(bName);
      if (existing) {
        existing.count += 1;
        if (!existing.image && p.image) existing.image = p.image;
      } else {
        brandMap.set(bName, {
          name: bName,
          count: 1,
          image: p.image || '',
        });
      }
    });

    const defaults = [
      { name: 'BBURAGO', image: '/src/assets/images/campaign_f1_pro_118_1794664772367.jpg', count: 16 },
      { name: 'MINICHAMPS', image: '/src/assets/images/series_f1_classic_red_1794664772823.jpg', count: 11 },
      { name: 'SPARK MODEL', image: '/src/assets/images/series_f1_carbon_stealth_1794664773109.jpg', count: 9 },
      { name: 'MAISTO TECH', image: '/src/assets/images/series_f1_night_aero_1794664771085.jpg', count: 8 },
      { name: 'RASTAR RC', image: '/src/assets/images/series_f1_rc_sprint_1794664772832.jpg', count: 14 },
      { name: 'SOLIDO', image: '/src/assets/images/campaign_f1_display_143_1794664770809.jpg', count: 10 },
    ];

    if (brandMap.size === 0) {
      return defaults.map((d) => ({
        name: d.name,
        slug: slugify(d.name),
        image: d.image,
        count: d.count,
      }));
    }

    const result: BrandItem[] = [];
    brandMap.forEach((val, key) => {
      const slug = slugify(key);
      const img =
        val.image ||
        BRAND_FALLBACK_IMAGES[slug] ||
        '/src/assets/images/campaign_f1_pro_118_1794664772367.jpg';
      result.push({ name: key, slug, image: img, count: val.count });
    });

    if (result.length < 6) {
      defaults.forEach((d) => {
        const slug = slugify(d.name);
        if (!result.some((r) => r.slug === slug)) {
          result.push({ name: d.name, slug, image: d.image, count: d.count });
        }
      });
    }

    return result.slice(0, 12);
  }, [products]);

  const handleBrandClick = (slug: string) => {
    if (onNavigateToCollection) {
      onNavigateToCollection(slug);
    } else {
      window.location.href = `/collections/${slug}`;
    }
  };

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

        {/* Shop By Makers Directory */}
        <div id="shop-by-brands">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/15 pb-4 mb-8 gap-3">
            <div>
              <span className="font-mono text-[11px] tracking-[0.22em] text-[#E10600] uppercase font-semibold block">
                Scale Constructors
              </span>
              <h3 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-white leading-none mt-1">
                Shop By Makers
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#9CA3AF] max-w-md">
              Select a diecast or RC manufacturer to inspect officially licensed Formula 1 toy cars.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brandsList.map((brand) => (
              <div
                key={brand.slug}
                onClick={() => handleBrandClick(brand.slug)}
                className="group cursor-pointer bg-[#111317] border border-white/10 hover:border-[#E10600] p-3.5 flex flex-col justify-between transition-colors duration-200"
              >
                <div className="relative w-full aspect-square bg-[#08090B] overflow-hidden flex items-center justify-center mb-3 border border-white/10">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 right-2 bg-[#08090B]/90 text-white text-[9px] font-mono font-semibold px-1.5 py-0.5 tabular-nums border border-white/15">
                    {brand.count} {brand.count === 1 ? 'CAR' : 'CARS'}
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-between gap-2">
                  <h4 className="font-display font-bold text-sm sm:text-base text-white uppercase tracking-wide truncate group-hover:text-[#E10600] transition-colors">
                    {brand.name}
                  </h4>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#E10600] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
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
