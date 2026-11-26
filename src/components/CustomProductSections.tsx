import React, { useState } from 'react';
import { FragranceProduct, DecantSize } from '../types';
import { ShoppingBag, Eye, ChevronDown, ArrowRight } from 'lucide-react';

interface CustomProductSectionsProps {
  homepageData?: any;
  allProducts: FragranceProduct[];
  onSelectProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number) => void;
  onNavigateToCollection?: (slug: string) => void;
}

const getScaleSpecLabel = (sizeStr: string): string => {
  const s = sizeStr.toLowerCase();
  if (s.includes('1:18')) return '~31cm Alloy';
  if (s.includes('1:24')) return '~23cm Alloy';
  if (s.includes('1:43')) return '~13cm Display';
  if (s.includes('1:64')) return '~8cm Pocket';
  if (s.includes('rc')) return '2.4GHz Radio';
  return 'Collector Spec';
};

const CustomProductCard: React.FC<{
  product: FragranceProduct;
  onSelectProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number) => void;
}> = ({ product, onSelectProduct, onAddToCart }) => {
  const defaultSize = product.sizes?.[0] || { size: '1:43 Display', price: product.startingPrice };
  const [selectedSize, setSelectedSize] = useState<DecantSize>(defaultSize);

  return (
    <div className="group bg-white border border-zinc-200/90 hover:border-[#212428] flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(8,9,11,0.12)] relative h-full">
      <div>
        {/* Image Stage */}
        <div
          onClick={() => onSelectProduct(product)}
          className="aspect-square w-full flex items-center justify-center cursor-pointer overflow-hidden relative bg-[#FAF9F6] border-b border-zinc-200/60"
        >
          <img
            src={product.image}
            alt={product.name}
            decoding="async"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-[#212428]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-[#212428] text-white text-[10px] font-mono tracking-[0.18em] uppercase px-3.5 py-2 flex items-center gap-1.5 shadow-lg">
              <Eye className="w-3.5 h-3.5 text-[#E10600]" />
              <span>Inspect</span>
            </span>
          </div>
        </div>

        {/* Clean Unboxed Details */}
        <div className="p-4 pb-2 space-y-1.5 text-left">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-[0.14em]">
            <span className="truncate">{product.brand}</span>
            <span className="truncate text-zinc-400 ml-2">
              {product.concentration || 'Diecast Alloy'}
            </span>
          </div>

          <h3
            onClick={() => onSelectProduct(product)}
            className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-[#212428] hover:text-[#E10600] transition-colors cursor-pointer truncate"
          >
            {product.name}
          </h3>

          <div className="flex items-baseline justify-between tabular-nums">
            <span className="font-mono text-sm font-bold text-[#212428]">
              ৳ {selectedSize.price.toLocaleString()}
            </span>
            <span className="font-mono text-[11px] text-zinc-500">{selectedSize.size}</span>
          </div>

          {/* Scale / Edition Selector */}
          <div className="pt-1.5" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <select
                value={selectedSize.size}
                onChange={(e) => {
                  const matched = product.sizes.find((s) => s.size === e.target.value);
                  if (matched) setSelectedSize(matched);
                }}
                aria-label={`Select scale for ${product.name}`}
                className="w-full appearance-none bg-[#F4F2EE] hover:bg-zinc-200/70 border border-zinc-300/80 text-[#212428] text-[11px] font-mono py-2 pl-2.5 pr-7 focus:outline-none focus:border-[#212428] cursor-pointer transition-colors"
              >
                {product.sizes.map((sz, idx) => (
                  <option key={sz.size || idx} value={sz.size}>
                    {sz.size} ({getScaleSpecLabel(sz.size)}) — ৳{sz.price}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {product.notes && product.notes.length > 0 && (
            <p className="text-[11px] text-zinc-500 line-clamp-1 pt-1">
              {product.notes.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-4 pt-3 mt-2 border-t border-zinc-200/80 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="btn-f1 flex-1 bg-[#F4F2EE] hover:bg-zinc-200 text-[#212428] py-2.5 font-display text-sm font-bold tracking-[0.08em] uppercase transition-colors text-center cursor-pointer"
        >
          <span className="btn-f1-inner">Details</span>
        </button>

        <button
          type="button"
          onClick={() => onAddToCart(product, selectedSize.size, selectedSize.price)}
          className="btn-f1 bg-[#E10600] hover:bg-[#ff1e18] text-white px-4 py-2.5 transition-colors cursor-pointer"
          title={`Add ${selectedSize.size} to Bag`}
          aria-label={`Add ${selectedSize.size} ${product.name} to bag`}
        >
          <span className="btn-f1-inner">
            <ShoppingBag className="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>
  );
};

const INITIAL_ROW_COUNT = 4;
const EXPANDED_ROW_COUNT = 12;

export const CustomProductSections: React.FC<CustomProductSectionsProps> = ({
  homepageData,
  allProducts,
  onSelectProduct,
  onAddToCart,
  onNavigateToCollection,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const sectionKeys = ['custom_section_1', 'custom_section_2', 'custom_section_3', 'custom_section_4'];

  const activeSections = sectionKeys
    .map((key) => {
      const sec = homepageData?.sections?.[key];
      if (!sec) return null;

      const isEnabled = sec.content?.is_enabled ?? true;
      if (!isEnabled) return null;

      const productIds: string[] = sec.content?.product_ids || [];
      const sectionProducts = allProducts.filter((p) => productIds.includes(p.id));
      if (sectionProducts.length === 0) return null;

      return {
        key,
        title: sec.title || 'Featured Grid',
        subtitle: sec.subtitle || 'Precision Scale Allocations',
        products: sectionProducts,
      };
    })
    .filter(Boolean);

  if (activeSections.length === 0) return null;

  const handleSeeAll = () => {
    if (onNavigateToCollection) {
      onNavigateToCollection('all');
    } else {
      window.location.href = '/collections/all';
    }
  };

  return (
    <div className="perf-section w-full bg-[#F4F2EE] text-[#212428] space-y-16 py-14 sm:py-20 border-b border-zinc-300/70">
      {activeSections.map((sec) => {
        if (!sec) return null;

        const isExpanded = !!expandedSections[sec.key];
        const visibleLimit = isExpanded ? EXPANDED_ROW_COUNT : INITIAL_ROW_COUNT;
        const displayedProducts = sec.products.slice(0, visibleLimit);
        const canShowMore = !isExpanded && sec.products.length > INITIAL_ROW_COUNT;

        return (
          <section key={sec.key} className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#212428] pb-4 mb-8 gap-2">
              <div>
                {sec.subtitle && (
                  <span className="font-mono text-[11px] tracking-[0.22em] text-[#E10600] uppercase font-semibold block">
                    {sec.subtitle}
                  </span>
                )}
                <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-[#212428] uppercase leading-none mt-1">
                  {sec.title}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map((product) => (
                <CustomProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>

            <div className="flex justify-center mt-10">
              {canShowMore ? (
                <button
                  type="button"
                  onClick={() => setExpandedSections((prev) => ({ ...prev, [sec.key]: true }))}
                  className="btn-f1 border-2 border-[#212428] text-[#212428] hover:bg-[#E10600] hover:border-[#E10600] hover:text-white px-8 py-3 font-display text-base font-bold tracking-[0.08em] uppercase transition-colors cursor-pointer"
                >
                  <span className="btn-f1-inner">
                    <span>Show More Models</span>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSeeAll}
                  className="btn-f1 bg-[#E10600] hover:bg-[#ff1e18] text-white px-8 py-3 font-display text-base font-bold tracking-[0.08em] uppercase transition-colors cursor-pointer"
                >
                  <span className="btn-f1-inner">
                    <span>See All F1 Models</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};
