import React from 'react';

interface MiniSparklineProps {
  type?: 'line' | 'bar' | 'slider';
  color?: string;
  className?: string;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  type = 'line',
  color = '#10b981',
  className = ''
}) => {
  if (type === 'bar') {
    return (
      <svg width="40" height="24" viewBox="0 0 40 24" fill="none" className={className}>
        <rect x="2" y="14" width="4" height="10" rx="2" fill={color} opacity="0.4" />
        <rect x="10" y="9" width="4" height="15" rx="2" fill={color} opacity="0.6" />
        <rect x="18" y="16" width="4" height="8" rx="2" fill={color} opacity="0.5" />
        <rect x="26" y="6" width="4" height="18" rx="2" fill={color} opacity="0.8" />
        <rect x="34" y="2" width="4" height="22" rx="2" fill={color} />
      </svg>
    );
  }

  if (type === 'slider') {
    return (
      <svg width="48" height="20" viewBox="0 0 48 20" fill="none" className={className}>
        <line x1="2" y1="10" x2="46" y2="10" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="2" y1="10" x2="32" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="10" r="4.5" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
      </svg>
    );
  }

  // Default: smooth curved sparkline
  return (
    <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className={className}>
      <path
        d="M2 18 C 10 18, 14 6, 22 10 C 30 14, 36 4, 46 8"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
