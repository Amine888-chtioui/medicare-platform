import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { siteConfig } from '@/config/site';

interface StylizedClinicMapProps {
  className?: string;
}

export const StylizedClinicMap: React.FC<StylizedClinicMapProps> = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [isHovered, setIsHovered] = useState(false);

  const clinicName = siteConfig.clinicName || (isAr ? 'عيادة د. إلهام بوغازة' : 'Clinique Dr. Ilham Boughaza');
  const address = siteConfig.address || (isAr ? '123 شارع الحسن الثاني، تارودانت' : '123 Avenue Hassan II, Taroudant');
  const mapLink = siteConfig.mapLinkUrl || 'https://maps.google.com/?q=Taroudant+Morocco';

  return (
    <div
      className={`relative w-full aspect-[16/9.8] rounded-[2rem] overflow-hidden border-2 border-[#F6D7DF] bg-[#FDF5F7] shadow-sm group select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── PURE VECTOR STYLIZED MAP OF TAROUDANT ── */}
      <svg
        viewBox="0 0 640 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
        aria-label={`Plan stylisé de localisation - ${clinicName}`}
      >
        {/* Background land */}
        <rect width="640" height="380" fill="#FBF3F5" />

        {/* Soft pastel park / garden zones */}
        <path
          d="M30 40 Q80 20 140 50 Q180 80 160 140 Q130 180 70 160 Q20 140 30 40 Z"
          fill="#F5E6EB"
          opacity="0.8"
        />
        <path
          d="M480 240 Q540 220 610 250 Q630 310 590 350 Q520 370 470 330 Q450 280 480 240 Z"
          fill="#F5E6EB"
          opacity="0.75"
        />
        <path
          d="M460 30 Q520 10 590 40 Q570 100 520 110 Q460 90 460 30 Z"
          fill="#F2DFE6"
          opacity="0.6"
        />

        {/* Secondary Street Grid (soft white and delicate rose lines) */}
        <g stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
          {/* Horizontal / diagonal streets */}
          <path d="M0 80 L640 120" />
          <path d="M0 190 L640 170" />
          <path d="M0 290 L640 310" />
          <path d="M0 360 L400 370" />
          {/* Cross streets */}
          <path d="M80 0 L110 380" />
          <path d="M220 0 L180 380" />
          <path d="M340 0 L360 380" />
          <path d="M470 0 L490 380" />
          <path d="M570 0 L580 380" />
        </g>

        {/* Diagonal Arterial Roads */}
        <g stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M50 0 L320 200 L640 240" />
          <path d="M0 240 L320 200 L560 0" />
          <path d="M120 380 L320 200 L440 0" />
          <path d="M640 100 L320 200 L180 380" />
        </g>

        {/* Major Avenue (Avenue Hassan II) running through the center */}
        <path
          d="M-20 215 C180 195 310 205 660 175"
          stroke="#F8DEE5"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M-20 215 C180 195 310 205 660 175"
          stroke="#FFFFFF"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Street Name Typography (Watermark-style) */}
        <text
          x="120"
          y="200"
          fill="#A88B94"
          fontSize="11"
          fontWeight="500"
          letterSpacing="0.8"
          transform="rotate(-3, 120, 200)"
          fontFamily="system-ui, sans-serif"
        >
          {isAr ? 'شارع الحسن الثاني' : 'Avenue Hassan II'}
        </text>
        <text
          x="390"
          y="180"
          fill="#A88B94"
          fontSize="10"
          fontWeight="500"
          letterSpacing="0.8"
          transform="rotate(-4, 390, 180)"
          fontFamily="system-ui, sans-serif"
        >
          {isAr ? 'تارودانت المركز' : 'Taroudant Centre'}
        </text>
        <text
          x="440"
          y="75"
          fill="#BFA6AF"
          fontSize="9"
          fontWeight="500"
          transform="rotate(40, 440, 75)"
          fontFamily="system-ui, sans-serif"
        >
          {isAr ? 'شارع المنصور الذهبي' : 'Bd. Al Mansour'}
        </text>

        {/* Building Blocks */}
        <g fill="#F3E5EA" opacity="0.85">
          <rect x="230" y="110" width="45" height="35" rx="4" />
          <rect x="230" y="152" width="45" height="25" rx="4" />
          <rect x="285" y="110" width="40" height="32" rx="4" />
          <rect x="350" y="125" width="55" height="35" rx="4" />
          <rect x="350" y="225" width="60" height="40" rx="4" />
          <rect x="245" y="235" width="50" height="35" rx="4" />
          <rect x="150" y="240" width="55" height="30" rx="4" />
        </g>
      </svg>

      {/* ── INTERACTIVE PIN MARKER AT CLINIC LOCATION ── */}
      <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center">
        {/* Pulsing ring aura */}
        <div className="absolute -bottom-2 w-10 h-10 rounded-full bg-[#9B2335]/25 animate-ping pointer-events-none" />

        {/* Pin Badge with Clinic Name */}
        <div className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#F5D6DF] shadow-[0_6px_20px_rgba(155,35,53,0.18)] transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="w-5 h-5 rounded-full bg-[#9B2335] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-[#24181B] whitespace-nowrap">
            {clinicName}
          </span>
        </div>

        {/* Pin Triangle Pointer */}
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white drop-shadow-xs -mt-[1px]" />
        {/* Pin base dot */}
        <div className="w-2.5 h-2.5 rounded-full bg-[#9B2335] border border-white shadow-xs -mt-1" />
      </div>

      {/* Interactive Directions Quick Overlay */}
      <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 flex items-center gap-2">
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#F5D6DF] text-[#9B2335] hover:bg-[#FCEBEF] text-xs font-medium shadow-xs transition-all active:scale-95"
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>{isAr ? 'فتح في خرائط Google' : 'Ouvrir sur Maps'}</span>
        </a>
      </div>
    </div>
  );
};
