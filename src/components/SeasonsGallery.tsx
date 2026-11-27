import React from 'react';
import { ArrowRight } from 'lucide-react';
import { IMAGES } from '../data/fragranceData';
import { SeasonsGalleryData, SeasonCardData } from '../types';

interface SeasonsGalleryProps {
  seasonsData?: SeasonsGalleryData;
  onExploreClick?: () => void;
  onNavigateToCollection?: (slug: string) => void;
  hideHeader?: boolean;
}

const defaultShowcaseBoxes: SeasonCardData[] = [
  {
    id: 'series-night-aero',
    name: 'Night Grid Aero',
    description: 'Floodlit street-circuit liveries & sculpted ground-effect wings',
    image: IMAGES.seasons.autumnDune,
    slug: 'all',
    alt: 'Crimson and obsidian F1 toy car under dramatic pit-lane floodlights',
  },
  {
    id: 'series-heritage-red',
    name: '1990s Red Legends',
    description: 'Classic V10-era scarlet diecast icons on dark stone plinths',
    image: IMAGES.seasons.winterStreet,
    slug: 'all',
    alt: 'Vintage 1990s scarlet Formula 1 diecast race car on dark pedestal',
  },
  {
    id: 'series-carbon-pro',
    name: 'Carbon Pro 1:18',
    description: 'Matte weave chassis with halo cockpit & alloy suspension arms',
    image: IMAGES.seasons.summerRoses,
    slug: 'all',
    alt: 'Stealth matte carbon 1:18 Formula 1 model car front wing and halo detail',
  },
  {
    id: 'series-rc-sprint',
    name: '2.4GHz RC Racers',
    description: 'High-torque radio-controlled F1 toy cars tuned for living-room sprints',
    image: IMAGES.seasons.springForest,
    slug: 'all',
    alt: 'Two high-speed RC Formula 1 toy cars lined up on starting grid',
  },
];

const isLegacyBoxImage = (url?: string) =>
  !url || /season_(dune_red_sun|monochrome_street|sculptural_roses|dark_forest)/i.test(url);

const isLegacyBoxTitle = (title?: string) =>
  !title || /^(Autumn Bloom|Architectural Winter|Midnight Rose|Crimson Shadows)$/i.test(title.trim());

const resolveBoxSlug = (card: SeasonCardData): string => {
  const explicitSlug = (card.slug || '').trim();
  if (explicitSlug) return explicitSlug;
  if (card.id && /^(series|season|box)-\d+$/i.test(card.id)) {
    return 'all';
  }
  const derived = card.id.replace(/^(series|season|box)-/i, '').toLowerCase();
  return derived || 'all';
};

