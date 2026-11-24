import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/ui/Logo';
import { siteConfig } from '@/config/site';

export const PublicFooter: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const navLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.about'), href: '/#about' },
    { label: t('nav.services'), href: '/#services' },
    { label: t('nav.contact'), href: '/#contact' },
  ];

  return (
    <footer className="relative bg-[#721424] text-white overflow-hidden">
      {/* Smooth organic wave top divider */}
      <div className="w-full overflow-hidden leading-none pointer-events-none select-none">
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="relative block w-full h-10 sm:h-16"
          style={{ fill: '#721424' }}
        >
          <path d="M0,80 L0,30 C180,65 360,15 540,42 C720,69 900,18 1080,40 C1260,62 1380,28 1440,38 L1440,80 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10 sm:pb-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 pb-8 border-b border-white/15">
          {/* Left: Doctor's Logo Branding in Light Variant */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left rtl:md:text-right">
            <Link to="/" className="inline-block">
              <Logo variant="light" size="md" />
            </Link>
            {/* Tagline below logo on mobile */}
            <span className="mt-2 text-xs text-white/80 font-serif italic tracking-wide md:hidden">
              {isAr ? 'صحتكِ، أولويتنا ♡' : 'Votre santé, notre priorité ♡'}
            </span>
          </div>

          {/* Center: Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Social Media Icons & Tagline */}
          <div className="flex flex-col items-center md:items-end gap-3">
            {/* Social Icons (Facebook, Instagram, LinkedIn, YouTube) */}
            <div className="flex items-center gap-2.5">
              {/* Facebook */}
              <a
                href={siteConfig.facebookUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/12 hover:bg-white/25 text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href={siteConfig.instagramUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/12 hover:bg-white/25 text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-white/12 hover:bg-white/25 text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="#"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-white/12 hover:bg-white/25 text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>

            {/* Tagline (desktop only) */}
            <span className="hidden md:block text-xs text-white/90 font-serif italic tracking-wide">
              {isAr ? 'صحتكِ، أولويتنا ♡' : 'Votre santé, notre priorité ♡'}
            </span>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Privacy / Admin links */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/55">
          <span>
            {isAr
              ? '© 2026 د. إلهام بوغازة. جميع الحقوق محفوظة.'
              : '© 2026 Dr. Ilham Boughaza. Tous droits réservés.'}
          </span>
          <div className="flex items-center gap-4">
            <Link to="/confidentialite" className="hover:text-white transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/admin/login" className="hover:text-white transition-colors">
              {t('footer.admin')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;