import React from 'react';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  tag?: string;
  align?: 'left' | 'center';
  action?: React.ReactNode;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  tag,
  align = 'left',
  action,
}) => {
  return (
    <div
      className={`mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 ${
        align === 'center' ? 'text-center items-center' : ''
      }`}
    >
      <div>
        {tag && (
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-[#e10600]" />
            <span className="text-xs uppercase tracking-widest font-mono-telemetry text-[#e10600] font-bold">
              {tag}
            </span>
            <div className="h-[1px] w-8 bg-[#e10600]/40" />
          </div>
        )}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-wide text-white uppercase flex items-baseline gap-3">
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="mt-2 text-[#8e9bb0] text-base sm:text-lg max-w-2xl font-body">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
