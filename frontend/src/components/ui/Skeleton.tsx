import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'text' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
}) => {
  const baseClasses = 'bg-[#181d26] animate-pulse border border-[#232a38] relative overflow-hidden';

  if (variant === 'card') {
    return (
      <div className={`p-4 clip-corner-tr space-y-4 ${baseClasses} ${className}`}>
        <div className="w-full aspect-[4/3] bg-[#222938] clip-corner-tr" />
        <div className="h-4 bg-[#222938] w-3/4 rounded-none" />
        <div className="h-3 bg-[#222938] w-1/2 rounded-none" />
        <div className="h-8 bg-[#222938] w-full rounded-none" />
      </div>
    );
  }

  if (variant === 'text') {
    return <div className={`h-4 w-full rounded-none ${baseClasses} ${className}`} />;
  }

  return <div className={`${baseClasses} ${className}`} />;
};
