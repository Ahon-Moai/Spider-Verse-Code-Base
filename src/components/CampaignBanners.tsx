import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CampaignBannersData } from '../types';

const DEFAULT_PRO_118_IMG = '/src/assets/images/campaign_f1_pro_118_1794664772367.jpg';
const DEFAULT_DISPLAY_143_IMG = '/src/assets/images/campaign_f1_display_143_1794664770809.jpg';

interface CampaignBannersProps {
  onSelectCategory: (gender: 'Him' | 'Her') => void;
  onNavigateToCollection?: (slug: string) => void;
  campaignData?: CampaignBannersData;
}

const isLegacyText = (text?: string) =>
  !text || /^(for him|for her|shop decants|his & hers)$/i.test(text.trim());

const isLegacyImg = (url?: string) =>
  !url || /campaign_for_(him|her)|campaign_(carbon|velvet)/i.test(url);

export const CampaignBanners: React.FC<CampaignBannersProps> = ({
  onSelectCategory,
  onNavigateToCollection,
  campaignData,
}) => {
  const sectionTitle = !isLegacyText(campaignData?.section_title)
    ? campaignData!.section_title
    : 'SCALE DIVISIONS';

  const divisionOneTitle = !isLegacyText(campaignData?.for_him_title)
    ? campaignData!.for_him_title
    : '1:18 Pro Diecast';
  const divisionOneBtn = !isLegacyText(campaignData?.for_him_button_text)
    ? campaignData!.for_him_button_text
    : 'Shop 1:18 Models';
  const divisionOneImg = !isLegacyImg(campaignData?.for_him_image)
    ? campaignData!.for_him_image!
    : DEFAULT_PRO_118_IMG;

  const divisionTwoTitle = !isLegacyText(campaignData?.for_her_title)
    ? campaignData!.for_her_title
    : '1:43 Collector Grid';
  const divisionTwoBtn = !isLegacyText(campaignData?.for_her_button_text)
    ? campaignData!.for_her_button_text
    : 'Shop 1:43 Editions';
  const divisionTwoImg = !isLegacyImg(campaignData?.for_her_image)
    ? campaignData!.for_her_image!
    : DEFAULT_DISPLAY_143_IMG;

  return (
    <section
      id="for-him-her"
      className="perf-section w-full bg-[#08090B] text-[#F4F2EE] py-14 sm:py-20 border-b border-white/10"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Motorsport Division Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-4 mb-8 gap-2">
          <div>
            <span className="font-mono text-[11px] tracking-[0.22em] text-[#E10600] uppercase block">
              Garage Classes
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white uppercase mt-1 leading-none">
              {sectionTitle}
            </h2>
          </div>
          <span className="font-mono text-xs text-[#9CA3AF] uppercase tracking-[0.16em]">
            Official Team Allocations
          </span>
        </div>

        {/* 2-Column Cinematic Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Division 01: 1:18 Pro Diecast */}
          <div
            onClick={() =>
              onNavigateToCollection
                ? onNavigateToCollection('forhim')
                : onSelectCategory('Him')
            }
            className="group relative cursor-pointer overflow-hidden bg-[#111317] border border-white/10 hover:border-[#E10600] transition-colors duration-300 flex flex-col"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0B0D11]">
              <img
                src={divisionOneImg}
                alt="1:18 Pro Diecast Formula 1 alloy model car"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090B]/90 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.2em] uppercase text-[#C4C9D4] bg-[#08090B]/80 border border-white/15 px-2.5 py-1">
                Class 01 · 31cm Alloy
              </span>
            </div>

            <div className="bg-[#111317] px-5 sm:px-6 py-4 flex items-center justify-between border-t border-white/10">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white">
                  {divisionOneTitle}
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  Steerable front suspension, alloy body & exposed front wings
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-[0.16em] uppercase text-[#E10600] group-hover:text-white transition-colors shrink-0">
                <span>{divisionOneBtn}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          {/* Division 02: 1:43 Collector Grid */}
          <div
            onClick={() =>
              onNavigateToCollection
                ? onNavigateToCollection('forher')
                : onSelectCategory('Her')
            }
            className="group relative cursor-pointer overflow-hidden bg-[#111317] border border-white/10 hover:border-[#E10600] transition-colors duration-300 flex flex-col"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0B0D11]">
              <img
                src={divisionTwoImg}
                alt="1:43 scale Formula 1 display cars in acrylic cases"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090B]/90 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.2em] uppercase text-[#C4C9D4] bg-[#08090B]/80 border border-white/15 px-2.5 py-1">
                Class 02 · Acrylic Showcase
              </span>
            </div>

            <div className="bg-[#111317] px-5 sm:px-6 py-4 flex items-center justify-between border-t border-white/10">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white">
                  {divisionTwoTitle}
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  Sealed display plinths, team twin packs & desktop liveries
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-[0.16em] uppercase text-[#E10600] group-hover:text-white transition-colors shrink-0">
                <span>{divisionTwoBtn}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
