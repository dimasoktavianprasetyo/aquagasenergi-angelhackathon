import React from 'react';

interface CrystalEnergyBoltProps {
  className?: string;
  size?: number;
}

export const CrystalEnergyBolt: React.FC<CrystalEnergyBoltProps> = ({
  className = '',
  size = 110
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_10px_25px_rgba(74,222,128,0.45)]"
      >
        <defs>
          {/* Main Front Face Gradient */}
          <linearGradient id="boltFront" x1="20" y1="5" x2="80" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#86efac" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#4ade80" stopOpacity="0.85" />
            <stop offset="80%" stopColor="#22c55e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#15803d" stopOpacity="0.95" />
          </linearGradient>

          {/* Side Bevel Gradient for 3D Depth */}
          <linearGradient id="boltBevel" x1="10" y1="10" x2="60" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#16a34a" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#052e16" stopOpacity="0.9" />
          </linearGradient>

          {/* Glass Highlight Gradient */}
          <linearGradient id="boltGlass" x1="30" y1="0" x2="70" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#86efac" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
          </linearGradient>

          {/* Inner Glow Core */}
          <filter id="glowCore" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 3D Depth Side / Back Extrusions */}
        <polygon
          points="62,6 72,12 50,56 70,58 32,112 40,64 22,62"
          fill="url(#boltBevel)"
          opacity="0.85"
        />

        {/* Main Front Body of the Lightning Bolt */}
        <polygon
          points="58,5 24,56 46,58 18,108 76,52 52,50"
          fill="url(#boltFront)"
          stroke="#bbf7d0"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Faceted Triangular Crystals for 3D Gem Effect */}
        <polygon
          points="58,5 42,32 52,50"
          fill="url(#boltGlass)"
          opacity="0.7"
        />
        <polygon
          points="24,56 46,58 36,80"
          fill="#86efac"
          opacity="0.4"
        />
        <polygon
          points="52,50 76,52 46,58"
          fill="#15803d"
          opacity="0.5"
        />
        <polygon
          points="46,58 18,108 38,72"
          fill="url(#boltGlass)"
          opacity="0.65"
        />

        {/* Specular White Highlights / Sharp Edges */}
        <polyline
          points="58,5 52,50 76,52"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <line
          x1="46"
          y1="58"
          x2="18"
          y2="108"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </div>
  );
};
