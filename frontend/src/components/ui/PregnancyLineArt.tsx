import React from 'react';
import { FloatingHeart } from '@/components/ui/BotanicalOrnaments';

interface PregnancyLineArtProps {
  className?: string;
}

/* ─── Delicate Botanical Branch with fine leaves and blossom accents ─── */
const EditorialBotanicalBranch: React.FC<{ flip?: boolean; className?: string; opacity?: number }> = ({
  flip = false,
  className = '',
  opacity = 0.85,
}) => (
  <svg
    viewBox="0 0 200 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
    style={{ transform: flip ? 'scaleX(-1)' : undefined, opacity }}
    aria-hidden="true"
  >
    {/* Main graceful arching stem */}
    <path
      d="M30 300 C50 230 85 160 145 40"
      stroke="#C86A82"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Secondary delicate twigs */}
    <path
      d="M80 190 C60 165 38 172 26 190"
      stroke="#D98298"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      d="M108 135 C128 115 156 122 165 142"
      stroke="#D98298"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      d="M128 85 C145 68 170 74 178 92"
      stroke="#D98298"
      strokeWidth="1.2"
      strokeLinecap="round"
    />

    {/* Leaves with soft two-tone pink shading */}
    {/* Top leaf */}
    <path
      d="M145 40 C158 25 182 32 178 50 C165 57 148 48 145 40 Z"
      fill="#F29BB2"
      stroke="#C86A82"
      strokeWidth="0.9"
    />
    {/* Upper right leaf */}
    <path
      d="M178 92 C194 85 204 100 196 114 C182 116 172 104 178 92 Z"
      fill="#F7B5C6"
      stroke="#D98298"
      strokeWidth="0.8"
    />
    {/* Upper left leaf */}
    <path
      d="M125 90 C108 76 96 92 106 106 C118 110 126 99 125 90 Z"
      fill="#F29BB2"
      stroke="#C86A82"
      strokeWidth="0.8"
    />
    {/* Middle right leaf */}
    <path
      d="M165 142 C182 136 192 152 184 165 C170 167 160 155 165 142 Z"
      fill="#F7B5C6"
      stroke="#D98298"
      strokeWidth="0.8"
    />
    {/* Middle left twig leaf */}
    <path
      d="M26 190 C10 180 2 196 12 210 C24 212 30 200 26 190 Z"
      fill="#F7B5C6"
      stroke="#D98298"
      strokeWidth="0.8"
    />
    <path
      d="M80 190 C62 178 52 194 62 206 C74 208 81 198 80 190 Z"
      fill="#F29BB2"
      stroke="#C86A82"
      strokeWidth="0.8"
    />
    {/* Lower leaf */}
    <path
      d="M58 238 C40 228 32 244 42 256 C54 258 60 248 58 238 Z"
      fill="#F7B5C6"
      stroke="#D98298"
      strokeWidth="0.8"
    />

    {/* Delicate 5-petal blossoms */}
    <g transform="translate(142,38)">
      <circle cx="0" cy="-6.5" r="4" fill="#FDE2EB" stroke="#D98298" strokeWidth="0.7" />
      <circle cx="6.2" cy="-2" r="4" fill="#FDE2EB" stroke="#D98298" strokeWidth="0.7" />
      <circle cx="3.8" cy="5.2" r="4" fill="#FDE2EB" stroke="#D98298" strokeWidth="0.7" />
      <circle cx="-3.8" cy="5.2" r="4" fill="#FDE2EB" stroke="#D98298" strokeWidth="0.7" />
      <circle cx="-6.2" cy="-2" r="4" fill="#FDE2EB" stroke="#D98298" strokeWidth="0.7" />
      <circle cx="0" cy="0" r="2.8" fill="#F5A0B8" />
    </g>
    <g transform="translate(105,134)">
      <circle cx="0" cy="-5" r="3.2" fill="#FDE2EB" stroke="#D98298" strokeWidth="0.6" />
      <circle cx="4.8" cy="-1.5" r="3.2" fill="#FDE2EB" stroke="#D98298" strokeWidth="0.6" />
      <circle cx="3" cy="4" r="3.2" fill="#FDE2EB" stroke="#D98298" strokeWidth="0.6" />
      <circle cx="-3" cy="4" r="3.2" fill="#FDE2EB" stroke="#D98298" strokeWidth="0.6" />
      <circle cx="-4.8" cy="-1.5" r="3.2" fill="#FDE2EB" stroke="#D98298" strokeWidth="0.6" />
      <circle cx="0" cy="0" r="2.2" fill="#F5A0B8" />
    </g>
  </svg>
);

