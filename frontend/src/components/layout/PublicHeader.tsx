import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/ui/Logo';
import { useScrollLock } from '@/hooks/useScrollLock';

/* ─── Delicate Botanical Branch nested in the rounded ends of the navbar pill ─── */
const NavbarEndBranch: React.FC<{ flip?: boolean; className?: string }> = ({
  flip = false,
  className = '',
}) => (
  <svg
    viewBox="0 0 110 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    aria-hidden="true"
  >
    {/* Arching stem */}
    <path
      d="M5 85 C25 60 55 35 95 10"
      stroke="#D6758E"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Leaves */}
    <path
      d="M95 10 C104 4 112 11 106 20 C96 23 90 16 95 10 Z"
      fill="#F4A2B8"
      stroke="#D6758E"
      strokeWidth="0.8"
    />
    <path
      d="M80 28 C94 22 102 32 95 42 C84 44 76 36 80 28 Z"
      fill="#F9C5D4"
      stroke="#E28EA3"
      strokeWidth="0.8"
    />
    <path
      d="M62 46 C48 36 40 48 48 58 C58 60 64 52 62 46 Z"
      fill="#F4A2B8"
      stroke="#D6758E"
      strokeWidth="0.8"
    />
    <path
      d="M52 64 C66 60 74 72 66 82 C56 84 48 74 52 64 Z"
      fill="#F9C5D4"
      stroke="#E28EA3"
      strokeWidth="0.8"
    />
    <path
      d="M32 76 C18 68 12 80 20 88 C30 90 34 82 32 76 Z"
      fill="#F4A2B8"
      stroke="#D6758E"
      strokeWidth="0.8"
    />
  </svg>
);

