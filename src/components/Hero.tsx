import React, { useState, useEffect } from 'react';
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
    eyebrow: "SEASON '26",
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
  const [loadedSlides, setLoadedSlides] = useState<Record<number, boolean>>({ 0: true });

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

  useEffect(() => {
    setLoadedSlides((prev) => (prev[activeSlide] ? prev : { ...prev, [activeSlide]: true }));
  }, [activeSlide]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[activeSlide] || slides[0];

  return (
    <section className="relative w-full bg-[#08090B] text-[#F4F2EE] overflow-hidden border-b border-white/10">
      {/* Full-bleed Clean Cinematic Hero Stage (Locked 2px Red Divider at Bottom Edge) */}
      <div className="relative h-[76svh] sm:h-[80svh] lg:h-[84svh] min-h-[460px] max-h-[820px] flex flex-col justify-end overflow-hidden border-b-2 border-[#E10600]">
        {/* Backdrop Media (Image or Video per Slide — lazily mounted) */}
        <div className="absolute inset-0 pointer-events-none">
          {slides.map((slide, idx) => {
            if (!loadedSlides[idx] && idx !== activeSlide) return null;

            const showVideo =
              (slide.media_type === 'video' || (!slide.media_type && Boolean(slide.video_url))) &&
              Boolean(slide.video_url);

            if (showVideo && idx !== activeSlide) return null;

            return showVideo ? (
              <video
                key={`slide-vid-${idx}-${slide.video_url}`}
                src={slide.video_url}
                poster={slide.image || undefined}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            ) : (
              <img
                key={`slide-img-${idx}-${slide.image}`}
                src={slide.image}
                alt={slide.alt || slide.headline}
                decoding="async"
                fetchPriority={idx === 0 ? 'high' : 'low'}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${
                  idx === activeSlide ? 'opacity-100' : 'opacity-0'
                }`}
                referrerPolicy="no-referrer"
              />
            );
          })}
        </div>

        {/* Bottom-Left Editorial Copy + Slanted Racing Buttons + Bottom-Center Indicators */}
        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-12 pb-10 sm:pb-14 pt-24">
          <div className="max-w-3xl space-y-4 sm:space-y-5">
            <div key={activeSlide} className="space-y-1.5 animate-fade-in">
              <p className="font-sans text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase text-[#F4F2EE] drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                {current.eyebrow}
              </p>

              <h1
                className="font-display font-black uppercase tracking-[0.01em] leading-[0.94] text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.7)]"
                style={{
                  fontSize: 'clamp(2.5rem, 5.2vw, 4.75rem)',
                  textWrap: 'balance',
                }}
              >
                {current.headline}
              </h1>
            </div>

            {/* Slanted Motorsport CTAs: Per-Slide Product CTA + Shop All */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => handleSlideCtaClick(current)}
                className="btn-f1 bg-[#E10600] hover:bg-[#ff1e18] text-white px-8 py-3 font-display text-base sm:text-lg font-bold tracking-[0.08em] uppercase transition-colors duration-200 cursor-pointer shadow-[0_12px_30px_rgba(225,6,0,0.3)]"
              >
                <span className="btn-f1-inner">{current.cta_text || 'Explore Model'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToCollection?.('all')}
                className="btn-f1 border border-white/70 bg-[#08090B]/80 hover:bg-white hover:text-[#08090B] text-white px-8 py-3 font-display text-base sm:text-lg font-bold tracking-[0.08em] uppercase transition-colors duration-200 cursor-pointer"
              >
                <span className="btn-f1-inner">{shopAllText}</span>
              </button>
            </div>
          </div>

          {/* Bottom-Center 3 Slide Indicator Bars */}
          <div className="flex items-center justify-center gap-2.5 mt-8 sm:mt-4">
            {slides.map((slide, idx) => (
              <button
                key={`dot-${idx}-${slide.eyebrow}`}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`View slide ${idx + 1}: ${slide.eyebrow}`}
                className={`h-[2px] w-8 transition-all duration-300 cursor-pointer ${
                  idx === activeSlide ? 'bg-white' : 'bg-white/45 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
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
