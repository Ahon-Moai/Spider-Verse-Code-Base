import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { VideoShowcaseCard, VideoShowcaseSectionData, FragranceProduct } from '../types';

interface VideoSectionProps {
  videoData?: VideoShowcaseSectionData | any;
  products?: FragranceProduct[];
  onSelectProduct?: (product: FragranceProduct) => void;
  onExploreClick?: () => void;
}

const isLegacyVideoCopy = (txt?: string) =>
  !txt || /sillage|decant|perfume|amber|glass atomizer|atelier film/i.test(txt);

export const VideoSection: React.FC<VideoSectionProps> = ({
  videoData,
  products = [],
  onSelectProduct,
  onExploreClick,
}) => {
  const isEnabled = videoData?.is_enabled ?? true;
  if (!isEnabled) return null;

  let rawCards: VideoShowcaseCard[] = videoData?.cards || [];

  if (!rawCards.length && videoData?.video_url) {
    rawCards = [
      {
        id: 'legacy-1',
        title: !isLegacyVideoCopy(videoData.headline)
          ? videoData.headline
          : 'PADDOCK TRACK REEL',
        video_url: videoData.video_url,
        thumbnail_url: videoData.poster_image,
        is_enabled: true,
      },
    ];
  }

  const enabledCards = rawCards
    .filter((c) => c.is_enabled !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  if (enabledCards.length === 0) return null;

  const headline = !isLegacyVideoCopy(videoData?.headline)
    ? videoData.headline
    : 'GARAGE IN MOTION';
  const tagline = !isLegacyVideoCopy(videoData?.tagline)
    ? videoData.tagline
    : 'Precision 1:18 alloy F1 chassis, articulated steering racks, and 2.4GHz RC sprints captured in our pit garage.';
  const badgeText = !isLegacyVideoCopy(videoData?.badge_text)
    ? videoData.badge_text
    : 'PADDOCK FILM REEL';

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const [playingState, setPlayingState] = useState<Record<string, boolean>>({});
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  useEffect(() => {
    const initialPlaying: Record<string, boolean> = {};
    enabledCards.forEach((card) => {
      initialPlaying[card.id] = !prefersReducedMotion;
    });
    setPlayingState(initialPlaying);
  }, [enabledCards.length, prefersReducedMotion]);

  const togglePlayCard = (cardId: string) => {
    const videoEl = videoRefs.current[cardId];
    if (!videoEl) return;

    const isCurrentlyPlaying = playingState[cardId] ?? true;
    if (isCurrentlyPlaying) {
      videoEl.pause();
      setPlayingState((prev) => ({ ...prev, [cardId]: false }));
    } else {
      videoEl
        .play()
        .then(() => {
          setPlayingState((prev) => ({ ...prev, [cardId]: true }));
        })
        .catch(() => {
          setPlayingState((prev) => ({ ...prev, [cardId]: false }));
        });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollContainerRef.current.clientWidth * 0.75,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollContainerRef.current.clientWidth * 0.75,
        behavior: 'smooth',
      });
    }
  };

  const handleCardClick = (card: VideoShowcaseCard) => {
    if (card.product_id && products.length > 0) {
      const matched = products.find((p) => p.id === card.product_id);
      if (matched && onSelectProduct) {
        onSelectProduct(matched);
        return;
      }
    }
    if (onExploreClick) onExploreClick();
  };

  return (
    <section className="w-full bg-[#111317] text-[#F4F2EE] py-14 sm:py-20 border-b border-white/10 relative overflow-hidden select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-5 mb-8 gap-4">
          <div className="space-y-1.5">
            {badgeText && (
              <span className="font-mono text-[11px] tracking-[0.22em] text-[#E10600] uppercase font-semibold block">
                {badgeText}
              </span>
            )}
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white font-extrabold tracking-tight uppercase leading-none">
              {headline}
            </h2>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4">
            {tagline && (
              <p className="max-w-md text-xs sm:text-sm text-[#9CA3AF] leading-relaxed hidden lg:block">
                {tagline}
              </p>
            )}

            {enabledCards.length > 1 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={scrollLeft}
                  aria-label="Previous showcase video"
                  className="w-10 h-10 bg-[#08090B] hover:bg-[#E10600] text-white border border-white/15 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollRight}
                  aria-label="Next showcase video"
                  className="w-10 h-10 bg-[#08090B] hover:bg-[#E10600] text-white border border-white/15 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1"
        >
          {enabledCards.map((card) => {
            const isPlaying = playingState[card.id] ?? true;
            const isFailed = videoErrors[card.id];

            return (
              <div
                key={card.id}
                className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)] group/card relative overflow-hidden bg-[#08090B] border border-white/10 hover:border-[#E10600] transition-colors duration-300"
              >
                <div className="relative aspect-[9/15] w-full bg-[#08090B] overflow-hidden">
                  {!isFailed ? (
                    <video
                      ref={(el) => {
                        videoRefs.current[card.id] = el;
                      }}
                      src={card.video_url}
                      poster={card.thumbnail_url}
                      autoPlay={!prefersReducedMotion}
                      loop
                      muted
                      playsInline
                      onError={() => setVideoErrors((prev) => ({ ...prev, [card.id]: true }))}
                      className="w-full h-full object-cover object-center brightness-[0.9] contrast-[1.05] transition-transform duration-700 group-hover/card:scale-105"
                    />
                  ) : (
                    <img
                      src={
                        card.thumbnail_url ||
                        '/src/assets/images/hero_f1_diecast_studio_1794664768996.jpg'
                      }
                      alt={card.title}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090B]/95 via-transparent to-[#08090B]/25 pointer-events-none" />

                  {!isFailed && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlayCard(card.id);
                      }}
                      aria-label={isPlaying ? `Pause ${card.title} video` : `Play ${card.title} video`}
                      className="absolute top-3.5 right-3.5 z-10 w-10 h-10 bg-[#08090B]/75 hover:bg-[#E10600] text-white border border-white/20 flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  )}

                  {/* Bottom Product Bar */}
                  <div
                    onClick={() => handleCardClick(card)}
                    className="absolute bottom-3 left-3 right-3 z-20 bg-[#111317]/95 backdrop-blur-md text-white p-3 flex items-center justify-between gap-3 border border-white/15 hover:border-[#E10600] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 bg-white overflow-hidden p-1">
                        <img
                          src={
                            card.thumbnail_url ||
                            '/src/assets/images/campaign_f1_pro_118_1794664772367.jpg'
                          }
                          alt={card.title}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[9px] font-mono tracking-[0.2em] text-[#9CA3AF] uppercase truncate">
                          Featured Chassis
                        </p>
                        <h3 className="font-display text-base font-bold uppercase text-white truncate tracking-wide">
                          {card.title}
                        </h3>
                      </div>
                    </div>

                    <ArrowUpRight className="w-4 h-4 text-[#E10600] shrink-0" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
