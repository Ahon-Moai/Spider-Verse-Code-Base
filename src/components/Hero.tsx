import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FragranceProduct, SeasonsGalleryData } from '../types';
import { SeasonsGallery } from './SeasonsGallery';

export interface HeroSlideConfig {
  eyebrow: string;
  headline: string;
  cta_text?: string;
  product_id?: string;
  image: string;
  video_url?: string;
  media_type?: 'image' | 'video';
  alt?: string;
}

const DEFAULT_HERO_SLIDES: HeroSlideConfig[] = [
  {
    image: '/src/assets/images/hero_f1_diecast_studio_1794664768996.jpg',
    video_url: '',
    media_type: 'image',
    eyebrow: "GRID '26",
    headline: 'COLLECTION IS LIVE',
    cta_text: 'Explore Model',
    product_id: '',
    alt: 'Spider Verse 1:18 Formula 1 diecast race car model in dark studio lighting',
  },
  {
    image: '/src/assets/images/campaign_f1_pro_118_1794664772367.jpg',
    video_url: '',
    media_type: 'image',
    eyebrow: '1:18 PRO DIECAST',
    headline: 'BUILT FOR THE GRID',
    cta_text: 'Explore Model',
    product_id: '',
    alt: 'Precision 1:18 alloy Formula 1 model car with exposed front wing assembly',
  },
  {
    image: '/src/assets/images/campaign_f1_display_143_1794664770809.jpg',
    video_url: '',
    media_type: 'image',
    eyebrow: '1:43 & 2.4GHZ RC',
    headline: 'RACE OR DISPLAY',
    cta_text: 'Explore Model',
    product_id: '',
    alt: 'Two 1:43 scale diecast Formula 1 collector cars in acrylic display cases',
  },
];

interface HeroProps {
  products?: FragranceProduct[];
  onSelectProduct?: (product: FragranceProduct) => void;
  onExploreClick?: () => void;
  onOrderProduct?: () => void;
  onNavigateToCollection?: (slug: string) => void;
  heroData?: any;
  seasonsData?: SeasonsGalleryData;
}

const isLegacyPerfumeCopy = (text?: string) =>
  !text || /fragrance|decant|flacon|sillage|perfume|portion|olfactory|aromatica/i.test(text);

