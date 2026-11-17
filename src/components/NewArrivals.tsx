import React, { useState } from 'react';
import { Plus, ChevronDown, ArrowRight } from 'lucide-react';
import { FragranceProduct, DecantSize } from '../types';

interface NewArrivalsProps {
  products: FragranceProduct[];
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

const formatDivisionLabel = (gender?: string) => {
  if (!gender) return '';
  if (gender === 'Him') return '1:18 Pro';
  if (gender === 'Her') return '1:43 Display';
  return gender;
};

const NewArrivalProductCard: React.FC<{
  product: FragranceProduct;
  onSelectProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number) => void;
}> = ({ product, onSelectProduct, onAddToCart }) => {
  const defaultSize = product.sizes?.[0] || { size: '1:43 Display', price: product.startingPrice };
  const [selectedSize, setSelectedSize] = useState<DecantSize>(defaultSize);

  return (
    <div
      className="group flex flex-col justify-between cursor-pointer bg-white border border-zinc-200/90 hover:border-[#08090B] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(8,9,11,0.12)] h-full"
      onClick={() => onSelectProduct(product)}
    >
      <div>
        {/* Uniform Square Studio Image Stage */}
        <div className="relative w-full aspect-square bg-[#FAF9F6] overflow-hidden flex items-center justify-center p-5 border-b border-zinc-200/70">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            referrerPolicy="no-referrer"
            loading="lazy"
          />

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, selectedSize.size, selectedSize.price);
            }}
            className="absolute bottom-2.5 right-2.5 bg-[#08090B] hover:bg-[#E10600] text-white p-2.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md cursor-pointer"
            aria-label={`Quick add ${selectedSize.size} ${product.name}`}
            title={`Quick add ${selectedSize.size}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Subtle Red Corner Indicator on Hover */}
          <div className="absolute top-0 left-0 w-0 group-hover:w-full h-[2px] bg-[#E10600] transition-all duration-300" />
        </div>

        {/* Clean Unboxed Metadata & Title */}
        <div className="p-4 pb-2 space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-[10px] font-mono tracking-[0.14em] text-zinc-500 uppercase">
            <span className="truncate">{product.brand}</span>
            {product.gender && (
              <span className="shrink-0 text-zinc-400">
                {formatDivisionLabel(product.gender)}
              </span>
            )}
          </div>

          <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-[#08090B] group-hover:text-[#E10600] transition-colors line-clamp-1 leading-tight">
            {product.name}
          </h3>

          <div className="flex items-baseline justify-between pt-0.5 tabular-nums">
            <span className="font-mono text-sm font-bold text-[#08090B]">
              ৳ {selectedSize.price.toLocaleString()}
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              {selectedSize.size}
            </span>
          </div>
        </div>
      </div>

      {/* Scale / Edition Selector */}
      <div className="p-4 pt-2" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <select
            value={selectedSize.size}
            onChange={(e) => {
              const matched = product.sizes.find((s) => s.size === e.target.value);
              if (matched) setSelectedSize(matched);
            }}
            aria-label={`Select scale for ${product.name}`}
            className="w-full appearance-none bg-[#F4F2EE] hover:bg-zinc-200/70 border border-zinc-300/80 text-[#08090B] text-[11px] font-mono py-2 pl-2.5 pr-7 focus:outline-none focus:border-[#08090B] cursor-pointer transition-colors"
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
    </div>
  );
};

const INITIAL_ROW_COUNT = 5;
const EXPANDED_ROW_COUNT = 15;

export const NewArrivals: React.FC<NewArrivalsProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onNavigateToCollection,
}) => {
  const [hasExpandedOnce, setHasExpandedOnce] = useState(false);

  const visibleLimit = hasExpandedOnce ? EXPANDED_ROW_COUNT : INITIAL_ROW_COUNT;
  const displayedProducts = products.slice(0, visibleLimit);
  const canShowMore = !hasExpandedOnce && products.length > INITIAL_ROW_COUNT;

  const handleSeeAll = () => {
    if (onNavigateToCollection) {
      onNavigateToCollection('all');
    } else {
      window.location.href = '/collections/all';
    }
  };

  return (
    <section
      id="new-arrivals"
      className="w-full bg-[#F4F2EE] text-[#08090B] py-14 sm:py-20 border-b border-zinc-300/70 apex-grid-light"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#08090B] pb-4 mb-8 sm:mb-10 gap-3">
          <div>
            <span className="font-mono text-[11px] tracking-[0.22em] text-[#E10600] uppercase font-semibold block">
              Latest Grid Drops
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#08090B] uppercase leading-none mt-1">
              New Arrivals
            </h2>
          </div>

          <button
            type="button"
            onClick={handleSeeAll}
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-[0.16em] uppercase text-[#08090B] hover:text-[#E10600] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View Full Grid</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Grid */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {displayedProducts.map((product) => (
              <NewArrivalProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 p-10 text-center space-y-2">
            <p className="font-display text-2xl font-bold uppercase text-[#08090B]">
              Paddock Grid Synchronizing
            </p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Live Formula 1 toy cars and diecast scale models load directly from the store API. Explore divisions or refresh to check current inventory.
            </p>
          </div>
        )}

        {/* Pagination Action Bar */}
        {displayedProducts.length > 0 && (
          <div className="flex justify-center mt-10 sm:mt-12">
            {canShowMore ? (
              <button
                type="button"
                onClick={() => setHasExpandedOnce(true)}
                className="btn-f1 border-2 border-[#08090B] text-[#08090B] hover:bg-[#E10600] hover:border-[#E10600] hover:text-white px-8 py-3 font-display text-base font-bold tracking-[0.08em] uppercase transition-colors duration-200 cursor-pointer"
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
                className="btn-f1 bg-[#E10600] hover:bg-[#ff1e18] text-white px-8 py-3 font-display text-base font-bold tracking-[0.08em] uppercase transition-colors duration-200 cursor-pointer"
              >
                <span className="btn-f1-inner">
                  <span>See All F1 Models</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
