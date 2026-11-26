import React, { useRef, useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Pause, Play, Quote } from 'lucide-react';
import { REVIEWS_LIST } from '../data/fragranceData';
import { ReviewItem } from '../types';

interface ReviewsSectionProps {
  reviews?: ReviewItem[];
}

const isLegacyPerfumeReviews = (arr?: ReviewItem[]) =>
  !arr ||
  arr.length === 0 ||
  arr.some((r) => /perfume|decant|spray|atomizer|bottle/i.test(r.content));

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const reviewsData = isLegacyPerfumeReviews(reviews) ? REVIEWS_LIST : reviews!;
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInView, setIsInView] = useState(false);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    const interval = setInterval(() => {
      if (document.hidden || !scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="perf-section w-full bg-[#212428] text-[#F4F2EE] py-16 sm:py-24 border-b border-white/10"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-5 pr-4">
            <span className="font-mono text-[11px] tracking-[0.22em] text-[#E10600] uppercase font-semibold block">
              Verified Feedback
            </span>

            <h2 className="font-display font-black text-4xl sm:text-5xl text-white uppercase tracking-tight leading-[0.95]">
              Unboxed. Raced. Displayed.
            </h2>

            <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed max-w-sm">
              Unfiltered feedback from motorsport collectors and families building display shelves and racing 2.4GHz RC F1 toy cars.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })}
                className="btn-f1 bg-[#E10600] hover:bg-[#ff1e18] text-white font-display text-base font-bold tracking-[0.08em] uppercase px-7 py-3 transition-colors cursor-pointer"
              >
                <span className="btn-f1-inner">Reset Carousel</span>
              </button>
            </div>
          </div>

          {/* Right Column: Horizontal Cards */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {reviewsData.map((rev) => (
                <div
                  key={rev.id}
                  className="flex-shrink-0 w-[280px] sm:w-[330px] bg-[#2B2F36] border border-white/10 hover:border-white/25 p-6 flex flex-col justify-between min-h-[230px] transition-colors"
                >
                  <div className="space-y-3">
                    <Quote className="w-4 h-4 text-[#E10600]" />
                    <p className="text-xs sm:text-sm text-[#E5E7EB] leading-relaxed">
                      "{rev.content}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 mt-5 flex items-center justify-between">
                    <div>
                      <p className="font-display text-base font-bold uppercase tracking-wide text-white">
                        {rev.author}
                      </p>
                      <span className="font-mono text-[10px] text-[#9CA3AF] uppercase">
                        Verified Collector
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#E10600] text-[#E10600]" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#9CA3AF]">
                Swipe or Navigate →
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? 'Pause review autoplay' : 'Play review autoplay'}
                  className="w-9 h-9 border border-white/15 bg-[#2B2F36] hover:border-white text-[#C4C9D4] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={scrollLeft}
                  aria-label="Previous review"
                  className="w-9 h-9 border border-white/15 bg-[#2B2F36] hover:bg-[#E10600] hover:border-[#E10600] text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollRight}
                  aria-label="Next review"
                  className="w-9 h-9 border border-white/15 bg-[#2B2F36] hover:bg-[#E10600] hover:border-[#E10600] text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
