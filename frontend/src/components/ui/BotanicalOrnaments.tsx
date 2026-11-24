import React from 'react';

/**
 * Delicate feminine botanical leaf branch facing right or left.
 * Colors: soft pastel pinks (#F7C8D4, #F2A8BC).
 */
export const BotanicalBranch: React.FC<{
  className?: string;
  flip?: boolean;
  opacity?: number;
}> = ({ className = '', flip = false, opacity = 0.85 }) => (
  <svg
    viewBox="0 0 160 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
    style={{
      transform: flip ? 'scaleX(-1)' : undefined,
      opacity,
    }}
    aria-hidden="true"
  >
    {/* Main slender stem */}
    <path
      d="M20 210 C45 160 70 110 115 25"
      stroke="#E896AB"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Delicate leaves branching out */}
    {/* Leaf 1 */}
    <path
      d="M115 25 C125 15 145 22 142 35 C132 40 118 32 115 25 Z"
      fill="#F29BB0"
      stroke="#DE7D95"
      strokeWidth="0.8"
    />
    {/* Leaf 2 */}
    <path
      d="M102 52 C120 45 135 55 130 68 C118 70 106 60 102 52 Z"
      fill="#F7B2C2"
      stroke="#E896AB"
      strokeWidth="0.8"
    />
    {/* Leaf 3 (left side) */}
    <path
      d="M88 78 C70 65 60 80 68 92 C80 95 86 86 88 78 Z"
      fill="#F29BB0"
      stroke="#DE7D95"
      strokeWidth="0.8"
    />
    {/* Leaf 4 */}
    <path
      d="M80 105 C98 100 112 112 106 124 C94 126 84 115 80 105 Z"
      fill="#F7B2C2"
      stroke="#E896AB"
      strokeWidth="0.8"
    />
    {/* Leaf 5 (left side) */}
    <path
      d="M62 130 C45 120 38 135 46 146 C56 148 62 138 62 130 Z"
      fill="#F29BB0"
      stroke="#DE7D95"
      strokeWidth="0.8"
    />
    {/* Leaf 6 */}
    <path
      d="M52 158 C68 155 78 168 72 178 C62 180 54 170 52 158 Z"
      fill="#F7B2C2"
      stroke="#E896AB"
      strokeWidth="0.8"
    />
    {/* Leaf 7 (small bud) */}
    <path
      d="M38 182 C26 175 22 188 28 196 C36 198 39 190 38 182 Z"
      fill="#F29BB0"
      stroke="#DE7D95"
      strokeWidth="0.8"
    />
  </svg>
);

/**
 * Centered delicate line with heart icon: ─── ♡ ───
 */
export const HeartDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
    <span className="w-12 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-[#EAA1B2]" />
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9B2335"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#9B2335] shrink-0 transform hover:scale-110 transition-transform duration-300"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
    <span className="w-12 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-[#EAA1B2]" />
  </div>
);

/**
 * Floating outline heart icon (♡)
 */
export const FloatingHeart: React.FC<{
  size?: number;
  className?: string;
  color?: string;
}> = ({ size = 24, className = '', color = '#9B2335' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);
