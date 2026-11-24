import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppointmentForm } from '@/features/appointment/AppointmentForm';
import { StylizedClinicMap } from '@/components/ui/StylizedClinicMap';
import { siteConfig, telHref } from '@/config/site';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export const AppointmentSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const contactRef = useScrollReveal<HTMLDivElement>();
  const mapRef     = useScrollReveal<HTMLDivElement>();
  const formRef    = useScrollReveal<HTMLDivElement>(0.08);

  const phone = siteConfig.phone || '+212 6 12 34 56 78';
  const email = siteConfig.email || 'contact@dr-ilham.ma';
  const address = siteConfig.address
    ? [siteConfig.address, siteConfig.city].filter(Boolean).join(', ')
    : isAr
    ? '123 شارع الحسن الثاني، تارودانت'
    : '123 Avenue Hassan II, Taroudant';

  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const elem = document.getElementById('formulaire-rdv');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="contact" className="relative py-14 sm:py-20 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top: 2-Column Contact Info on Left, Vector Stylized Map on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
          {/* Left Column: Contact details (6 cols) */}
          <div ref={contactRef} className="lg:col-span-6 flex flex-col items-start text-left rtl:text-right rtl:items-start space-y-5 reveal-left">
            {/* Pill Badge: CONTACT */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FCEBEF] border border-[#F5D6DF] shadow-2xs">
              <span className="text-xs font-semibold text-[#9B2335] uppercase tracking-wider">
                {isAr ? 'اتصل بنا' : 'Contact'}
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl font-normal text-[#24181B] tracking-tight leading-tight">
              {isAr ? 'احجزي موعدكِ الآن' : 'Prenons rendez-vous'}
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#6B5C62] leading-relaxed max-w-lg">
              {isAr
                ? 'يمكنكِ الاتصال بنا هاتفياً مباشرة، أو ملء استمارة حجز الموعد أدناه.'
                : 'Vous pouvez nous contacter par téléphone, ou remplir le formulaire ci-dessous.'}
            </p>

            {/* Contact Items List */}
            <div className="flex flex-col space-y-3.5 w-full pt-1">
              {/* Phone */}
              <div className="flex items-center gap-3.5 group">
                <div className="w-10 h-10 rounded-full bg-[#FCEBEF] text-[#9B2335] border border-[#F8D8E2] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#FADCE4] transition-all">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <a
                  href={telHref(phone)}
                  dir="ltr"
                  className="text-sm sm:text-base font-semibold text-[#24181B] hover:text-[#9B2335] transition-colors"
                >
                  {phone}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3.5 group">
                <div className="w-10 h-10 rounded-full bg-[#FCEBEF] text-[#9B2335] border border-[#F8D8E2] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#FADCE4] transition-all">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <a
                  href={`mailto:${email}`}
                  className="text-sm sm:text-base font-medium text-[#24181B] hover:text-[#9B2335] transition-colors break-all"
                >
                  {email}
                </a>
              </div>

              {/* Address */}
              <div className="flex items-center gap-3.5 group">
                <div className="w-10 h-10 rounded-full bg-[#FCEBEF] text-[#9B2335] border border-[#F8D8E2] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#FADCE4] transition-all">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-medium text-[#24181B]">
                  {address}
                </span>
              </div>
            </div>

            {/* Burgundy Button: Nous contacter -> */}
            <div className="pt-2 w-full sm:w-auto">
              <a
                href="#formulaire-rdv"
                onClick={scrollToForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#9B2335] hover:bg-[#7A1B29] text-white font-medium text-sm shadow-[0_4px_14px_rgba(155,35,53,0.2)] hover:shadow-[0_6px_18px_rgba(155,35,53,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-200 cursor-pointer min-h-[46px]"
              >
                <span>{isAr ? 'تواصلي معنا' : 'Nous contacter'}</span>
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

          {/* Right Column: Custom Stylized Vector Map Component (6 cols) */}
          <div ref={mapRef} className="lg:col-span-6 flex justify-center reveal-right">
            <StylizedClinicMap />
          </div>
        </div>

        {/* Bottom: Fully Working Appointment Booking Form */}
        <div ref={formRef} id="formulaire-rdv" className="scroll-mt-24 max-w-3xl mx-auto pt-4 sm:pt-6 reveal">
          <div className="rounded-[1.75rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#FFF5F7] via-white to-[#FDF0F4] border border-[#F6D7DF] p-5 sm:p-10 shadow-[0_8px_32px_rgba(155,35,53,0.06)]">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs uppercase tracking-widest text-[#9B2335] font-semibold block mb-1">
                {isAr ? 'استمارة الحجز' : 'Formulaire en ligne'}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#24181B]">
                {t('appointment.sectionTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-[#6B5C62] mt-1.5">
                {t('appointment.sectionSubtitle')}
              </p>
            </div>

            <AppointmentForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;