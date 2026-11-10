import React from 'react';

export interface StatBarProps {
  label: string;
  value: number; // 0 to 100
  displayValue?: string;
  variant?: 'red' | 'yellow' | 'blue';
  className?: string;
}

export const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  displayValue,
  variant = 'red',
  className = '',
}) => {
  const barColors = {
    red: 'bg-gradient-to-r from-[#e10600] to-[#ff453a]',
    yellow: 'bg-gradient-to-r from-[#ffe600] to-[#ffaa00]',
    blue: 'bg-gradient-to-r from-[#00d2ff] to-[#0070f3]',
  }[variant];

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between text-xs font-mono-telemetry uppercase tracking-wider text-[#8e9bb0]">
        <span>{label}</span>
        <span className="font-bold text-white">{displayValue || `${value}%`}</span>
      </div>
      <div className="h-2 w-full bg-[#1c2230] border border-[#2b3548] p-[1px] relative overflow-hidden">
        <div
          className={`h-full ${barColors} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
        {/* Subtle checkered overlay tick marks */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_19%,rgba(0,0,0,0.6)_20%)] bg-[length:10px_100%] pointer-events-none" />
      </div>
    </div>
  );
};
