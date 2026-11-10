import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'yellow' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  withSpeedCut?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  withSpeedCut = true,
  className = '',
  children,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-condensed uppercase tracking-wider font-extrabold italic transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-sm px-4 py-1.5',
    md: 'text-base px-6 py-2.5',
    lg: 'text-lg px-8 py-3.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#e10600] text-white hover:bg-[#ff1a14] hover:shadow-[0_0_20px_rgba(225,6,0,0.5)] border border-[#ff3d38]',
    secondary:
      'bg-[#1a202c] text-white hover:bg-[#252e3e] border border-[#2d3748] hover:border-[#4a5568]',
    outline:
      'bg-transparent text-white border-2 border-[#e10600] hover:bg-[#e10600]/10 hover:border-[#ff3d38] hover:shadow-[0_0_15px_rgba(225,6,0,0.3)]',
    yellow:
      'bg-[#ffe600] text-black hover:bg-[#fff04d] hover:shadow-[0_0_20px_rgba(255,230,0,0.5)] border border-[#ffd000]',
    ghost:
      'bg-transparent text-[#8e9bb0] hover:text-white hover:bg-white/5 border border-transparent',
  }[variant];

  const cutClass = withSpeedCut ? 'clip-corner-tr' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${cutClass} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};
