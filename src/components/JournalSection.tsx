import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, X } from 'lucide-react';
import { JOURNAL_ARTICLES } from '../data/fragranceData';
import { JournalArticle } from '../types';

interface JournalSectionProps {
  onReadArticle?: (article: JournalArticle) => void;
  articles?: JournalArticle[];
}

const isLegacyPerfumeArticles = (arr?: JournalArticle[]) =>
  !arr ||
  arr.length === 0 ||
  arr.some((a) => /decant|perfume|aromatica|scent|water with/i.test(`${a.title} ${a.publisher} ${a.image}`));

export const JournalSection: React.FC<JournalSectionProps> = ({ onReadArticle, articles }) => {
  const articlesList = isLegacyPerfumeArticles(articles) ? JOURNAL_ARTICLES : articles!;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeArticle, setActiveArticle] = useState<JournalArticle | null>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' });
  };

  const handleOpenArticle = (article: JournalArticle) => {
    setActiveArticle(article);
    onReadArticle?.(article);
  };

  return (
    <section
      id="journal"
      className="w-full bg-[#F4F2EE] text-[#08090B] py-16 sm:py-24 border-b border-zinc-300/70"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-5">
            <span className="font-mono text-[11px] tracking-[0.22em] text-[#E10600] uppercase font-semibold block">
              Paddock Journal
            </span>

            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#08090B] uppercase tracking-tight leading-[0.95]">
              Scale Guides & Track Notes
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Deep dives into 1:18 vs 1:43 diecast tooling, 2.4GHz RC steering dynamics, and collector display care.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={scrollLeft}
                aria-label="Previous articles"
                className="w-10 h-10 bg-[#08090B] hover:bg-[#E10600] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                aria-label="Next articles"
                className="w-10 h-10 bg-[#08090B] hover:bg-[#E10600] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Articles Grid / Scroll Row */}
          <div className="lg:col-span-9">
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {articlesList.map((article) => (
                <article
                  key={article.id}
                  onClick={() => handleOpenArticle(article)}
                  className="flex-shrink-0 w-[280px] sm:w-[320px] bg-white border border-zinc-200/90 hover:border-[#08090B] overflow-hidden flex flex-col justify-between group cursor-pointer transition-colors"
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full bg-zinc-100 overflow-hidden border-b border-zinc-200/70">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.14em] uppercase text-zinc-500">
                        <span>{article.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{article.publisher}</span>
                      </div>

                      <h3 className="font-display text-xl font-bold uppercase tracking-wide text-[#08090B] group-hover:text-[#E10600] transition-colors leading-tight line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                        {article.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenArticle(article);
                      }}
                      className="btn-f1 inline-flex items-center bg-[#08090B] group-hover:bg-[#E10600] text-white px-5 py-2 font-display text-sm font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer"
                    >
                      <span className="btn-f1-inner">
                        <span>Read Guide</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="bg-white text-[#08090B] border border-zinc-300 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] w-full bg-zinc-900 overflow-hidden">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                aria-label="Close article"
                className="absolute top-4 right-4 w-9 h-9 bg-[#08090B] hover:bg-[#E10600] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.16em] uppercase text-[#E10600]">
                <span>{activeArticle.date}</span>
                <span aria-hidden="true">·</span>
                <span>{activeArticle.publisher}</span>
              </div>

              <h3 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#08090B] leading-none">
                {activeArticle.title}
              </h3>

              <p className="text-sm text-zinc-700 leading-relaxed pt-2">
                {activeArticle.description}
              </p>

              <p className="text-sm text-zinc-600 leading-relaxed">
                Every Formula 1 scale car inspected at our pit garage undergoes chassis alignment verification, rubber tire check, and multi-layer foam boxing to safeguard delicate aero wings during transit.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