export const SeasonsGallery: React.FC<SeasonsGalleryProps> = ({
  seasonsData,
  onExploreClick,
  onNavigateToCollection,
  hideHeader = false,
}) => {
  const sectionTitle =
    seasonsData?.section_title && !/^seasons?(\s+gallery)?$/i.test(seasonsData.section_title.trim())
      ? seasonsData.section_title
      : 'RACING SERIES';
  const sectionSubtitle =
    seasonsData?.section_subtitle && !/^(choose yours|climate)/i.test(seasonsData.section_subtitle.trim())
      ? seasonsData.section_subtitle
      : 'CHOOSE YOUR GRID';

  const showcaseBoxes: SeasonCardData[] =
    seasonsData?.cards && seasonsData.cards.length > 0
      ? seasonsData.cards.map((card, index) => {
          const fallback = defaultShowcaseBoxes[index % defaultShowcaseBoxes.length];
          const hasLegacyImg = isLegacyBoxImage(card.image);
          const hasCustomName = Boolean(card.name && card.name.trim()) && !isLegacyBoxTitle(card.name);
          return {
            ...card,
            image: hasLegacyImg ? fallback.image : card.image,
            name: hasCustomName ? card.name.trim() : fallback.name,
            description: hasCustomName
              ? (card.description || '').trim()
              : card.description?.trim() || fallback.description,
            slug: (card.slug || '').trim(),
            alt: card.alt || card.name || fallback.alt,
          };
        })
      : defaultShowcaseBoxes;

  const handleBoxClick = (card: SeasonCardData) => {
    const rawTarget = resolveBoxSlug(card);

    if (/^https?:\/\//i.test(rawTarget)) {
      window.location.href = rawTarget;
      return;
    }

    if (rawTarget.startsWith('/')) {
      const colMatch = rawTarget.match(/^\/collections?\/([^/?#]+)/i);
      if (colMatch?.[1] && onNavigateToCollection) {
        onNavigateToCollection(colMatch[1]);
        return;
      }
      if (rawTarget === '/cart' || rawTarget === '/bag' || rawTarget === '/checkout' || rawTarget.startsWith('/product')) {
        window.history.pushState({}, '', rawTarget);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo(0, 0);
        return;
      }
      const cleanPathSlug = rawTarget.replace(/^\/+/, '');
      if (cleanPathSlug && onNavigateToCollection) {
        onNavigateToCollection(cleanPathSlug);
        return;
      }
    }

    if (onNavigateToCollection) {
      onNavigateToCollection(rawTarget);
    } else {
      onExploreClick?.();
    }
  };

  const gridColsClass =
    showcaseBoxes.length === 1
      ? 'sm:grid-cols-1 max-w-sm'
      : showcaseBoxes.length === 2
      ? 'sm:grid-cols-2 lg:grid-cols-2'
      : showcaseBoxes.length === 3
      ? 'sm:grid-cols-2 lg:grid-cols-3'
      : 'sm:grid-cols-2 lg:grid-cols-4';

  const cardsContent = (
    <div
      className={`flex sm:grid ${gridColsClass} gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible no-scrollbar pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0`}
    >
      {showcaseBoxes.map((card, index) => {
        const targetSlug = resolveBoxSlug(card);
        const displayTag = targetSlug
          .replace(/^https?:\/\//i, '')
          .replace(/^\/+/, '')
          .replace(/^collections?\//i, '')
          .replace(/-/g, ' ');

        return (
          <div
            key={card.id || `box-${index}`}
            role="button"
            tabIndex={0}
            onClick={() => handleBoxClick(card)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBoxClick(card);
              }
            }}
            className="flex-shrink-0 w-[250px] sm:w-auto relative group overflow-hidden bg-[#111317] border border-white/10 hover:border-[#E10600] cursor-pointer aspect-[3/4] transition-colors duration-300"
          >
            <img
              src={card.image}
              alt={card.alt || card.name}
              decoding="async"
              className="w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              referrerPolicy="no-referrer"
              loading="lazy"
            />

            {/* Measured dark contrast scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090B]/95 via-[#08090B]/35 to-transparent flex flex-col justify-between p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 text-[10px] font-mono tracking-[0.2em] text-[#C4C9D4]">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span className="uppercase truncate">{displayTag}</span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-white text-xl sm:text-2xl font-bold uppercase tracking-wide leading-none">
                  {card.name}
                </h3>
                {card.description && (
                  <p className="text-xs text-[#C4C9D4] leading-snug line-clamp-2">
                    {card.description}
                  </p>
                )}
                <div className="pt-2 flex items-center gap-2 text-[11px] font-mono font-semibold tracking-[0.16em] text-[#E10600] group-hover:text-white transition-colors uppercase">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>

            {/* Bottom racing-red telemetry line reveal */}
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#E10600] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          </div>
        );
      })}
    </div>
  );

  if (hideHeader) {
    return (
      <div id="showcase" className="w-full">
        {cardsContent}
      </div>
    );
  }

  return (
    <section
      id="showcase"
      className="w-full bg-[#08090B] text-[#F4F2EE] py-14 border-b border-white/10"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <span className="font-mono text-[10px] tracking-[0.22em] text-[#E10600] uppercase block">
              {sectionSubtitle}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-white mt-1">
              {sectionTitle}
            </h2>
          </div>
        </div>

        {cardsContent}
      </div>
    </section>
  );
};
