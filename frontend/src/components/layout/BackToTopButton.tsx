import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { siteConfig } from '@/config/site';

export const BackToTopButton: React.FC = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 350px
      setIsVisible(window.scrollY > 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const hasWhatsApp = Boolean(siteConfig.whatsapp);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={isAr ? 'العودة إلى أعلى الصفحة' : 'Retour en haut de page'}
      className={[
        'fixed right-5 sm:right-6 rtl:right-auto rtl:left-5 rtl:sm:left-6 z-40',
        hasWhatsApp ? 'bottom-22 sm:bottom-24' : 'bottom-6 sm:bottom-8',
        'w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
        'bg-[#9B2335] hover:bg-[#7F1726] active:bg-[#68121E]',
        'text-white border border-[#FCEBEF]/40',
        'shadow-[0_4px_18px_rgba(155,35,53,0.32)] hover:shadow-[0_6px_24px_rgba(155,35,53,0.45)]',
        'transition-all duration-300 ease-out cursor-pointer group',
        isVisible
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-75 translate-y-4 pointer-events-none',
      ].join(' ')}
    >
      {/* Upward Arrow Icon */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transform group-hover:-translate-y-0.5 transition-transform duration-200"
        aria-hidden="true"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>

      {/* Subtle outer pulse aura on hover */}
      <span
        className="absolute inset-0 rounded-full border border-[#F5CAD6] opacity-0 group-hover:opacity-100 group-hover:scale-115 transition-all duration-300 pointer-events-none"
        aria-hidden="true"
      />
    </button>
  );
};

export default BackToTopButton;
