import React from 'react';

interface BrandLogoProps {
  name?: string;
  variant?: 'header' | 'drawer' | 'footer';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  name = 'SPIDER VERSE',
  variant = 'header',
  className = '',
}) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstWord = parts[0] || 'SPIDER';
  const restWords = parts.slice(1).join(' ');

  if (variant === 'footer') {
    return (
      <span
        className={`inline-flex items-stretch justify-center gap-3 sm:gap-5 select-none ${className}`}
      >
        <span className="bg-[#EC1D24] text-white px-3 sm:px-5 py-1.5 sm:py-2.5 flex items-center justify-center">
          <span className="font-logo font-black uppercase text-[10vw] sm:text-[7.5vw] lg:text-[6vw] leading-[0.82] tracking-[-0.02em] scale-y-[1.06] whitespace-nowrap">
            {firstWord}
          </span>
        </span>
        {restWords && (
          <span className="border-y-[3px] sm:border-y-[4px] border-white px-1 sm:px-2 py-1 sm:py-2 flex items-center justify-center">
            <span className="font-display font-normal uppercase text-white text-[10vw] sm:text-[7.5vw] lg:text-[6vw] leading-[0.82] tracking-[0.03em] scale-y-[1.06] whitespace-nowrap">
              {restWords}
            </span>
          </span>
        )}
      </span>
    );
  }

  if (variant === 'drawer') {
    return (
      <span className={`inline-flex items-stretch gap-1.5 select-none ${className}`}>
        <span className="bg-[#EC1D24] text-white px-1.5 py-0.5 flex items-center justify-center">
          <span className="font-logo font-black uppercase text-[26px] leading-[0.84] tracking-[-0.02em] scale-y-[1.06] whitespace-nowrap">
            {firstWord}
          </span>
        </span>
        {restWords && (
          <span className="border-y-2 border-white px-0.5 py-0.5 flex items-center justify-center">
            <span className="font-display font-normal uppercase text-white text-[26px] leading-[0.84] tracking-[0.04em] scale-y-[1.06] whitespace-nowrap">
              {restWords}
            </span>
          </span>
        )}
      </span>
    );
  }

  // Default: 'header'
  return (
    <span className={`inline-flex items-stretch gap-1.5 select-none ${className}`}>
      <span className="bg-[#EC1D24] text-white px-1.5 sm:px-2 py-0.5 flex items-center justify-center">
        <span className="font-logo font-black uppercase text-[24px] sm:text-[28px] md:text-[31px] leading-[0.82] tracking-[-0.025em] scale-y-[1.06] whitespace-nowrap">
          {firstWord}
        </span>
      </span>
      {restWords && (
        <span className="border-y-[2px] border-white px-0.5 py-0.5 flex items-center justify-center">
          <span className="font-display font-normal uppercase text-white text-[24px] sm:text-[28px] md:text-[31px] leading-[0.82] tracking-[0.03em] scale-y-[1.06] whitespace-nowrap">
            {restWords}
          </span>
        </span>
      )}
    </span>
  );
};
