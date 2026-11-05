import React, { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { FragranceProduct } from '../types';

interface NewArrivalsProps {
  products: FragranceProduct[];
  onSelectProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number) => void;
}

const INITIAL_BATCH = 5;
const LOAD_MORE_STEP = 5;

export const NewArrivals: React.FC<NewArrivalsProps> = ({
  products,
  onSelectProduct,
  onAddToCart
}) => {
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH);

  const displayedProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, products.length));
  };

  return (
    <section id="new-arrivals" className="w-full bg-white pt-10 pb-14 sm:pt-14 sm:pb-20 border-b border-zinc-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Matching Hero text design with bold typography and #FF1801 */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <h2 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl tracking-tight text-[#FF1801] uppercase shrink-0 select-none">
              NEW ARRIVALS
            </h2>
            <div className="h-[3px] sm:h-[4px] bg-[#FF1801] flex-1 max-w-[120px] sm:max-w-[200px]" />
          </div>
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#FF1801]/80 uppercase mt-1.5 select-none">
            OUR LATEST BOTTLES
          </p>
        </div>

        {/* Product Grid: Column-wise layout across rows */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {displayedProducts.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col cursor-pointer bg-white transition-all"
              onClick={() => onSelectProduct(product)}
            >
              {/* Product Image Frame */}
              <div className="relative w-full aspect-square bg-[#fafafa] overflow-hidden flex items-center justify-center p-4 border border-zinc-100 group-hover:border-zinc-300 transition-all duration-300">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Subtle Hover Quick Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const defaultSize = product.sizes[0];
                    onAddToCart(product, defaultSize.size, defaultSize.price);
                  }}
                  className="absolute bottom-2 right-2 bg-black/90 hover:bg-[#FF1801] text-white p-2 rounded-none opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                  aria-label={`Quick add 3ml ${product.name}`}
                  title="Quick add 3ml"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Product Info */}
              <div className="pt-3.5 text-center flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] tracking-[0.2em] font-sans text-zinc-400 uppercase">
                  {product.brand}
                </span>
                <h3 className="font-serif text-xs sm:text-sm text-zinc-900 mt-1 font-normal group-hover:text-[#FF1801] transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-500 font-sans mt-0.5 tabular-nums">
                  From <span className="font-medium text-zinc-900">৳ {product.startingPrice}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Products Button */}
        {hasMore && (
          <div className="flex justify-center mt-10 sm:mt-12">
            <button
              onClick={handleShowMore}
              className="inline-flex items-center gap-2 border-2 border-[#FF1801] text-[#FF1801] hover:bg-[#FF1801] hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Show More Products ({products.length - visibleCount} remaining)</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
