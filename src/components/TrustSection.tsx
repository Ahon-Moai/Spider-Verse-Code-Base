import React from 'react';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
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

// Fallback curated brand visuals mapping
const BRAND_FALLBACK_IMAGES: Record<string, string> = {
  'arrina': '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg',
  'arrina-atelier': '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg',
  'swiss-arabian': '/src/assets/images/perfume_rose01_1791908158391.jpg',
  'french-avenue': '/src/assets/images/perfume_genesis_leo_1791908160379.jpg',
  'asdaaf': '/src/assets/images/perfume_asdaaf_raneen_1791908163183.jpg',
  'lattafa': '/src/assets/images/season_dark_forest_1791908203381.jpg',
  'armaf': '/src/assets/images/season_dune_red_sun_1791908201156.jpg',
  'creed': '/src/assets/images/studio_social_gold_flacon_1791908204833.jpg',
  'chanel': '/src/assets/images/article_perfume_roses_water_1791908274460.jpg',
  'dior': '/src/assets/images/season_sculptural_roses_1791908202058.jpg',
  'giorgio-armani': '/src/assets/images/studio_social_amber_spray_1791908204588.jpg',
  'dolce-gabbana': '/src/assets/images/element_vanilla_neroli_1791911761343.jpg',
};

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export const TrustSection: React.FC<TrustSectionProps> = ({
  storeSettings,
  products = [],
  onNavigateToCollection
}) => {
  const feeDhaka = storeSettings?.shipping_fee_dhaka || '70';
  const feeOutside = storeSettings?.shipping_fee_outside_dhaka || '130';
  const freeThreshold = storeSettings?.free_shipping_threshold || '3000';

  // Derive dynamic brand items with images and perfume counts
  const brandsList: BrandItem[] = React.useMemo(() => {
    const brandMap = new Map<string, { count: number; image: string; name: string }>();

    products.forEach((p) => {
      if (!p.brand) return;
      const bName = p.brand.trim();
      const existing = brandMap.get(bName);
      if (existing) {
        existing.count += 1;
        if (!existing.image && p.image) {
          existing.image = p.image;
        }
      } else {
        brandMap.set(bName, {
          name: bName,
          count: 1,
          image: p.image || ''
        });
      }
    });

    // Curated catalog fallback brands if products list is minimal
    const defaults = [
      { name: 'SWISS ARABIAN', image: '/src/assets/images/perfume_rose01_1791908158391.jpg', count: 12 },
      { name: 'FRENCH AVENUE', image: '/src/assets/images/perfume_genesis_leo_1791908160379.jpg', count: 8 },
      { name: 'ARRINA ATELIER', image: '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg', count: 6 },
      { name: 'ASDAAF', image: '/src/assets/images/perfume_asdaaf_raneen_1791908163183.jpg', count: 7 },
      { name: 'LATTAFA', image: '/src/assets/images/season_dark_forest_1791908203381.jpg', count: 14 },
      { name: 'ARMAF', image: '/src/assets/images/season_dune_red_sun_1791908201156.jpg', count: 9 },
    ];

    if (brandMap.size === 0) {
      return defaults.map((d) => ({
        name: d.name,
        slug: slugify(d.name),
        image: d.image,
        count: d.count
      }));
    }

    const result: BrandItem[] = [];
    brandMap.forEach((val, key) => {
      const slug = slugify(key);
      const img = val.image || BRAND_FALLBACK_IMAGES[slug] || '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg';
      result.push({
        name: key,
        slug,
        image: img,
        count: val.count
      });
    });

    // Supplement with curated defaults if fewer than 5
    if (result.length < 5) {
      defaults.forEach((d) => {
        const slug = slugify(d.name);
        if (!result.some((r) => r.slug === slug)) {
          result.push({
            name: d.name,
            slug,
            image: d.image,
            count: d.count
          });
        }
      });
    }

    return result;
  }, [products]);

  const handleBrandClick = (slug: string) => {
    if (onNavigateToCollection) {
      onNavigateToCollection(slug);
    } else {
      window.location.href = `/collections/${slug}`;
    }
  };

  return (
    <section id="trust-section" className="w-full bg-[#ECE8E1] text-[#FF1801] pt-12 pb-16 sm:pb-24 select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section 1: Community Header & Editorial Dividing Line */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3">
            <span className="text-[11px] sm:text-xs tracking-[0.25em] uppercase font-bold text-[#FF1801]">
              ++ COMMUNITY
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2 mb-3">
            <h2 className="font-sans font-black text-2xl sm:text-3xl md:text-5xl uppercase tracking-tight text-[#FF1801] leading-none">
              Trusted, stocked, moving fast
            </h2>
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-[#FF1801]/80">
              BANGLADESH'S #1 DECANT ATELIER
            </span>
          </div>

          {/* Thick Solid Red Horizontal Divider */}
          <div className="w-full h-[3.5px] sm:h-[4.5px] md:h-[5px] bg-[#FF1801] mt-3 sm:mt-4 mb-8" />

          {/* Dense Trust Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Column 1 */}
            <div className="space-y-3.5">
              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 min-h-[120px] flex flex-col justify-between hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                  LARGEST DECANT COLLECTION IN BD
                </p>
                <p className="font-black text-2xl sm:text-3xl text-[#FF1801] group-hover:text-[#FAF8F5] my-1 tabular-nums tracking-tight">
                  1,000+
                </p>
                <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90 font-medium">
                  Current Open Bottles Count
                </p>
              </div>

              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 min-h-[120px] flex flex-col justify-between hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                  BRANDS WE OFFER
                </p>
                <p className="font-black text-2xl sm:text-3xl text-[#FF1801] group-hover:text-[#FAF8F5] my-1 tabular-nums tracking-tight">
                  160+
                </p>
                <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90 font-medium">
                  Unique Brands In Our Collection
                </p>
              </div>

              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 min-h-[120px] flex flex-col justify-between hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                  TOTAL SOLD
                </p>
                <p className="font-black text-2xl sm:text-3xl text-[#FF1801] group-hover:text-[#FAF8F5] my-1 tabular-nums tracking-tight">
                  89,000+
                </p>
                <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90 font-medium">
                  Decant Count | Till Date
                </p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3.5">
              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 min-h-[120px] flex flex-col justify-between hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                  CUSTOMERS
                </p>
                <p className="font-black text-2xl sm:text-3xl text-[#FF1801] group-hover:text-[#FAF8F5] my-1 tabular-nums tracking-tight">
                  29,000+
                </p>
                <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90 font-medium">
                  Fragheads We Served
                </p>
              </div>

              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 min-h-[120px] flex flex-col justify-between hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                  AUTHENTIC | UNALTERED
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#FF1801] group-hover:text-[#FAF8F5] my-1 leading-snug">
                  100% Authenticity Guaranteed
                </p>
                <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90 font-medium">
                  Decanted straight from originals
                </p>
              </div>

              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 min-h-[120px] flex flex-col justify-between hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                  REGISTERED
                </p>
                <p className="font-mono text-xs sm:text-sm font-black text-[#FF1801] group-hover:text-[#FAF8F5] my-1">
                  TL NO : 8024484
                </p>
                <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90 font-medium">
                  + Labeling license pending
                </p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-3.5">
              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 min-h-[120px] flex flex-col justify-between hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                  DELIVERY (Dhaka ৳{feeDhaka} / Outside ৳{feeOutside})
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#FF1801] group-hover:text-[#FAF8F5] my-1 leading-snug">
                  Free Over ৳{freeThreshold}
                </p>
                <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90 font-medium">
                  Nationwide | Door to door
                </p>
              </div>

              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 min-h-[120px] flex flex-col justify-between hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                  COD
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#FF1801] group-hover:text-[#FAF8F5] my-1 leading-snug">
                  Cash on Delivery Nationwide
                </p>
                <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90 font-medium">
                  Advance only on orders over BDT 5000
                </p>
              </div>

              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 min-h-[120px] flex flex-col justify-between hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                  LEAK POLICY
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#FF1801] group-hover:text-[#FAF8F5] my-1 leading-snug">
                  Leak Protected During Shipping
                </p>
                <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90 font-medium">
                  Immediate Exchange If Leaks | Breaks
                </p>
              </div>
            </div>

            {/* Column 4 */}
            <div className="space-y-3.5">
              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 min-h-[120px] flex flex-col justify-between hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                  SUPPORT
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#FF1801] group-hover:text-[#FAF8F5] my-1 leading-snug">
                  WhatsApp | Insta DMs | Messenger
                </p>
                <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90 font-medium">
                  18 Hours X 7 Days
                </p>
              </div>

              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 min-h-[120px] flex flex-col justify-between hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                  DECANT SIZES
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#FF1801] group-hover:text-[#FAF8F5] my-1 font-mono">
                  3ml · 5ml · 9ml · 15ml
                </p>
                <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90 font-medium">
                  Flat Margins | Premium Sprayers
                </p>
              </div>

              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 min-h-[120px] flex flex-col justify-between hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                  CURATED FOR BANGLADESH
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#FF1801] group-hover:text-[#FAF8F5] my-1 leading-snug">
                  For Dusty Air & Humidity
                </p>
                <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90 font-medium">
                  Formal | Casual | Signature scents
                </p>
              </div>
            </div>

            {/* Column 5 */}
            <div className="space-y-3.5 sm:col-span-2 lg:col-span-1">
              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 flex flex-col justify-between space-y-3 hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <div>
                  <p className="text-xs font-bold text-[#FF1801] group-hover:text-[#FAF8F5]">
                    Fast Order Updates
                  </p>
                  <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90">
                    Quick Issue Resolution
                  </p>
                </div>

                <div>
                  <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                    PACKAGING
                  </p>
                  <p className="text-xs font-bold text-[#FF1801] group-hover:text-[#FAF8F5]">
                    Transit-safe packing
                  </p>
                  <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90">
                    Complimentary Gift Boxes
                  </p>
                </div>

                <div>
                  <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                    100% MONEYBACK GUARANTEE
                  </p>
                  <p className="text-xs font-bold text-[#FF1801] group-hover:text-[#FAF8F5]">
                    If Proven Unauthentic
                  </p>
                  <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90">
                    Only True Decants
                  </p>
                </div>

                <div>
                  <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                    RESTOCKS | NEW STOCKS
                  </p>
                  <p className="text-xs font-bold text-[#FF1801] group-hover:text-[#FAF8F5]">
                    Every Week
                  </p>
                  <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90">
                    Runs Out Quick
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF8F5] border-2 border-[#FF1801] p-4 space-y-2 hover:bg-[#FF1801] hover:text-[#FAF8F5] transition-colors group cursor-default">
                <div>
                  <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                    QC'D ALWAYS
                  </p>
                  <p className="text-xs font-bold text-[#FF1801] group-hover:text-[#FAF8F5]">
                    Freshly Decanted On Order
                  </p>
                  <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90">
                    Labeled | Glass Bottles
                  </p>
                </div>

                <div className="pt-2 border-t border-[#FF1801]/30">
                  <p className="text-[9px] tracking-[0.16em] uppercase text-[#FF1801] group-hover:text-[#FAF8F5] font-bold">
                    EMI AVAILABLE
                  </p>
                  <p className="text-xs font-bold text-[#FF1801] group-hover:text-[#FAF8F5]">
                    Split In Installments
                  </p>
                  <p className="text-[10px] text-[#FF1801]/80 group-hover:text-[#FAF8F5]/90">
                    Pick SSLCOMMERZ On Checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Replaced Snapshot with SHOP BY BRANDS */}
        <div id="shop-by-brands" className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2">
            <div>
              <span className="text-[11px] sm:text-xs tracking-[0.25em] uppercase font-bold text-[#FF1801]">
                ++ THE ATELIER HOUSES
              </span>
              <h3 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-[#FF1801] mt-1">
                Shop by brands
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#FF1801]/80 uppercase max-w-md">
              Select a fragrance house below to explore their dedicated collection and authentic decants.
            </p>
          </div>

          {/* Thick Solid Red Horizontal Divider */}
          <div className="w-full h-[3.5px] sm:h-[4.5px] md:h-[5px] bg-[#FF1801] mt-2 mb-8" />

          {/* Perfume Brands Image Boxes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {brandsList.map((brand) => (
              <div
                key={brand.slug}
                onClick={() => handleBrandClick(brand.slug)}
                className="group cursor-pointer bg-[#FAF8F5] border-2 border-[#FF1801] p-3 sm:p-4 flex flex-col justify-between hover:bg-[#FF1801] transition-all duration-300 shadow-sm"
              >
                {/* Brand Perfume Image Box */}
                <div className="relative w-full aspect-square bg-[#ECE8E1] border border-[#FF1801]/30 overflow-hidden flex items-center justify-center p-3 mb-3">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-[#FF1801] text-[#FAF8F5] group-hover:bg-[#FAF8F5] group-hover:text-[#FF1801] text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase transition-colors">
                    {brand.count} {brand.count === 1 ? 'Ed.' : 'Eds.'}
                  </div>
                </div>

                {/* Brand Name & Action */}
                <div className="pt-1 text-center">
                  <h4 className="font-sans font-black text-xs sm:text-sm text-[#FF1801] group-hover:text-[#FAF8F5] uppercase tracking-wider truncate transition-colors">
                    {brand.name}
                  </h4>
                  <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#FF1801]/80 group-hover:text-[#FAF8F5] uppercase tracking-widest mt-1.5 transition-colors">
                    <span>EXPLORE</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payments Verification Strip Styled with Red Accent */}
        <div className="mt-12 bg-[#FAF8F5] border-2 border-[#FF1801] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#FF1801] font-bold">
              ++ SECURE TRANSACTIONS
            </p>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF1801]" />
              <h4 className="font-sans text-sm font-black text-[#FF1801] uppercase tracking-wider">
                Verified by SSLCommerz Bangladesh
              </h4>
            </div>
            <p className="text-[11px] text-[#FF1801]/80 font-medium">
              Visa · Mastercard · Amex · UnionPay · bKash · Nagad · Rocket · Upay + more
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
            <span className="px-2.5 py-1 bg-white border border-[#FF1801] font-bold text-[#1a1f71]">VISA</span>
            <span className="px-2.5 py-1 bg-white border border-[#FF1801] font-bold text-[#eb001b]">Mastercard</span>
            <span className="px-2.5 py-1 bg-white border border-[#FF1801] font-bold text-[#006fcf]">AMEX</span>
            <span className="px-2.5 py-1 bg-[#e2136e] text-white font-bold">bKash</span>
            <span className="px-2.5 py-1 bg-[#f7931e] text-white font-bold">Nagad</span>
            <span className="px-2.5 py-1 bg-[#8c3494] text-white font-bold">Rocket</span>
            <span className="px-2.5 py-1 bg-white border border-[#FF1801] font-bold text-[#FF1801]">256-BIT SSL ENCRYPTION</span>
          </div>
        </div>

      </div>
    </section>
  );
};
