import React from 'react';
import { useTranslation } from 'react-i18next';
import { BotanicalBranch } from '@/components/ui/BotanicalOrnaments';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export const AboutSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const portraitRef = useScrollReveal<HTMLDivElement>();
  const contentRef  = useScrollReveal<HTMLDivElement>();

  const scrollToExpertise = (e: React.MouseEvent) => {
    e.preventDefault();
    const elem = document.getElementById('expertise') || document.getElementById('services');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about" className="relative py-12 sm:py-16 md:py-20 bg-[#FFF9FA] overflow-hidden scroll-mt-20">
      {/* Decorative botanical flourishes in background */}
      <div className="absolute top-1/2 -left-6 -translate-y-1/2 w-32 sm:w-44 opacity-50 pointer-events-none select-none">
        <BotanicalBranch flip={false} opacity={0.6} />
      </div>
      <div className="absolute top-6 right-0 w-32 sm:w-44 opacity-50 pointer-events-none select-none">
        <BotanicalBranch flip={true} opacity={0.6} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Large Rounded Master Card from Reference Design */}
        <div className="relative rounded-[1.75rem] sm:rounded-[2.5rem] bg-gradient-to-br from-white via-[#FFF9FA] to-[#FFF0F4] border border-[#F6D7DF] shadow-[0_8px_36px_rgba(155,35,53,0.06)] p-5 sm:p-8 lg:p-12 overflow-hidden">
          {/* Botanical leaf flourish inside the card top right */}
          <div className="absolute -top-4 -right-4 w-28 sm:w-36 opacity-60 pointer-events-none select-none">
            <BotanicalBranch flip={true} opacity={0.5} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Doctor's Portrait in Rounded Arched Frame (5 cols) */}
            <div ref={portraitRef} className="lg:col-span-5 flex justify-center reveal-left">
              <div className="relative w-full max-w-[260px] xs:max-w-[280px] sm:max-w-sm aspect-[4/4.8] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden border-2 border-[#F8D8E2] shadow-md bg-[#FFF5F8] group">
                <img
                  src="/images/doctor-hero.jpg"
                  alt="Cabinet médical — Consultation en gynécologie et obstétrique"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-103"
                  onError={(e) => {
                    e.currentTarget.src = '/images/about-maternity.jpg';
                  }}
                />
                {/* Soft subtle bottom overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#24181B]/15 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Right: Doctor Information & Features (7 cols) */}
            <div ref={contentRef} className="lg:col-span-7 flex flex-col items-start text-left rtl:text-right rtl:items-start space-y-4 sm:space-y-6 reveal-right">
              {/* Pill Badge: À PROPOS DE */}
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FCEBEF] border border-[#F5D6DF] shadow-2xs">
                <span className="text-xs font-semibold text-[#9B2335] uppercase tracking-wider">
                  {isAr ? 'عن الدكتورة' : 'À propos de'}
                </span>
              </div>

              {/* Name & Specialty */}
              <div>
                <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-4xl font-normal text-[#24181B] leading-tight">
                  {isAr ? 'د. إلهام بوغازة' : 'Dr. Ilham Boughaza'}
                </h2>
                <span className="block font-serif italic text-base xs:text-lg sm:text-xl text-[#9B2335] font-medium mt-1">
                  {isAr ? 'طبيبة أمراض النساء والتوليد' : 'Gynécologue Obstétricienne'}
                </span>
              </div>

              {/* Professional Description */}
              <p className="text-sm sm:text-base text-[#6B5C62] leading-relaxed max-w-xl">
                {isAr
                  ? 'متخصصة في أمراض النساء والتوليد، أرافقكِ في كل مرحلة من مراحل حياتكِ، بكل احترافية ورعاية وإصغاء مخلص.'
                  : 'Spécialisée en gynécologie obstétrique, je vous accompagne à chaque étape de votre vie, avec professionnalisme et bienveillance.'}
              </p>

              {/* Two Feature Cards side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 w-full pt-1">
                {/* Feature 1: Écoute & Bienveillance */}
                <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/90 border border-[#F6D7DF] shadow-2xs">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FCEBEF] text-[#9B2335] border border-[#F8D8E2] flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      {/* Ribbon / medal with heart */}
                      <circle cx="12" cy="8.5" r="5.5" />
                      <path d="M8.21 13.89L7 22l5-3 5 3-1.21-8.12" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 6.5l.5 1 1.2.2-.9.8.2 1.2-1-.6-1 .6.2-1.2-.9-.8 1.2-.2z" fill="#9B2335" stroke="none" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#24181B]">
                      {isAr ? 'إنصات ورعاية' : 'Écoute & Bienveillance'}
                    </h3>
                    <p className="text-xs text-[#6B5C62] mt-0.5">
                      {isAr ? 'إطار هادئ وسرية تامة' : 'Un cadre serein et confidentiel'}
                    </p>
                  </div>
                </div>

                {/* Feature 2: Équipement moderne */}
                <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/90 border border-[#F6D7DF] shadow-2xs">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FCEBEF] text-[#9B2335] border border-[#F8D8E2] flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      {/* Shield with checkmark */}
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
                      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#24181B]">
                      {isAr ? 'تجهيزات حديثة' : 'Équipement moderne'}
                    </h3>
                    <p className="text-xs text-[#6B5C62] mt-0.5">
                      {isAr ? 'عيادة بأحدث المعايير' : 'Clinique à la pointe'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Burgundy CTA Button: En savoir plus -> */}
              <div className="pt-2 w-full sm:w-auto">
                <a
                  href="#expertise"
                  onClick={scrollToExpertise}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#9B2335] hover:bg-[#7A1B29] text-white font-medium text-sm shadow-[0_4px_14px_rgba(155,35,53,0.2)] hover:shadow-[0_6px_18px_rgba(155,35,53,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-200 cursor-pointer min-h-[46px]"
                >
                  <span>{isAr ? 'اعرفي المزيد' : 'En savoir plus'}</span>
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;