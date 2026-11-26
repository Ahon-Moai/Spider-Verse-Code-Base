import React from 'react';

export interface MarqueeLinkItem {
  label: string;
  slug: string;
}

interface CategoryMarqueeProps {
  items?: string[];
  links?: MarqueeLinkItem[];
  onNavigateToCollection?: (slug: string) => void;
}

const isLegacyPerfumeItems = (arr?: string[]) =>
  !arr ||
  arr.length === 0 ||
  arr.some((w) => /curate|extract|calibrate|wear|scent|fragrance|decant/i.test(w));

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'all';

export const CategoryMarquee: React.FC<CategoryMarqueeProps> = ({
  items,
  links,
  onNavigateToCollection,
}) => {
  const defaultLinks: MarqueeLinkItem[] = [
    { label: 'ALL PRODUCTS', slug: 'all' },
    { label: '1:18 DIECAST', slug: 'all' },
    { label: '1:43 COLLECTOR', slug: 'all' },
    { label: '2.4GHZ RC', slug: 'all' },
  ];

  const resolvedLinks: MarqueeLinkItem[] =
    Array.isArray(links) && links.filter((l) => l.label?.trim()).length > 0
      ? links
          .filter((l) => l.label?.trim())
          .map((l) => ({
            label: l.label.trim(),
            slug: (l.slug || '').trim() || toSlug(l.label),
          }))
      : !isLegacyPerfumeItems(items)
      ? items!
          .filter((w) => w.trim())
          .map((w) => ({
            label: w.trim(),
            slug: toSlug(w),
          }))
      : defaultLinks;

  const displayLinks =
    resolvedLinks.length < 4
      ? [...resolvedLinks, ...resolvedLinks]
      : resolvedLinks;

  return (
    <div className="w-full bg-[#111317] border-b border-white/10 overflow-hidden py-4 sm:py-5 select-none">
      <div className="relative w-full overflow-hidden flex items-center">
        <div className="animate-marquee-smooth flex items-center gap-10 sm:gap-16 whitespace-nowrap">
          {displayLinks.concat(displayLinks).map((item, idx) => (
            <div key={`${item.slug}-${idx}`} className="flex items-center gap-10 sm:gap-16">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToCollection) {
                    onNavigateToCollection(item.slug || 'all');
                  }
                }}
                className="font-display text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-[0.1em] text-[#F4F2EE] hover:text-[#E10600] uppercase transition-colors cursor-pointer"
              >
                {item.label}
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
