import React from 'react';

interface SidebarMaternityArtProps {
  className?: string;
}

export const SidebarMaternityArt: React.FC<SidebarMaternityArtProps> = ({ className = '' }) => {
  return (
    <div
      className={`pointer-events-none select-none relative flex items-end justify-start ${className}`}
      aria-hidden="true"
    >
      <img
        src="/images/sidebar-maternity.png"
        alt="Illustration maternité"
        className="max-h-[220px] w-auto max-w-full object-contain object-left-bottom drop-shadow-2xs"
        loading="eager"
      />
    </div>
  );
};
