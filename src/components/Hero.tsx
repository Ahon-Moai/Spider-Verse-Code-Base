import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { FragranceProduct, SeasonsGalleryData } from '../types';
import { SeasonsGallery } from './SeasonsGallery';

export interface HeroSlideConfig {
  eyebrow: string;
  headline: string;
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
    alt: 'Apex Paddock 1:18 Formula 1 diecast race car model in dark studio lighting',
  },
  {
    image: '/src/assets/images/campaign_f1_pro_118_1794664772367.jpg',
    video_url: '',
    media_type: 'image',
    eyebrow: '1:18 PRO DIECAST',
    headline: 'BUILT FOR THE GRID',
    alt: 'Precision 1:18 alloy Formula 1 model car with exposed front wing assembly',
  },
  {
    image: '/src/assets/images/campaign_f1_display_143_1794664770809.jpg',
    video_url: '',
    media_type: 'image',
    eyebrow: '1:43 & 2.4GHZ RC',
    headline: 'RACE OR DISPLAY',
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
  onExploreClick,
  onNavigateToCollection,
  heroData,
  seasonsData,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.01, 1.08]);

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

  const primaryCtaText = !isLegacyPerfumeCopy(heroData?.primary_cta_text)
    ? heroData.primary_cta_text
    : 'Explore Models';
  const secondaryCtaText = !isLegacyPerfumeCopy(heroData?.secondary_cta_text)
    ? heroData.secondary_cta_text
    : 'Shop Now';

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
    <section
      ref={sectionRef}
      className="relative w-full bg-[#08090B] text-[#F4F2EE] overflow-hidden border-b border-white/10"
    >
      {/* Full-bleed Clean Cinematic Hero Stage (No Darkness Scrim) */}
      <div className="relative min-h-[78vh] lg:min-h-[86vh] flex flex-col justify-end">
        {/* Parallax Backdrop Media (Image or Video per Slide) */}
        <motion.div
          style={{ y: bgY, scale: bgScale }}
          className="absolute inset-0 pointer-events-none will-change-transform"
        >
          {slides.map((slide, idx) => {
            const showVideo =
              (slide.media_type === 'video' || (!slide.media_type && Boolean(slide.video_url))) &&
              Boolean(slide.video_url);

            return showVideo ? (
              <video
                key={`slide-vid-${idx}-${slide.video_url}`}
                src={slide.video_url}
                poster={slide.image || undefined}
                autoPlay
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
                  idx === activeSlide ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ) : (
              <img
                key={`slide-img-${idx}-${slide.image}`}
                src={slide.image}
                alt={slide.alt || slide.headline}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
                  idx === activeSlide ? 'opacity-100' : 'opacity-0'
                }`}
                referrerPolicy="no-referrer"
              />
            );
          })}
        </motion.div>

        {/* Bottom-Left Editorial Copy + Slanted Racing Buttons + Bottom-Center Indicators */}
        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-12 pb-10 sm:pb-14 pt-24">
          <div className="max-w-3xl space-y-4 sm:space-y-5">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1.5"
            >
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
            </motion.div>

            {/* Slanted Parallelogram Motorsport CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={onExploreClick}
                className="btn-f1 bg-[#E10600] hover:bg-[#ff1e18] text-white px-8 py-3 font-display text-base sm:text-lg font-bold tracking-[0.08em] uppercase transition-colors duration-200 cursor-pointer shadow-[0_12px_30px_rgba(225,6,0,0.3)]"
              >
                <span className="btn-f1-inner">{primaryCtaText}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToCollection?.('all')}
                className="btn-f1 border border-white/60 bg-[#08090B]/60 hover:bg-white hover:text-[#08090B] text-white px-8 py-3 font-display text-base sm:text-lg font-bold tracking-[0.08em] uppercase transition-colors duration-200 cursor-pointer backdrop-blur-sm"
              >
                <span className="btn-f1-inner">{secondaryCtaText}</span>
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

        {/* Racing-Red Speed Divider */}
        <div className="relative z-10 w-full h-[2px] bg-[#E10600]" />
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
