import React from 'react';

interface MonogramProps {
  className?: string;
  size?: number;
  variant?: 'gold' | 'terracotta' | 'dark' | 'wax' | 'pinkCoral';
  showText?: boolean;
}

export const Monogram: React.FC<MonogramProps> = ({
  className = '',
  size = 56,
  variant = 'pinkCoral',
  showText = true,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'wax':
        return {
          stroke: '#FFF9F2',
          fill: '#FFF9F2',
          bg: '#E85607',
          accent: '#FFD99E',
        };
      case 'terracotta':
        return {
          stroke: '#C80064',
          fill: '#C80064',
          bg: '#FCFBF9',
          accent: '#FA6800',
        };
      case 'dark':
        return {
          stroke: '#3D2C24',
          fill: '#3D2C24',
          bg: 'transparent',
          accent: '#EC008C',
        };
      case 'pinkCoral':
        return {
          stroke: '#B8005C',
          fill: '#B8005C',
          bg: 'transparent',
          accent: '#FA6800',
        };
      case 'gold':
      default:
        return {
          stroke: '#B8005C',
          fill: '#B8005C',
          bg: 'transparent',
          accent: '#F59306',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Decorative circle if wax variant */}
        {variant === 'wax' && (
          <circle cx="50" cy="50" r="47" fill={colors.bg} stroke={colors.accent} strokeWidth="1.5" strokeDasharray="3 2" />
        )}

        {/* Horseshoe Frame */}
        <path
          d="M32 25 C30 58, 40 76, 50 76 C60 76, 70 58, 68 25 C68 21, 62 21, 62 25 C64 52, 57 68, 50 68 C43 68, 36 52, 38 25 C38 21, 32 21, 32 25 Z"
          fill={colors.fill}
          opacity={variant === 'wax' ? 0.95 : 0.88}
        />

        {/* Nail holes on horseshoe */}
        <circle cx="35" cy="38" r="1.5" fill={variant === 'wax' ? '#9C2504' : '#F4F1EF'} />
        <circle cx="36" cy="48" r="1.5" fill={variant === 'wax' ? '#9C2504' : '#F4F1EF'} />
        <circle cx="41" cy="60" r="1.5" fill={variant === 'wax' ? '#9C2504' : '#F4F1EF'} />

        <circle cx="65" cy="38" r="1.5" fill={variant === 'wax' ? '#9C2504' : '#F4F1EF'} />
        <circle cx="64" cy="48" r="1.5" fill={variant === 'wax' ? '#9C2504' : '#F4F1EF'} />
        <circle cx="59" cy="60" r="1.5" fill={variant === 'wax' ? '#9C2504' : '#F4F1EF'} />

        {/* Left Wheat Stalk */}
        <g stroke={colors.accent} strokeWidth="1.3" strokeLinecap="round">
          <path d="M26 68 C22 55, 22 40, 27 28" />
          <ellipse cx="23" cy="40" rx="3" ry="1.5" transform="rotate(-30 23 40)" fill={colors.accent} opacity="0.85" />
          <ellipse cx="22" cy="48" rx="3" ry="1.5" transform="rotate(-40 22 48)" fill={colors.accent} opacity="0.85" />
          <ellipse cx="24" cy="56" rx="3" ry="1.5" transform="rotate(-30 24 56)" fill={colors.accent} opacity="0.85" />
          <ellipse cx="26" cy="34" rx="2.5" ry="1.2" transform="rotate(-20 26 34)" fill={colors.accent} opacity="0.85" />
        </g>

        {/* Right Wheat Stalk */}
        <g stroke={colors.accent} strokeWidth="1.3" strokeLinecap="round">
          <path d="M74 68 C78 55, 78 40, 73 28" />
          <ellipse cx="77" cy="40" rx="3" ry="1.5" transform="rotate(30 77 40)" fill={colors.accent} opacity="0.85" />
          <ellipse cx="78" cy="48" rx="3" ry="1.5" transform="rotate(40 78 48)" fill={colors.accent} opacity="0.85" />
          <ellipse cx="76" cy="56" rx="3" ry="1.5" transform="rotate(30 76 56)" fill={colors.accent} opacity="0.85" />
          <ellipse cx="74" cy="34" rx="2.5" ry="1.2" transform="rotate(20 74 34)" fill={colors.accent} opacity="0.85" />
        </g>

        {/* Center Letters: N & M */}
        {showText && (
          <text
            x="50"
            y="52"
            textAnchor="middle"
            fontFamily="Playfair Display, Georgia, serif"
            fontSize="17"
            fontWeight="bold"
            letterSpacing="0.05em"
            fill={colors.fill}
          >
            N &amp; M
          </text>
        )}
      </svg>
    </div>
  );
};
