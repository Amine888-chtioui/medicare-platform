import React from 'react';
import { useTranslation } from 'react-i18next';
import { PregnancyLineArt } from '@/components/ui/PregnancyLineArt';

export const HeroSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const scrollToAppointment = (e: React.MouseEvent) => {
    e.preventDefault();
    const elem = document.getElementById('formulaire-rdv') || document.getElementById('contact');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const elem = document.getElementById('contact');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-x-hidden bg-gradient-to-b from-[#FFF5F7] via-[#FDF0F3] to-[#FCEEF3] pt-6 pb-0 sm:pt-10 md:pt-14">
      {/* ── Soft Ambient Blush Gradients & Watercolor Auras ── */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-gradient-to-tr from-[#FCE5ED]/50 to-[#FFF0F4]/30 rounded-full blur-3xl pointer-events-none select-none" />
      <div className="absolute top-6 right-0 w-96 h-96 bg-gradient-to-bl from-[#FCDFE8]/40 to-[#FDF4F6]/20 rounded-full blur-3xl pointer-events-none select-none" />
      <div className="absolute bottom-12 left-1/3 w-80 h-80 bg-[#FFF0F4]/70 rounded-full blur-2xl pointer-events-none select-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Headline, Description & CTAs (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-center text-center sm:items-start sm:text-left rtl:sm:items-start rtl:sm:text-right space-y-4 sm:space-y-6 animate-hero-text">
            {/* Pill Badge: ♥ Santé féminine */}
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#FCEBEF] border border-[#F5D6DF] shadow-2xs transition-transform hover:scale-105 duration-200">
              <span className="text-[#9B2335] text-xs animate-pulse">♥</span>
              <span className="text-xs font-semibold text-[#9B2335] tracking-wide">
                {isAr ? 'صحة المرأة' : 'Santé féminine'}
              </span>
            </div>

            {/* Editorial Serif Headline matching reference */}
            <h1 className="font-serif text-[1.85rem] xs:text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-normal text-[#24181B] leading-[1.22] sm:leading-[1.18] tracking-tight">
              {isAr ? (
                <>
                  اعتني بصحتكِ،
                  <span className="block font-serif italic text-[#9B2335] font-medium mt-1">
                    في كل مرحلة من حياتكِ
                  </span>
                </>
              ) : (
                <>
                  Prenez soin de vous,
                  <span className="block mt-1">
                    à chaque étape de{' '}
                    <span className="font-serif italic text-[#9B2335] font-medium">votre vie</span>
                  </span>
                </>
              )}
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-base lg:text-lg text-[#6B5C62] font-normal leading-relaxed max-w-lg">
              {isAr
                ? 'مرافقة حانية ومخصصة لصحتكِ النسائية في كل خطوة.'
                : 'Un accompagnement bienveillant et personnalisé pour votre santé gynécologique.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
              {/* Primary Appointment Button */}
              <a
                href="#formulaire-rdv"
                onClick={scrollToAppointment}
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-full bg-[#9B2335] hover:bg-[#7A1B29] text-white font-medium text-sm sm:text-base shadow-[0_4px_16px_rgba(155,35,53,0.25)] hover:shadow-[0_8px_24px_rgba(155,35,53,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-200 cursor-pointer min-h-[48px]"
              >
                <span>{isAr ? 'حجز موعد' : 'Prendre rendez-vous'}</span>
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  className={isAr ? 'rotate-180' : ''}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              {/* Secondary Contact Button */}
              <a
                href="#contact"
                onClick={scrollToContact}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-white border border-[#E8CCD5] hover:border-[#9B2335] text-[#24181B] hover:text-[#9B2335] hover:bg-[#FFF5F8] text-sm sm:text-base font-medium shadow-2xs hover:shadow-xs active:scale-98 transition-all duration-200 cursor-pointer min-h-[48px]"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="text-[#9B2335]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>{isAr ? 'تواصلي معنا' : 'Nous contacter'}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Premium Editorial Maternity Illustration (6 cols) */}
          <div className="lg:col-span-6 relative flex justify-center items-center mt-6 lg:mt-0 animate-hero-illustration">
            <div className="relative w-full max-w-lg lg:max-w-2xl flex flex-col items-center">
              <PregnancyLineArt />
            </div>
          </div>
        </div>
      </div>

      {/* ── Subtle Flowing Wave Divider Connecting Hero & Services ── */}
      <div className="w-full overflow-hidden leading-none pointer-events-none select-none mt-4 sm:mt-6">
        <svg
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          className="relative block w-full h-10 sm:h-14 lg:h-16 text-white fill-current"
          aria-hidden="true"
        >
          <path d="M0,24 C360,56 720,8 1080,44 C1260,62 1380,28 1440,36 L1440,64 L0,64 Z" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
