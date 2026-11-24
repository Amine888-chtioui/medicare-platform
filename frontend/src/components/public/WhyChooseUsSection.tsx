import React from 'react';
import { useTranslation } from 'react-i18next';
import { BotanicalBranch, FloatingHeart } from '@/components/ui/BotanicalOrnaments';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export const WhyChooseUsSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const leftRef  = useScrollReveal<HTMLDivElement>();
  const rightRef = useScrollReveal<HTMLDivElement>();

  const reasons = [
    {
      key: 'personalized',
      title: isAr ? 'متابعة مخصصة' : 'Suivi personnalisé',
      description: isAr
        ? 'مرافقة ملائمة لاحتياجاتكِ'
        : 'Un accompagnement adapté à vos besoins',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9B2335" strokeWidth={1.8}>
          <circle cx="12" cy="7" r="4" />
          <path d="M5 21v-2a7 7 0 0 1 14 0v2" strokeLinecap="round" />
          <circle cx="19" cy="11" r="2" fill="#9B2335" stroke="none" />
        </svg>
      ),
    },
    {
      key: 'listening',
      title: isAr ? 'إنصات واهتمام' : 'Écoute bienveillante',
      description: isAr
        ? 'في كل مرحلة من حياتكِ'
        : 'À chaque étape de votre vie',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9B2335" strokeWidth={1.8}>
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="12" r="1" fill="#9B2335" />
          <circle cx="12" cy="12" r="1" fill="#9B2335" />
          <circle cx="15" cy="12" r="1" fill="#9B2335" />
        </svg>
      ),
    },
    {
      key: 'expertise',
      title: isAr ? 'خبرة طبية عالية' : 'Expertise médicale',
      description: isAr
        ? 'رعاية صحية متميزة'
        : 'Des soins de qualité',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9B2335" strokeWidth={1.8}>
          <circle cx="12" cy="9" r="6" />
          <path d="M12 6.5v5M9.5 9h5" strokeLinecap="round" />
          <path d="M7 14.5L5 21l7-3 7 3-2-6.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      key: 'trust',
      title: isAr ? 'قرب وثقة' : 'Proximité & confiance',
      description: isAr
        ? 'علاقة ثقة دائمة'
        : 'Une relation de confiance durable',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9B2335" strokeWidth={1.8}>
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            strokeLinejoin="round"
          />
          <path d="M8 12c1.5 2 3 2 4 0" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <section id="expertise" className="relative py-14 sm:py-20 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Heading & 4 List Features (6 cols) */}
          <div ref={leftRef} className="lg:col-span-6 flex flex-col items-start text-left rtl:text-right rtl:items-start space-y-6 reveal-left">
            {/* Pill Badge: POURQUOI ME CHOISIR ? */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FCEBEF] border border-[#F5D6DF] shadow-2xs">
              <span className="text-xs font-semibold text-[#9B2335] uppercase tracking-wider">
                {isAr ? 'لماذا تختارين عيادتنا؟' : 'Pourquoi me choisir ?'}
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-[2.6rem] font-normal text-[#24181B] leading-[1.2] tracking-tight">
              {isAr ? (
                <>
                  خبرة طبية في خدمة
                  <span className="block font-serif italic text-[#9B2335] font-medium mt-1">
                    راحتكِ وعافيتكِ
                  </span>
                </>
              ) : (
                <>
                  Une expertise au service
                  <span className="block mt-1">
                    de <span className="font-serif italic text-[#9B2335] font-medium">votre bien-être</span>
                  </span>
                </>
              )}
            </h2>

            {/* 4 Feature List Items with Circular Pink Icons */}
            <div className="flex flex-col space-y-4 w-full pt-1">
              {reasons.map((item) => (
                <div key={item.key} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-[#FCEBEF] border border-[#F8D8E2] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#FADCE4] transition-all duration-300 shadow-2xs">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#24181B] leading-snug group-hover:text-[#9B2335] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B5C62] mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Pregnancy Photo with Organic Fluid Wavy Frame & Hearts (6 cols) */}
          <div ref={rightRef} className="lg:col-span-6 relative flex justify-center items-center mt-6 lg:mt-0 reveal-right">
            {/* Floating delicate outline hearts */}
            <div className="absolute top-2 left-6 sm:left-12 z-20 animate-float-slow">
              <FloatingHeart size={26} color="#9B2335" />
            </div>
            <div className="absolute top-8 right-4 sm:right-10 z-20 animate-float-reverse" style={{ animationDelay: '1.2s' }}>
              <FloatingHeart size={28} color="#9B2335" />
            </div>

            {/* Botanical branches framing the photo */}
            <div className="absolute -left-6 sm:left-2 bottom-6 w-32 sm:w-40 pointer-events-none select-none z-20 opacity-75">
              <BotanicalBranch flip={false} opacity={0.7} />
            </div>
            <div className="absolute -right-4 sm:right-2 top-10 w-28 sm:w-36 pointer-events-none select-none z-0 opacity-60">
              <BotanicalBranch flip={true} opacity={0.6} />
            </div>

            {/* Fluid Organic Cloud / Wave Frame */}
            <div className="relative w-full max-w-[300px] xs:max-w-[340px] sm:max-w-md lg:max-w-lg aspect-[4/3.8] flex items-center justify-center p-2.5 sm:p-5 overflow-hidden">
              {/* Layered soft pastel pink waves behind photo */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FCE4EC] via-[#FDF0F4] to-[#FCEBEF] rounded-[2.5rem] sm:rounded-[3.5rem] opacity-70 transform -rotate-2" />
              <div className="absolute inset-1.5 sm:inset-3 bg-[#FFF5F8] rounded-[2.25rem] sm:rounded-[3.25rem] border border-[#F6D7DF] shadow-lg transform rotate-1" />

              {/* Photo Container */}
              <div className="relative z-10 w-full h-full rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-[#F8D8E2] shadow-sm bg-white">
                <img
                  src="/images/about-maternity.jpg"
                  alt="Maternité et bien-être - Dr. Ilham Boughaza"
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-104"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;