export const Hero: React.FC<HeroProps> = ({
  products = [],
  onSelectProduct,
  onExploreClick,
  onNavigateToCollection,
  heroData,
  seasonsData,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const activeSlideRef = useRef(0);
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const touchStateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startIndex: 0,
  });

  const cmsSlides: HeroSlideConfig[] | null =
    Array.isArray(heroData?.slides) && heroData.slides.length > 0 ? heroData.slides : null;

  const rawHeroImg = heroData?.image;
  const customHeroImage =
    rawHeroImg && !/perfume|pure_portions|arrina/i.test(rawHeroImg) ? rawHeroImg : null;

  const slides: HeroSlideConfig[] = cmsSlides
    ? DEFAULT_HERO_SLIDES.map((fallback, idx) => {
        const s = cmsSlides[idx];
        if (!s) return fallback;
        return {
          eyebrow: s.eyebrow?.trim() || fallback.eyebrow,
          headline: s.headline?.trim() || fallback.headline,
          cta_text:
            s.cta_text?.trim() && !isLegacyPerfumeCopy(s.cta_text)
              ? s.cta_text.trim()
              : fallback.cta_text,
          product_id: s.product_id?.trim() || '',
          image: s.image?.trim() || fallback.image,
          video_url: s.video_url?.trim() || '',
          media_type: s.media_type === 'video' ? 'video' : 'image',
          alt: s.alt || s.headline || fallback.alt,
        };
      })
    : DEFAULT_HERO_SLIDES.map((s, idx) =>
        idx === 0
          ? {
              ...s,
              image: customHeroImage || s.image,
              headline: !isLegacyPerfumeCopy(heroData?.headline) ? heroData.headline : s.headline,
            }
          : s
      );

  const shopAllText = !isLegacyPerfumeCopy(heroData?.secondary_cta_text)
    ? heroData.secondary_cta_text
    : 'Shop All';

  const handleSlideCtaClick = (slide: HeroSlideConfig) => {
    if (dragStateRef.current.moved) return;
    if (slide.product_id && onSelectProduct) {
      const matched = products.find(
        (p) => p.id === slide.product_id || p.slug === slide.product_id
      );
      if (matched) {
        onSelectProduct(matched);
        return;
      }
      onSelectProduct({ id: slide.product_id, slug: slide.product_id } as FragranceProduct);
      return;
    }
    onExploreClick?.();
  };

  const scrollToSlide = useCallback(
    (idx: number, smooth = true) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = ((idx % slides.length) + slides.length) % slides.length;
      const slideWidth = track.clientWidth;
      if (slideWidth <= 0) return;

      track.scrollTo({
        left: clamped * slideWidth,
        behavior: smooth ? 'smooth' : 'auto',
      });
      if (activeSlideRef.current !== clamped) {
        activeSlideRef.current = clamped;
        setActiveSlide(clamped);
      }
    },
    [slides.length]
  );

  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth <= 0) return;
    const nextIndex = Math.min(
      slides.length - 1,
      Math.max(0, Math.round(track.scrollLeft / track.clientWidth))
    );
    if (nextIndex !== activeSlideRef.current) {
      activeSlideRef.current = nextIndex;
      setActiveSlide(nextIndex);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsTouching(true);
    touchStateRef.current = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      startIndex: activeSlideRef.current,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsTouching(false);
    if (!touchStateRef.current.active || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStateRef.current.startX;
    const deltaY = touch.clientY - touchStateRef.current.startY;
    const startIdx = touchStateRef.current.startIndex;
    touchStateRef.current.active = false;

    const track = trackRef.current;
    if (!track || track.clientWidth <= 0) return;

    const isHorizontalSwipe =
      Math.abs(deltaX) > 36 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15;

    if (isHorizontalSwipe) {
      const currentIdx = Math.round(track.scrollLeft / track.clientWidth);
      if (currentIdx === startIdx) {
        const targetIdx = Math.min(
          slides.length - 1,
          Math.max(0, deltaX < 0 ? startIdx + 1 : startIdx - 1)
        );
        scrollToSlide(targetIdx, true);
      }
    }
  };

  // Mouse click-and-drag horizontal scrolling (touch uses native scroll-snap swiping)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a')) return;

    const track = trackRef.current;
    if (!track) return;

    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: track.scrollLeft,
      moved: false,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const track = trackRef.current;
      if (!track || !dragStateRef.current.active) return;
      const deltaX = e.clientX - dragStateRef.current.startX;
      if (Math.abs(deltaX) > 6) {
        dragStateRef.current.moved = true;
      }
      track.scrollLeft = dragStateRef.current.startScrollLeft - deltaX;
    };

    const handleMouseUp = (e: MouseEvent) => {
      const track = trackRef.current;
      if (!dragStateRef.current.active) {
        setIsDragging(false);
        return;
      }

      const deltaX = e.clientX - dragStateRef.current.startX;
      const currentScrollLeft = track ? track.scrollLeft : 0;
      const width = track ? track.clientWidth : 1;
      const baseIndex = Math.round(dragStateRef.current.startScrollLeft / Math.max(1, width));

      dragStateRef.current.active = false;
      setIsDragging(false);

      // Snap cleanly to next/prev slide if dragged meaningfully, otherwise nearest slide
      let targetIdx = Math.round(currentScrollLeft / Math.max(1, width));
      if (Math.abs(deltaX) > Math.min(80, width * 0.14)) {
        targetIdx = deltaX < 0 ? baseIndex + 1 : baseIndex - 1;
      }
      targetIdx = Math.min(slides.length - 1, Math.max(0, targetIdx));

      requestAnimationFrame(() => {
        scrollToSlide(targetIdx, true);
        setTimeout(() => {
          dragStateRef.current.moved = false;
        }, 50);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, slides.length, scrollToSlide]);

  // Keep current slide aligned on viewport resize
  useEffect(() => {
    const handleResize = () => {
      scrollToSlide(activeSlideRef.current, false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scrollToSlide]);

  // Gentle auto-advance when idle (resets whenever activeSlide changes or user interacts)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isDragging || isTouching || isHovering || slides.length <= 1) return;

    const timer = setTimeout(() => {
      scrollToSlide((activeSlide + 1) % slides.length, true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeSlide, isDragging, isTouching, isHovering, slides.length, scrollToSlide]);

  return (
    <section className="relative w-full bg-[#08090B] text-[#F4F2EE] overflow-hidden border-b border-white/10">
      {/* Full-bleed Horizontally Scrollable / Swipeable Hero Stage (Locked 2px Red Divider at Bottom Edge) */}
      <div
        className="group/hero relative h-[76svh] sm:h-[80svh] lg:h-[84svh] min-h-[460px] max-h-[820px] overflow-hidden border-b-2 border-[#E10600]"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Horizontal Scroll-Snap Photo Track */}
        <div
          ref={trackRef}
          onScroll={handleTrackScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => setIsTouching(false)}
          onMouseDown={handleMouseDown}
          aria-roledescription="carousel"
          aria-label="Featured hero showcase"
          style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }}
          className={`flex w-full h-full overflow-x-auto overflow-y-hidden no-scrollbar overscroll-x-contain select-none ${
            isDragging
              ? 'cursor-grabbing'
              : 'snap-x snap-mandatory cursor-grab'
          }`}
        >
          {slides.map((slide, idx) => {
            const showVideo =
              (slide.media_type === 'video' || (!slide.media_type && Boolean(slide.video_url))) &&
              Boolean(slide.video_url);
            const HeadingTag = idx === 0 ? 'h1' : 'h2';

            return (
              <div
                key={`hero-slide-${idx}`}
                className="relative w-full h-full shrink-0 snap-start snap-always flex flex-col justify-end overflow-hidden"
              >
                {/* Slide Media */}
                <div className="absolute inset-0 pointer-events-none">
                  {showVideo ? (
                    <video
                      src={slide.video_url}
                      poster={slide.image || undefined}
                      autoPlay={idx === activeSlide}
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <img
                      src={slide.image}
                      alt={slide.alt || slide.headline}
                      decoding="async"
                      draggable={false}
                      fetchPriority={idx === 0 ? 'high' : 'auto'}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090B]/80 via-[#08090B]/20 to-transparent" />
                </div>

                {/* Bottom-Left Editorial Copy + Slanted Racing Buttons */}
                <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-12 pb-16 sm:pb-16 pt-24">
                  <div className="max-w-3xl space-y-4 sm:space-y-5">
                    <div className="space-y-1.5">
                      <p className="font-sans text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase text-[#F4F2EE] drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                        {slide.eyebrow}
                      </p>

                      <HeadingTag
                        className="font-display font-black uppercase tracking-[0.01em] leading-[0.94] text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.7)]"
                        style={{
                          fontSize: 'clamp(2.5rem, 5.2vw, 4.75rem)',
                          textWrap: 'balance',
                        }}
                      >
                        {slide.headline}
                      </HeadingTag>
                    </div>

                    {/* Slanted Motorsport CTAs: Per-Slide Product CTA + Shop All */}
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSlideCtaClick(slide)}
                        className="btn-f1 bg-[#E10600] hover:bg-[#ff1e18] text-white px-8 py-3 font-display text-base sm:text-lg font-bold tracking-[0.08em] uppercase transition-colors duration-200 cursor-pointer shadow-[0_12px_30px_rgba(225,6,0,0.3)]"
                      >
                        <span className="btn-f1-inner">{slide.cta_text || 'Explore Model'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!dragStateRef.current.moved) {
                            onNavigateToCollection?.('all');
                          }
                        }}
                        className="btn-f1 border border-white/70 bg-[#08090B]/80 hover:bg-white hover:text-[#08090B] text-white px-8 py-3 font-display text-base sm:text-lg font-bold tracking-[0.08em] uppercase transition-colors duration-200 cursor-pointer"
                      >
                        <span className="btn-f1-inner">{shopAllText}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Previous / Next Slide Controls */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlide - 1, true)}
              aria-label="Previous hero slide"
              className="hidden md:flex items-center justify-center w-11 h-11 bg-[#08090B]/70 hover:bg-[#E10600] border border-white/20 text-white absolute left-5 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/hero:opacity-100 focus-visible:opacity-100 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlide + 1, true)}
              aria-label="Next hero slide"
              className="hidden md:flex items-center justify-center w-11 h-11 bg-[#08090B]/70 hover:bg-[#E10600] border border-white/20 text-white absolute right-5 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/hero:opacity-100 focus-visible:opacity-100 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom-Center Slide Indicator Bars */}
        <div className="absolute bottom-4 sm:bottom-6 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
          {slides.map((slide, idx) => (
            <button
              key={`dot-${idx}-${slide.eyebrow}`}
              type="button"
              onClick={() => scrollToSlide(idx, true)}
              aria-label={`View slide ${idx + 1}: ${slide.eyebrow}`}
              className="pointer-events-auto py-2 px-1 cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:outline-white"
            >
              <span
                className={`block h-[2px] w-8 transition-all duration-300 ${
                  idx === activeSlide ? 'bg-white' : 'bg-white/45 hover:bg-white/75'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Integrated 4-Column F1 Series Strip */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <SeasonsGallery
          seasonsData={seasonsData}
          onExploreClick={onExploreClick}
          onNavigateToCollection={onNavigateToCollection}
          hideHeader={true}
        />
      </div>
    </section>
  );
};
