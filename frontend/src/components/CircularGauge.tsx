import React from 'react';

interface CircularGaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  colorGradient?: 'green' | 'blue' | 'emerald' | 'amber';
  unit?: string;
  sublabel?: string;
  textColor?: 'white' | 'dark';
  trackColor?: string;
  variant?: 'circle' | 'squircle';
  rx?: number;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  max = 100,
  size = 96,
  strokeWidth = 7,
  colorGradient = 'green',
  unit = '%',
  sublabel,
  textColor = 'white',
  trackColor,
  variant = 'squircle',
  rx
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, 0), max);
  const strokeDashoffsetCircle = circumference - (clampedValue / max) * circumference;
  const gradientId = `gauge-gradient-${colorGradient}-${Math.random().toString(36).substring(2, 9)}`;

  const getGradientColors = () => {
    switch (colorGradient) {
      case 'blue':
        return { start: '#93c5fd', end: '#0284c7' };
      case 'emerald':
        return { start: '#a7f3d0', end: '#059669' };
      case 'amber':
        return { start: '#fde68a', end: '#d97706' };
      case 'green':
      default:
        // Lush green fading from soft mint at top-left to deep emerald at bottom-right
        return { start: '#86efac', end: '#16a34a' };
    }
  };

  const colors = getGradientColors();
  const defaultTrack = textColor === 'dark' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)';
  const activeTrack = trackColor || defaultTrack;
  const cornerRadius = rx || size * 0.32;
  const rectPos = strokeWidth / 2;
  const rectDim = size - strokeWidth;

  return (
    <div className="relative inline-flex flex-col items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} stopOpacity="0.4" />
            <stop offset="40%" stopColor={colors.start} stopOpacity="0.85" />
            <stop offset="100%" stopColor={colors.end} stopOpacity="1" />
          </linearGradient>
        </defs>

        {variant === 'squircle' ? (
          <>
            {/* Background Track Squircle */}
            <rect
              x={rectPos}
              y={rectPos}
              width={rectDim}
              height={rectDim}
              rx={cornerRadius}
              stroke={activeTrack}
              strokeWidth={strokeWidth}
              fill="transparent"
              pathLength="100"
            />
            {/* Animated Gradient Value Arc Squircle */}
            <rect
              x={rectPos}
              y={rectPos}
              width={rectDim}
              height={rectDim}
              rx={cornerRadius}
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              strokeDasharray="100"
              strokeDashoffset={100 - (clampedValue / max) * 100}
              strokeLinecap="round"
              fill="transparent"
              pathLength="100"
              className="transition-all duration-1000 ease-out"
            />
          </>
        ) : (
          <>
            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={activeTrack}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated Gradient Value Arc Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffsetCircle}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </>
        )}
      </svg>

      {/* Center Numeric Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-2xl md:text-3xl font-normal font-sans tracking-tight ${textColor === 'dark' ? 'text-black' : 'text-white'}`}>
          {Number.isInteger(value) ? value : value.toFixed(1)}
          <span className={`text-sm font-normal ml-0.5 ${textColor === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>{unit}</span>
        </span>
        {sublabel && (
          <span className={`text-[9px] font-semibold uppercase tracking-wider ${textColor === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{sublabel}</span>
        )}
      </div>
    </div>
  );
};
