import React from 'react';

interface InfernoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  monochrome?: boolean;
}

export const InfernoLogo: React.FC<InfernoLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = false,
  monochrome = false,
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`${sizeMap[size]} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Team Inferno Logo"
      >
        <defs>
          {/* Flame Gradients */}
          <linearGradient id="infernoOuterFlame" x1="50" y1="95" x2="50" y2="5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={monochrome ? 'currentColor' : '#991B1B'} />
            <stop offset="45%" stopColor={monochrome ? 'currentColor' : '#DC2626'} />
            <stop offset="85%" stopColor={monochrome ? 'currentColor' : '#EA580C'} />
            <stop offset="100%" stopColor={monochrome ? 'currentColor' : '#F97316'} />
          </linearGradient>

          <linearGradient id="infernoMidFlame" x1="50" y1="90" x2="50" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={monochrome ? 'currentColor' : '#DC2626'} />
            <stop offset="50%" stopColor={monochrome ? 'currentColor' : '#F97316'} />
            <stop offset="100%" stopColor={monochrome ? 'currentColor' : '#FBBF24'} />
          </linearGradient>

          <linearGradient id="infernoCoreFlame" x1="50" y1="85" x2="50" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={monochrome ? 'currentColor' : '#EA580C'} />
            <stop offset="60%" stopColor={monochrome ? 'currentColor' : '#FBBF24'} />
            <stop offset="100%" stopColor={monochrome ? 'currentColor' : '#FEF08A'} />
          </linearGradient>

          <linearGradient id="infernoShieldRim" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={monochrome ? 'currentColor' : '#F97316'} />
            <stop offset="50%" stopColor={monochrome ? 'currentColor' : '#DC2626'} />
            <stop offset="100%" stopColor={monochrome ? 'currentColor' : '#7F1D1D'} />
          </linearGradient>

          {/* Ember glow filter */}
          <filter id="infernoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Dark Shield Crest */}
        <path
          d="M50 3L88 18V48C88 72 71 91 50 97C29 91 12 72 12 48V18L50 3Z"
          fill={monochrome ? 'transparent' : '#0B0F19'}
          stroke="url(#infernoShieldRim)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Shield Subtle Background Texture Grid Accent */}
        <path
          d="M50 8L82 21V48C82 68 68 85 50 90C32 85 18 68 18 48V21L50 8Z"
          fill={monochrome ? 'transparent' : '#111827'}
          opacity="0.8"
        />

        {/* Outer Ember Flare (Left & Right Wings) */}
        <g filter="url(#infernoGlow)">
          {/* Left Flame Wing */}
          <path
            d="M33 66C28 58 26 48 30 38C32 34 35 30 38 27C37 32 38 37 41 41C42 35 46 30 50 25C47 34 50 42 54 48C56 42 59 37 63 32C62 38 64 45 68 50C71 54 73 60 71 67C69 74 63 79 58 82C55 83 45 83 42 82C37 78 34 72 33 66Z"
            fill="url(#infernoOuterFlame)"
          />

          {/* Mid Dynamic Flame Tongue */}
          <path
            d="M38 68C34 60 36 50 40 43C42 47 45 50 48 51C47 43 50 34 55 24C55 33 58 39 62 44C64 47 64 52 64 56C64 64 60 70 55 74C51 77 47 77 44 76C40 74 38 71 38 68Z"
            fill="url(#infernoMidFlame)"
          />

          {/* Core White-Hot Heart */}
          <path
            d="M44 69C42 63 44 56 47 50C48 53 50 56 52 56C52 50 54 44 56 38C57 44 59 48 60 52C61 56 60 61 57 65C54 68 51 69 49 69C46 69 45 70 44 69Z"
            fill="url(#infernoCoreFlame)"
          />
        </g>

        {/* Sleek 'I' Center Monogram Accent */}
        <path
          d="M48 65L50 57L52 65H48Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
      </svg>

      {showWordmark && (
        <div className="flex flex-col justify-center">
          <span className="font-extrabold text-sm tracking-wider uppercase text-gov-navy-950 font-mono flex items-center gap-1 leading-none">
            INFERNO
          </span>
          <span className="text-[9px] font-bold text-gov-inksoft uppercase tracking-widest leading-none mt-1">
            VERIFICATION
          </span>
        </div>
      )}
    </div>
  );
};