export const PregnancyLineArt: React.FC<PregnancyLineArtProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full flex items-center justify-center select-none overflow-visible min-h-[340px] xs:min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] ${className}`}
    >
      {/* ════════════════════════════════════════════════════════════
          LAYER 0 — Organic Flowing Shape Backdrop (matching reference)
          Curved organic silhouette cradling the woman with soft gradients
          ════════════════════════════════════════════════════════════ */}
      <svg
        viewBox="0 0 540 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        preserveAspectRatio="xMidYMid meet"
        style={{ zIndex: 1, filter: 'drop-shadow(0 14px 35px rgba(235, 140, 165, 0.18))' }}
        aria-hidden="true"
      >
        <defs>
          {/* Main organic shape gradient — soft blush pink to light peach/cream */}
          <linearGradient id="heroOrganicGrad1" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#FDE6ED" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#F9CBD7" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#FCE0E9" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFF2F6" stopOpacity="0.9" />
          </linearGradient>

          {/* Secondary nested organic shape gradient for depth */}
          <linearGradient id="heroOrganicGrad2" x1="30%" y1="20%" x2="90%" y2="85%">
            <stop offset="0%" stopColor="#FCEEF2" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#FAD3DE" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FDE9F0" stopOpacity="0.85" />
          </linearGradient>

          {/* Soft inner contour stroke */}
          <linearGradient id="heroStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5B3C4" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#ECC0CD" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#F8D3DF" stopOpacity="0.5" />
          </linearGradient>

          {/* Soft watercolor radial glow filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer ambient blur shadow shape */}
        <path
          d="M260,35 C380,20 480,90 495,210 C510,330 460,450 350,520 C240,590 130,550 75,450 C20,350 35,210 110,110 C160,40 210,40 260,35 Z"
          fill="#FBC8D6"
          opacity="0.3"
          filter="url(#softGlow)"
        />

        {/* Primary organic curved backdrop — elegant asymmetrical pebble/cloud shape */}
        <path
          d="M260,40 C375,25 470,95 485,215 C500,335 450,445 345,510 C240,575 140,540 85,445 C30,350 45,215 118,115 C165,45 210,45 260,40 Z"
          fill="url(#heroOrganicGrad1)"
          stroke="url(#heroStrokeGrad)"
          strokeWidth="1.5"
        />

        {/* Inner layered organic curve for editorial depth */}
        <path
          d="M275,70 C365,58 435,115 448,210 C460,305 420,395 335,450 C250,505 170,475 125,400 C80,325 95,215 155,135 C195,80 230,75 275,70 Z"
          fill="url(#heroOrganicGrad2)"
        />

        {/* Subtle decorative curved accent lines behind the woman */}
        <path
          d="M170,90 C250,45 380,60 430,150"
          stroke="#E896AB"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M440,280 C470,360 410,450 310,480"
          stroke="#E896AB"
          strokeWidth="1.2"
          strokeDasharray="3 5"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>

      {/* ════════════════════════════════════════════════════════════
          LAYER 1 — Soft Watercolor-inspired Blush Blooms
          ════════════════════════════════════════════════════════════ */}
      <div
        className="absolute -top-6 -right-6 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(249, 189, 206, 0.45) 0%, rgba(253, 232, 239, 0.1) 70%, transparent 100%)',
          zIndex: 0,
        }}
      />
      <div
        className="absolute bottom-6 -left-8 w-60 h-48 rounded-full blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(247, 180, 200, 0.35) 0%, rgba(254, 240, 245, 0.1) 70%, transparent 100%)',
          zIndex: 0,
        }}
      />

      {/* ════════════════════════════════════════════════════════════
          LAYER 2 — Delicate Botanical Branches Framing Behind Woman
          Curving alongside her back and hair (matching reference)
          ════════════════════════════════════════════════════════════ */}
      {/* Main arching branch framing behind her back & hair */}
      <div
        className="absolute -top-8 right-2 sm:right-6 w-40 sm:w-48 lg:w-56 opacity-90 pointer-events-none"
        style={{ zIndex: 3 }}
      >
        <EditorialBotanicalBranch flip={true} opacity={0.9} />
      </div>

      {/* Lower right branch accent */}
      <div
        className="absolute bottom-4 right-0 sm:right-4 w-32 sm:w-36 opacity-75 pointer-events-none"
        style={{ zIndex: 3, transform: 'rotate(-45deg)' }}
      >
        <EditorialBotanicalBranch flip={false} opacity={0.7} />
      </div>

      {/* ════════════════════════════════════════════════════════════
          LAYER 3 — Floating Editorial Hearts (matching reference)
          Iconic burgundy outline heart floating near woman's head
          ════════════════════════════════════════════════════════════ */}
      {/* Primary elegant outline heart near head — reference signature */}
      <div
        className="absolute top-10 right-8 sm:right-14 animate-float-slow pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <FloatingHeart size={34} color="#9B2335" />
      </div>

      {/* Subtle small floating heart lower right */}
      <div
        className="absolute top-1/2 -right-2 sm:right-2 animate-float-reverse pointer-events-none"
        style={{ zIndex: 20, animationDelay: '1.5s' }}
      >
        <FloatingHeart size={18} color="#C4586E" />
      </div>

      {/* Delicate tiny floating heart near lower back */}
      <div
        className="absolute bottom-24 right-12 animate-float-slow pointer-events-none"
        style={{ zIndex: 20, animationDelay: '2.8s' }}
      >
        <FloatingHeart size={14} color="#D98298" />
      </div>

      {/* ════════════════════════════════════════════════════════════
          LAYER 4 — APPROVED PREGNANT WOMAN ILLUSTRATION (UNTOUCHED)
          Exact asset hero-pregnancy-editorial.png, crisp & elevated
          ════════════════════════════════════════════════════════════ */}
      <div
        className="relative flex items-center justify-center overflow-visible w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[400px] lg:max-w-[460px]"
        style={{ zIndex: 10 }}
      >
        <img
          src="/images/hero-pregnancy-editorial.png"
          alt="Illustration éditoriale fine-line d'une femme enceinte"
          className="w-full h-auto object-contain drop-shadow-[0_12px_30px_rgba(155,35,53,0.10)] transition-transform duration-700 hover:scale-[1.02]"
          loading="eager"
          style={{ maxHeight: 'min(500px, 75vw)' }}
        />
      </div>

      {/* Subtle base blend glow */}
      <div
        className="absolute -bottom-2 left-10 right-10 h-10 rounded-full blur-md pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(247, 202, 214, 0.7) 0%, transparent 80%)',
          zIndex: 12,
        }}
      />
    </div>
  );
};
