import React from 'react';

interface CategoryMarqueeProps {
  items?: string[];
  onNavigateToCollection?: (slug: string) => void;
}

const isLegacyPerfumeItems = (arr?: string[]) =>
  !arr ||
  arr.length === 0 ||
  arr.some((w) => /curate|extract|calibrate|wear|scent|fragrance|decant/i.test(w));

export const CategoryMarquee: React.FC<CategoryMarqueeProps> = ({
  items,
  onNavigateToCollection,
}) => {
  const defaultItems = [
    '1:18 DIECAST',
    '1:43 COLLECTOR',
    '2.4GHZ RC',
    'AERO WINGS',
    '1:18 DIECAST',
    '1:43 COLLECTOR',
    '2.4GHZ RC',
    'AERO WINGS',
  ];

  const marqueeItems = isLegacyPerfumeItems(items) ? defaultItems : items!;

  return (
    <div className="w-full bg-[#111317] border-b border-white/10 overflow-hidden py-4 sm:py-5 select-none">
      <div className="relative w-full overflow-hidden flex items-center">
        <div className="animate-marquee-smooth flex items-center gap-10 sm:gap-16 whitespace-nowrap">
          {marqueeItems.concat(marqueeItems).map((word, idx) => (
            <div key={idx} className="flex items-center gap-10 sm:gap-16">
              <button
                type="button"
                onClick={() => {
                  const slug = word
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');
                  if (onNavigateToCollection) onNavigateToCollection(slug || 'all');
                }}
                className="font-display text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-[0.1em] text-[#F4F2EE] hover:text-[#E10600] uppercase transition-colors cursor-pointer"
              >
                {word}
              </button>
              <span
                aria-hidden="true"
                className="text-[#E10600] text-2xl sm:text-3xl font-display font-black"
              >
                /
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
