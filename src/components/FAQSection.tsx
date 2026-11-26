import React, { useState } from 'react';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import { FAQ_ITEMS } from '../data/fragranceData';

interface FAQSectionProps {
  faqs?: Array<{ id: string; question: string; answer: string }>;
}

const isLegacyPerfumeFaq = (list?: Array<{ question: string }>) =>
  !list ||
  list.length === 0 ||
  list.some((f) => /decant|perfume|fragrance|sniff/i.test(f.question));

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const faqList = isLegacyPerfumeFaq(faqs) ? FAQ_ITEMS : faqs!;
  const [openId, setOpenId] = useState<string>(faqList[0]?.id || 'faq-1');

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? '' : id);
  };

  return (
    <section
      id="faq"
      className="perf-section w-full bg-[#F4F2EE] text-[#08090B] py-16 sm:py-24 border-b border-zinc-300/70 select-none"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#08090B] pb-4 mb-10 gap-3">
          <div>
            <span className="font-mono text-[11px] tracking-[0.22em] text-[#E10600] uppercase font-semibold block">
              Technical Briefings
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#08090B] leading-none mt-1">
              Frequently Asked Questions
            </h2>
          </div>
          <span className="font-mono text-xs text-zinc-600 uppercase tracking-[0.16em]">
            Garage Support & Policy
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Accordions */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="divide-y divide-zinc-300 border-t border-b border-zinc-300">
              {faqList.map((item, idx) => {
                const isOpen = openId === item.id;
                return (
                  <div key={item.id} className="py-4 sm:py-5">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.id)}
                      className="w-full flex items-center justify-between text-left group cursor-pointer focus-visible:outline-none"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-baseline gap-3 pr-4">
                        <span className="font-mono text-xs text-[#E10600] font-semibold tabular-nums shrink-0">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-[#08090B] group-hover:text-[#E10600] transition-colors">
                          {item.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[#08090B] transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-[#E10600]' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="mt-3 ml-8 p-4 bg-white border border-zinc-200 text-xs sm:text-sm text-zinc-700 leading-relaxed animate-fade-in">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Dark Obsidian Paddock Concierge Panel */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <div className="bg-[#111317] text-[#F4F2EE] border border-[#08090B] p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#E10600] font-semibold">
                  Paddock Support
                </span>
                <span className="font-mono text-[10px] text-[#9CA3AF] uppercase">
                  10AM — 11PM
                </span>
              </div>

              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase tracking-tight leading-tight">
                Scale Matching, RC Pairing & Gift Concierge
              </h3>

              <p className="text-xs sm:text-sm text-[#C4C9D4] leading-relaxed">
                Our model specialists assist with choosing between 1:18 alloy display pieces, 1:43 acrylic showcase grids, and kid-ready 2.4GHz RC racers for collectors and gifts.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('new-arrivals');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-f1 bg-[#E10600] hover:bg-[#ff1e18] text-white font-display text-base font-bold tracking-[0.08em] uppercase px-7 py-3 transition-colors cursor-pointer"
                >
                  <span className="btn-f1-inner">
                    <span>Browse F1 Cars</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-zinc-300 p-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-500">
                  Direct Garage Hotline
                </p>
                <p className="font-mono text-xs sm:text-sm font-bold text-[#08090B] mt-0.5 tabular-nums">
                  +880 1700-000000
                </p>
              </div>
              <span className="font-mono text-[11px] font-semibold text-[#E10600] uppercase">
                WhatsApp · DM
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
