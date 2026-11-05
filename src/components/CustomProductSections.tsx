import React, { useState } from 'react';
import { FragranceProduct } from '../types';
import { ShoppingBag, Eye, ChevronDown } from 'lucide-react';

interface CustomProductSectionsProps {
  homepageData?: any;
  allProducts: FragranceProduct[];
  onSelectProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number) => void;
}

const INITIAL_SECTION_BATCH = 4;
const SECTION_LOAD_MORE_STEP = 4;

export const CustomProductSections: React.FC<CustomProductSectionsProps> = ({
  homepageData,
  allProducts,
  onSelectProduct,
  onAddToCart
}) => {
  // Track visible count per section key
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

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
        title: sec.title || 'Curated Collection',
        subtitle: sec.subtitle || 'Exquisite Olfactory Portions',
        products: sectionProducts
      };
    })
    .filter(Boolean);

  if (activeSections.length === 0) return null;

  const handleShowMore = (secKey: string, totalCount: number) => {
    setVisibleCounts((prev) => {
      const current = prev[secKey] || INITIAL_SECTION_BATCH;
      return {
        ...prev,
        [secKey]: Math.min(current + SECTION_LOAD_MORE_STEP, totalCount)
      };
    });
  };

  return (
    <div className="w-full bg-white space-y-16 py-12 border-b border-zinc-100">
      {activeSections.map((sec, idx) => {
        if (!sec) return null;

        const currentVisible = visibleCounts[sec.key] || INITIAL_SECTION_BATCH;
        const displayedProducts = sec.products.slice(0, currentVisible);
        const hasMore = currentVisible < sec.products.length;

        return (
          <section key={sec.key} className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header: Matching Hero text design with bold typography and #FF1801 */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <h2 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl tracking-tight text-[#FF1801] uppercase shrink-0 select-none">
                  {sec.title}
                </h2>
                <div className="h-[3px] sm:h-[4px] bg-[#FF1801] flex-1 max-w-[120px] sm:max-w-[200px]" />
              </div>
              {sec.subtitle && (
                <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#FF1801]/80 uppercase mt-1.5 select-none">
                  {sec.subtitle}
                </p>
              )}
            </div>

            {/* Product Grid: Responsive multi-column layout across rows */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map((product) => {
                const primarySize = product.sizes?.[0] || { size: '5ml', price: product.startingPrice };

                return (
                  <div
                    key={product.id}
                    className="group bg-[#fcfcfc] border border-zinc-200/80 p-4 sm:p-5 flex flex-col justify-between hover:border-[#FF1801] transition-all duration-300 shadow-xs hover:shadow-xl relative"
                  >
                    {/* Image Area */}
                    <div
                      onClick={() => onSelectProduct(product)}
                      className="aspect-square w-full flex items-center justify-center p-4 cursor-pointer overflow-hidden relative bg-white border border-zinc-100"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />

                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-zinc-950 text-white text-[10px] font-sans tracking-widest uppercase px-3 py-2 flex items-center gap-1.5 shadow-lg">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Quick View</span>
                        </span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="mt-4 space-y-1.5 text-left">
                      <div className="flex items-center justify-between text-[10px] font-sans text-zinc-400 uppercase tracking-widest">
                        <span>{product.brand}</span>
                        <span>{product.concentration || 'Eau de Parfum'}</span>
                      </div>

                      <h3
                        onClick={() => onSelectProduct(product)}
                        className="font-serif text-sm sm:text-base text-zinc-950 font-normal hover:text-[#FF1801] transition-colors cursor-pointer truncate"
                      >
                        {product.name}
                      </h3>

                      <p className="text-xs font-serif font-medium text-zinc-900 tabular-nums">
                        ৳ {primarySize.price} <span className="text-[10px] font-sans font-normal text-zinc-500">({primarySize.size})</span>
                      </p>

                      {product.notes && product.notes.length > 0 && (
                        <p className="text-[11px] text-zinc-500 font-sans line-clamp-1">
                          {product.notes.join(' · ')}
                        </p>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t border-zinc-150 flex items-center gap-2">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 py-2 text-[11px] font-sans tracking-wider uppercase transition-colors text-center cursor-pointer"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => onAddToCart(product, primarySize.size, primarySize.price)}
                        className="bg-zinc-950 hover:bg-[#FF1801] text-white p-2 transition-all cursor-pointer"
                        title="Add to Bag"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show More Products Button for this section */}
            {hasMore && (
              <div className="flex justify-center mt-8 sm:mt-10">
                <button
                  onClick={() => handleShowMore(sec.key, sec.products.length)}
                  className="inline-flex items-center gap-2 border-2 border-[#FF1801] text-[#FF1801] hover:bg-[#FF1801] hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
                >
                  <span>Show More ({sec.products.length - currentVisible} remaining)</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
