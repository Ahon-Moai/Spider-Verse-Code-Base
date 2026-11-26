import React, { useRef } from 'react';
import { Heart, MessageCircle, Instagram, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { SOCIAL_CARDS } from '../data/fragranceData';
import { SocialCard } from '../types';

const WORKSHOP_IMAGE = '/src/assets/images/workshop_f1_pit_bench_1794664770942.jpg';

interface StudioSectionProps {
  socialCards?: SocialCard[];
}

const isLegacySocialCards = (arr?: SocialCard[]) =>
  !arr ||
  arr.length === 0 ||
  arr.some((c) => /aromatic|decant|studio_social/i.test(`${c.handle} ${c.image} ${c.tag || ''}`));

export const StudioSection: React.FC<StudioSectionProps> = ({ socialCards }) => {
  const cards = isLegacySocialCards(socialCards) ? SOCIAL_CARDS : socialCards!;
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' });
  };

  return (
    <section
      id="studio-section"
      className="perf-section w-full bg-[#08090B] text-[#F4F2EE] py-16 sm:py-24 border-b border-white/10"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Split: Precision Pit Garage Workshop Feature */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px] bg-[#111317] border border-white/15 overflow-hidden">
            <img
              src={WORKSHOP_IMAGE}
              alt="Spider Verse Formula 1 diecast assembly and inspection workbench"
              decoding="async"
              className="w-full h-full object-cover object-center"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090B]/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-[#C4C9D4]">
              <span>Inspection & Assembly Bench</span>
              <span className="text-[#E10600]">Wing & Livery QC Protocol</span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#111317] border border-white/10 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="font-mono text-[11px] tracking-[0.22em] text-[#E10600] uppercase font-semibold block">
                Inside The Paddock
              </span>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-white uppercase tracking-tight leading-[0.92]">
                Our Pit Garage
              </h2>
              <p className="text-xs sm:text-sm text-[#C4C9D4] leading-relaxed">
                Every F1 toy car and diecast replica undergoes front-wing alignment, wheel spin check, and tampo paint inspection before foam-cradled boxing. Follow our daily unboxings, pit-lane dioramas, and new livery drops.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="btn-f1 bg-[#E10600] hover:bg-[#ff1e18] text-white px-7 py-3 font-display text-base font-bold uppercase tracking-[0.08em] transition-colors"
              >
                <span className="btn-f1-inner">
                  <span>@spiderverse</span>
                  <span>Follow Garage</span>
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={scrollLeft}
                  aria-label="Previous garage capture"
                  className="w-9 h-9 bg-[#08090B] hover:bg-[#E10600] border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollRight}
                  aria-label="Next garage capture"
                  className="w-9 h-9 bg-[#08090B] hover:bg-[#E10600] border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Feed Row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex-shrink-0 w-[230px] sm:w-[270px] lg:w-[calc(25%-12px)] bg-[#111317] border border-white/10 hover:border-[#E10600] overflow-hidden flex flex-col group transition-colors"
            >
              <div className="px-3.5 py-2.5 flex items-center justify-between bg-[#08090B] border-b border-white/10">
                <span className="text-[11px] font-mono text-[#C4C9D4]">{card.handle}</span>
                <Instagram className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </div>

              <div className="relative aspect-square w-full bg-[#08090B] overflow-hidden">
                <img
                  src={card.image}
                  alt="Spider Verse Formula 1 scale model showcase"
                  decoding="async"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              <div className="px-3.5 py-2.5 bg-[#08090B] border-t border-white/10 flex items-center justify-between text-[#9CA3AF] text-[11px] font-mono tabular-nums">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#E10600]" />
                    <span>{card.likes}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{card.comments}</span>
                  </span>
                </div>
                {card.tag && (
                  <span className="text-[9px] tracking-[0.14em] uppercase text-[#C4C9D4] truncate max-w-[110px]">
                    {card.tag}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
