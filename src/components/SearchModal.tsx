import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { FragranceProduct } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: FragranceProduct[];
  onSelectProduct: (product: FragranceProduct) => void;
}

const POPULAR_SEARCH_TAGS = [
  '1:18 Scale',
  'Ferrari',
  'Red Bull',
  'Mercedes',
  '1:43 Display',
  'RC Car',
  'Classic',
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered =
    query.trim() === ''
      ? []
      : products.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.brand.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            p.notes?.some((n) => n.toLowerCase().includes(query.toLowerCase()))
        );

  const featuredShowcase = products.slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-16 p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#111317] text-[#F4F2EE] shadow-2xl border border-white/15 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#08090B] space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E10600]">
              Garage Search
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 border border-white/15 text-[#9CA3AF] hover:text-white hover:border-[#E10600] transition-colors cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-[#9CA3AF] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search F1 team, driver, scale or car (e.g. 1:18, Ferrari, Red Bull, RC)..."
              className="w-full bg-[#111317] border border-white/15 pl-10 pr-16 py-3 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#E10600] transition-colors"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 text-[11px] font-mono text-[#9CA3AF] hover:text-white uppercase tracking-wider px-2 py-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Interactive Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className={`text-[11px] font-mono px-2.5 py-1 border whitespace-nowrap transition-colors cursor-pointer ${
                  query === tag
                    ? 'bg-[#E10600] text-white border-[#E10600]'
                    : 'bg-[#171A20] text-[#C4C9D4] border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 no-scrollbar">
          {query.trim() === '' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="uppercase tracking-[0.16em] text-[#9CA3AF]">
                  Featured Chassis
                </span>
                <span className="text-[#C4C9D4] tabular-nums">
                  {products.length} Available
                </span>
              </div>

              {featuredShowcase.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {featuredShowcase.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectProduct(item);
                        onClose();
                      }}
                      className="flex items-center gap-3 p-3 bg-[#08090B] hover:border-[#E10600] border border-white/10 transition-colors cursor-pointer group"
                    >
                      <div className="w-14 h-14 bg-white p-1.5 flex items-center justify-center shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono tracking-[0.14em] text-[#9CA3AF] uppercase block truncate">
                          {item.brand}
                        </span>
                        <h5 className="font-display text-base font-bold uppercase text-white truncate group-hover:text-[#E10600] transition-colors">
                          {item.name}
                        </h5>
                        <p className="text-xs font-mono text-[#C4C9D4] mt-0.5 tabular-nums">
                          ৳ {item.startingPrice}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#9CA3AF] py-6 text-center">
                  Type a team name, car chassis, driver, or scale size above to search live inventory.
                </p>
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="font-display text-2xl font-bold uppercase text-white">
                No Models Found For "{query}"
              </p>
              <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto">
                Try another constructor, driver number, or scale ratio (1:18, 1:43, RC).
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-2 text-xs font-mono font-semibold text-[#E10600] hover:underline uppercase cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#9CA3AF]">
                <span>Matching F1 Models</span>
                <span className="tabular-nums">{filtered.length} found</span>
              </div>

              <div className="space-y-2">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectProduct(item);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 bg-[#08090B] border border-white/10 hover:border-[#E10600] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 bg-white p-1 flex items-center justify-center shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono tracking-[0.14em] text-[#9CA3AF] uppercase block">
                          {item.brand}
                        </span>
                        <h4 className="font-display text-base font-bold uppercase text-white truncate group-hover:text-[#E10600] transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-[11px] font-mono text-[#9CA3AF] mt-0.5 tabular-nums">
                          {item.category} · <span className="text-white font-semibold">৳ {item.startingPrice}</span>
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#E10600] shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