export const PublicHeader: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const isAr = i18n.language === 'ar';

  useScrollLock(menuOpen);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      // Keep navbar visible if mobile drawer is currently open
      if (menuOpen) {
        setIsVisible(true);
        lastScrollY = currentScrollY;
        return;
      }

      // Always visible near top of page
      if (currentScrollY < 60) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 6) {
        // Scrolling down -> hide smoothly
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY && lastScrollY - currentScrollY > 6) {
        // Scrolling up -> reveal smoothly
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  // Active section scroll-spy using IntersectionObserver
  useEffect(() => {
    if (location.pathname !== '/') return;

    const sectionIds = ['services', 'about', 'expertise', 'contact'];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
        if (window.scrollY < 300) {
          setActiveSection('home');
        }
      },
      {
        root: null,
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));

    const checkTop = () => {
      if (window.scrollY < 300) {
        setActiveSection('home');
      }
    };
    window.addEventListener('scroll', checkTop, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', checkTop);
    };
  }, [location.pathname]);

  const navLinks = [
    { id: 'home', label: t('nav.home'), href: '/' },
    { id: 'about', label: t('nav.about'), href: '/#about' },
    { id: 'services', label: t('nav.services'), href: '/#services' },
    { id: 'contact', label: t('nav.contact'), href: '/#contact' },
  ];

  const toggleLang = () => {
    i18n.changeLanguage(isAr ? 'fr' : 'ar');
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, href: string) => {
    setMenuOpen(false);
    setActiveSection(id);
    if (href.includes('#') && location.pathname === '/') {
      const targetId = href.split('#')[1];
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${targetId}`);
      }
    } else if (href === '/' && location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
    }
  };

  const scrollToAppointment = (e: React.MouseEvent) => {
    setMenuOpen(false);
    if (location.pathname === '/') {
      const elem = document.getElementById('formulaire-rdv') || document.getElementById('contact');
      if (elem) {
        e.preventDefault();
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={[
        'fixed top-2.5 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-500 ease-out',
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-24 sm:-translate-y-28 opacity-0 pointer-events-none',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto pointer-events-auto">
        {/* Floating Island Capsule matching reference */}
        <div
          className={[
            'relative flex items-center justify-between rounded-full bg-white/95 backdrop-blur-md border border-[#F6DCE4] px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all duration-300 overflow-hidden',
            scrolled
              ? 'shadow-[0_10px_35px_rgba(155,35,53,0.12)] border-[#F5CAD6]'
              : 'shadow-[0_8px_30px_rgba(155,35,53,0.06)]',
          ].join(' ')}
        >
          {/* Botanical Branch nestled in the Left rounded end (matching reference, desktop only) */}
          <NavbarEndBranch className="hidden sm:block absolute -left-1 -bottom-2 w-16 sm:w-20 opacity-85 z-0" />

          {/* Botanical Branch nestled in the Right rounded end (matching reference, desktop only) */}
          <NavbarEndBranch flip className="hidden sm:block absolute -right-1 -bottom-2 w-16 sm:w-20 opacity-85 z-0" />

          {/* Doctor Logo & Branding */}
          <Link
            to="/"
            onClick={() => {
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="relative z-10 flex items-center pl-1 sm:pl-3"
          >
            <Logo size="md" />
          </Link>

          {/* Center Navigation Links - Desktop Reference */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 relative z-10">
            {navLinks.map((link) => {
              const active = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.id, link.href)}
                  className={[
                    'px-4 py-1.5 text-sm rounded-full transition-all duration-200',
                    active
                      ? 'bg-[#FCEBEF] text-[#9B2335] font-semibold shadow-2xs'
                      : 'text-[#2B2428] hover:text-[#9B2335] hover:bg-[#FCEBEF]/50 font-medium',
                  ].join(' ')}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Controls - Language & CTA */}
          <div className="hidden md:flex items-center gap-3 relative z-10 pr-2 sm:pr-3">
            {/* Circular Language Selector */}
            <button
              type="button"
              onClick={toggleLang}
              aria-label={isAr ? 'Passer en français' : 'التبديل إلى العربية'}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-[#E9C8D2] hover:border-[#9B2335] text-xs font-bold text-[#9B2335] bg-white hover:bg-[#FFF5F8] transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
            >
              {isAr ? 'FR' : 'AR'}
            </button>

            {/* Appointment CTA Button */}
            <a
              href="/#formulaire-rdv"
              onClick={scrollToAppointment}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#9B2335] hover:bg-[#7F1726] active:scale-98 text-white text-sm font-medium shadow-[0_4px_16px_rgba(155,35,53,0.28)] hover:shadow-[0_6px_22px_rgba(155,35,53,0.38)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{t('nav.appointment')}</span>
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className={isAr ? 'rotate-180' : ''}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

          {/* Mobile Right Controls: Language Switch + Burger */}
          <div className="flex md:hidden items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={toggleLang}
              aria-label={isAr ? 'Passer en français' : 'التبديل إلى العربية'}
              className="text-xs font-bold text-[#9B2335] bg-white border border-[#E9C8D2] px-3 py-1.5 rounded-full active:scale-95 transition-transform shadow-2xs"
            >
              {isAr ? 'FR' : 'AR'}
            </button>

            <button
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#24181B] bg-[#FFF0F4] border border-[#F5D6DF] hover:bg-[#FCEBEF] active:scale-95 transition-all"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Card with Backdrop */}
        {menuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black/25 backdrop-blur-xs z-30 transition-opacity overscroll-contain"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="md:hidden relative z-40 mt-2 bg-white/98 backdrop-blur-lg border border-[#F5CAD6] rounded-3xl p-5 flex flex-col gap-2 shadow-[0_12px_36px_rgba(155,35,53,0.15)] animate-in fade-in slide-in-from-top-2 duration-200 overscroll-contain">
              {navLinks.map((link) => {
                const active = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.id, link.href)}
                    className={`px-4 py-3 text-base font-medium rounded-2xl transition-colors flex items-center justify-between min-h-[48px] ${
                      active
                        ? 'text-[#9B2335] bg-[#FCEBEF] font-semibold'
                        : 'text-[#24181B] hover:bg-[#FCEBEF]/50 active:bg-[#FCEBEF]'
                    }`}
                  >
                    <span>{link.label}</span>
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="text-[#9B8B92] rtl:rotate-180"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                );
              })}

              <div className="pt-3 mt-1 border-t border-[#F5D6DF] flex flex-col gap-2.5">
                {/* Direct Phone Call Button */}
                <a
                  href="tel:+212612345678"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-5 rounded-full bg-[#FFF0F4] hover:bg-[#FCEBEF] border border-[#F5CAD6] text-[#9B2335] text-sm font-semibold transition-all min-h-[48px]"
                >
                  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>{isAr ? 'الاتصال بالعيادة' : 'Appeler le cabinet'}</span>
                </a>

                {/* Appointment Booking Button */}
                <a
                  href="/#formulaire-rdv"
                  onClick={scrollToAppointment}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#9B2335] hover:bg-[#7A1B29] text-white text-sm font-semibold shadow-md active:scale-98 transition-all min-h-[48px]"
                >
                  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{t('nav.appointment')}</span>
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    className={isAr ? 'rotate-180' : ''}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;