// Logo SVG component for Dr. Ilham Boughaza
import React from 'react';
import { useTranslation } from 'react-i18next';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 36, md: 44, lg: 52 };

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  className = '',
}) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const iconPixel = sizeMap[size];
  const isLight = variant === 'light';

  const textColor = isLight ? '#FFFFFF' : '#1F2430';
  const subColor = isLight ? 'rgba(255,255,255,0.85)' : '#A61935';

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Feminine Medical Heart & Pulse Emblem matching reference */}
      <div
        className="flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105"
        style={{
          width: iconPixel,
          height: iconPixel,
        }}
        aria-hidden="true"
      >
        <svg
          width={iconPixel * 0.85}
          height={iconPixel * 0.85}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Elegant Heart contour */}
          <path
            d="M16 27.5C16 27.5 4.5 20 4.5 12C4.5 7.8 8 4.5 12.2 4.5C14.7 4.5 15.6 5.8 16 6C16.4 5.8 17.3 4.5 19.8 4.5C24 4.5 27.5 7.8 27.5 12C27.5 20 16 27.5 16 27.5Z"
            stroke={isLight ? '#FFFFFF' : '#A61935'}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isLight ? 'rgba(255,255,255,0.08)' : 'rgba(166, 25, 53, 0.05)'}
          />
          {/* Medical Pulse rhythm line */}
          <path
            d="M8.5 15.5H12L14 11L16.5 20L18.5 13L20 15.5H23.5"
            stroke={isLight ? '#FFFFFF' : '#A61935'}
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Typography matching reference */}
      <div className="flex flex-col leading-tight">
        <span
          className="font-serif font-bold tracking-tight"
          style={{
            color: textColor,
            fontSize: size === 'sm' ? '0.9rem' : size === 'md' ? 'clamp(0.92rem, 3.8vw, 1.08rem)' : '1.25rem',
          }}
        >
          {isAr ? 'د. إلهام بوغازة' : 'Dr. Ilham Boughaza'}
        </span>
        <span
          className="font-serif italic font-medium tracking-normal"
          style={{
            color: subColor,
            fontSize: size === 'sm' ? '0.68rem' : size === 'md' ? 'clamp(0.68rem, 2.7vw, 0.78rem)' : '0.86rem',
          }}
        >
          {isAr ? 'طبيبة أمراض النساء والتوليد' : 'Gynécologue Obstétricienne'}
        </span>
      </div>
    </div>
  );
};

export default Logo;
