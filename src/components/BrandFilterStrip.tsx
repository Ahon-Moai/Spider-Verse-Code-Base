import React, { useState } from 'react';
import { BRANDS_LIST } from '../data/fragranceData';

interface BrandFilterStripProps {
  onSelectBrand?: (brand: string) => void;
  brands?: Array<{ name: string; isNew?: boolean }>;
}

export const BrandFilterStrip: React.FC<BrandFilterStripProps> = ({ onSelectBrand, brands }) => {
  const list = brands && brands.length > 0 ? brands : BRANDS_LIST;
  const [activeItem, setActiveItem] = useState<string>(list[0]?.name || 'BBURAGO');

  const handleSelect = (name: string) => {
    setActiveItem(name);
    if (onSelectBrand) {
      onSelectBrand(name);
    }
  };

  return (
    <div id="brands" className="w-full bg-[#111317] py-5 border-b border-white/10 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {list.map((brand) => {
            const isSelected = activeItem === brand.name;
            return (
              <button
                key={brand.name}
                type="button"
                onClick={() => handleSelect(brand.name)}
                className={`whitespace-nowrap px-4 py-2 border text-[11px] font-mono tracking-[0.14em] uppercase transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'border-[#E10600] bg-[#E10600] text-white'
                    : 'border-white/15 bg-[#08090B] text-[#C4C9D4] hover:border-white/40 hover:text-white'
                }`}
              >
                <span>{brand.name}</span>
                {brand.isNew && (
                  <span
                    className={`text-[9px] font-bold uppercase ${
                      isSelected ? 'text-white' : 'text-[#E10600]'
                    }`}
                  >
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
