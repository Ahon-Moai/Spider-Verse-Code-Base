import React from 'react';

export interface BadgeProps {
  variant?: 'red' | 'yellow' | 'blue' | 'carbon' | 'green';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'red',
  size = 'md',
  children,
  className = '',
}) => {
  const variantStyles = {
    red: 'bg-[#e10600]/20 text-[#ff4d47] border-[#e10600]/50 shadow-[0_0_8px_rgba(225,6,0,0.3)]',
    yellow: 'bg-[#ffe600]/20 text-[#ffe600] border-[#ffe600]/50 shadow-[0_0_8px_rgba(255,230,0,0.3)]',
    blue: 'bg-[#00d2ff]/20 text-[#00d2ff] border-[#00d2ff]/50 shadow-[0_0_8px_rgba(0,210,255,0.3)]',
    carbon: 'bg-[#181d26] text-[#a0aec0] border-[#2d3748]',
    green: 'bg-[#00e676]/20 text-[#00e676] border-[#00e676]/50',
  }[variant];

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 uppercase font-condensed italic tracking-wider border clip-racing-tag ${variantStyles} ${sizeStyles} ${className}`}
    >
      <span className="w-1.5 h-1.5 bg-current rounded-none transform rotate-45" />
      {children}
    </span>
  );
};
