import React from 'react';

interface PatientAvatarProps {
  name: string;
  className?: string;
  index?: number;
}

export const PatientAvatar: React.FC<PatientAvatarProps> = ({ name, className = '', index = 0 }) => {
  // Pastel tones for avatars
  const palettes = [
    { bg: '#FCEBEF', hair: '#4A2A33', skin: '#FAD8C8', acc: '#9B2335' },
    { bg: '#FFF0F4', hair: '#3D282E', skin: '#F8CEBE', acc: '#8E1B32' },
    { bg: '#FDF1F5', hair: '#5C3843', skin: '#FCE1D5', acc: '#B4475E' },
  ];

  const p = palettes[index % palettes.length];

  return (
    <div
      className={`relative rounded-full overflow-hidden border-2 border-[#F8D8E2] shrink-0 shadow-xs flex items-center justify-center select-none ${className}`}
      style={{ backgroundColor: p.bg }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft background aura */}
        <circle cx="40" cy="40" r="40" fill={p.bg} />

        {/* Shoulders & Clothing */}
        <path
          d="M12 78 C12 62 24 55 40 55 C56 55 68 62 68 78 Z"
          fill={p.acc}
          opacity="0.85"
        />
        {/* Delicate neckline */}
        <path
          d="M32 55 C32 62 48 62 48 55"
          fill={p.skin}
        />

        {/* Neck */}
        <rect x="34" y="42" width="12" height="15" rx="3" fill={p.skin} />

        {/* Head / Face */}
        <ellipse cx="40" cy="35" rx="16" ry="19" fill={p.skin} />

        {/* Hair - Back */}
        <path
          d="M20 38 C18 20 28 12 40 12 C52 12 62 20 60 38 C58 48 56 54 54 58 C52 52 50 48 48 48 C44 48 42 50 40 50 C38 50 36 48 32 48 C30 48 28 52 26 58 C24 54 22 48 20 38 Z"
          fill={p.hair}
        />

        {/* Hair - Front Bangs */}
        <path
          d="M24 30 C28 18 36 18 40 22 C44 18 52 18 56 30 C52 24 46 22 40 25 C34 22 28 24 24 30 Z"
          fill={p.hair}
        />

        {/* Gentle smiling facial features */}
        {/* Eyes */}
        <path d="M31 33 Q34 31 37 33" stroke={p.hair} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M43 33 Q46 31 49 33" stroke={p.hair} strokeWidth="1.5" strokeLinecap="round" />

        {/* Subtle blush */}
        <circle cx="31" cy="38" r="2.5" fill="#F8A5B8" opacity="0.6" />
        <circle cx="49" cy="38" r="2.5" fill="#F8A5B8" opacity="0.6" />

        {/* Gentle smile */}
        <path d="M36 42 Q40 46 44 42" stroke={p.hair} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
};
