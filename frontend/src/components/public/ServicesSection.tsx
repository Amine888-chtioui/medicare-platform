import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BotanicalBranch, HeartDivider } from '@/components/ui/BotanicalOrnaments';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useScrollLock } from '@/hooks/useScrollLock';

interface ServiceDetail {
  key: string;
  title: string;
  description: string;
  longDescription: string;
  benefits: string[];
  icon: React.ReactNode;
}

export const ServicesSection: React.FC = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);
  const headerRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useScrollReveal<HTMLDivElement>(0.08);

  useScrollLock(Boolean(selectedService));

  const services: ServiceDetail[] = [
    {
      key: 'gyneco',
      title: isAr ? 'متابعة أمراض النساء' : 'Suivi gynécologique',
      description: isAr
        ? 'استشارات منتظمة وفحوصات دورية'
        : 'Consultations régulières et dépistages',
      longDescription: isAr
        ? 'متابعة وقائية شاملة تشمل الفحص السريري، مسحة عنق الرحم الدورية، الفحص بالصدى، وفحوصات الثدي في إطار بيئة طبية آمنة ومريحة.'
        : 'Un suivi préventif complet adapté à chaque étape de votre vie : examen clinique, frottis cervico-vaginal, échographie pelvienne et dépistage sénologique dans un cadre bienveillant.',
      benefits: isAr
        ? ['فحص وقائي سنوي منتظم', 'فحص بالصدى عالي الدقة', 'تشخيص وعلاج الاضطرابات الهرمونية']
        : ['Bilan annuel et dépistage préventif', 'Échographie pelvienne de haute précision', 'Prise en charge des troubles hormonaux'],
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9B2335" strokeWidth={1.8}>
          <circle cx="12" cy="9" r="5.5" />
          <path d="M12 14.5v7" strokeLinecap="round" />
          <path d="M8.5 18h7" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: 'maternite',
      title: isAr ? 'الحمل والأمومة' : 'Grossesse & Maternité',
      description: isAr
        ? 'مرافقة متكاملة طوال فترة الحمل'
        : 'Accompagnement complet tout au long de votre grossesse',
      longDescription: isAr
        ? 'مرافقة دقيقة وحانية للأمهات الحوامل من الأسابيع الأولى وحتى ما بعد الولادة، مع متابعة نمو الجنين وفحوصات الصدى الدورية ثلاثية الأبعاد.'
        : 'Accompagnement médical personnalisé depuis la confirmation de grossesse jusqu\'au post-partum : échographies morphologiques, surveillance fœtale et conseils pour préparer l\'accouchement en toute sérénité.',
      benefits: isAr
        ? ['متابعة نمو الجنين شهر بشهر', 'فحوصات الصدى الدقيقة', 'نصائح التغذية والتحضير للولادة']
        : ['Surveillance mensuelle du développement fœtal', 'Échographies obstétricales détaillées', 'Conseils nutritionnels et préparation à la naissance'],
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9B2335" strokeWidth={1.8}>
          <circle cx="12" cy="6" r="3" />
          <path
            d="M9 10c-2 1-3 3-3 5.5 0 3.5 2 7 5.5 7.5 3.5.5 5.5-2 5.5-5 0-3-1.5-6-4-7.5"
            strokeLinecap="round"
          />
          <path d="M12 14c1.5.5 2.5 1.5 2.5 3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: 'reproductive',
      title: isAr ? 'الصحة الإنجابية' : 'Santé reproductive',
      description: isAr
        ? 'نصائح ومتابعة مخصصة'
        : 'Conseils et suivi personnalisé',
      longDescription: isAr
        ? 'استشارات متخصصة في الخصوبة والإنجاب، تشخيص أسباب تأخر الإنجاب، وتقديم حلول علاجية ملائمة وفق أحدث البروتوكولات الطبية.'
        : 'Consultations dédiées à la fertilité et au désir d\'enfant : bilans complets, exploration des causes d\'infertilité et accompagnement médical attentif et personnalisé.',
      benefits: isAr
        ? ['تقييم شامل للخصوبة للزوجين', 'علاج متلازمة تكيس المبايض', 'مرافقة طبية دقيقة']
        : ['Bilan de fertilité du couple', 'Prise en charge du SOPK et troubles ovulatoires', 'Accompagnement médical bienveillant'],
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9B2335" strokeWidth={1.8}>
          <path
            d="M12 21c-2-3-5-6-5-10 0-2.5 1.5-4.5 3.5-4.5 1.5 0 2 1 2.5 1.5.5-.5 1-1.5 2.5-1.5 2 0 3.5 2 3.5 4.5 0 4-3 7-5 10z"
            strokeLinejoin="round"
          />
          <path d="M8 8.5C6 7 4 7.5 3.5 9.5" strokeLinecap="round" />
          <path d="M16 8.5C18 7 20 7.5 20.5 9.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: 'contraception',
      title: isAr ? 'تنظيم الأسرة' : 'Contraception',
      description: isAr
        ? 'حلول ملائمة لاحتياجاتكِ'
        : 'Des solutions adaptées à votre situation',
      longDescription: isAr
        ? 'توجيه طبي دقيق لاختيار وسيلة منع الحمل الأنسب لصحتكِ وأسلوب حياتكِ (حبوب، لولب هرموني أو نحاسي، غرسة جلدية) مع متابعة منتظمة.'
        : 'Conseils et prescriptions individualisés pour choisir la contraception qui correspond à votre rythme de vie et à vos antécédents médicaux : pilule, stérilet (DIU), implant contraceptif.',
      benefits: isAr
        ? ['اختيار وسيلة منع الحمل المناسبة', 'تركيب وإزالة اللولب والغرسات', 'متابعة التكيف الهرموني']
        : ['Choix contraceptif sur-mesure', 'Pose et retrait de stérilet et implant', 'Surveillance et suivi de tolérance'],
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9B2335" strokeWidth={1.8}>
          <rect x="4" y="5" width="16" height="14" rx="3.5" />
          <circle cx="8" cy="9.5" r="1.3" fill="#9B2335" />
          <circle cx="12" cy="9.5" r="1.3" fill="#9B2335" />
          <circle cx="16" cy="9.5" r="1.3" fill="#9B2335" />
          <circle cx="8" cy="14.5" r="1.3" fill="#9B2335" />
          <circle cx="12" cy="14.5" r="1.3" fill="#9B2335" />
          <circle cx="16" cy="14.5" r="1.3" fill="#9B2335" />
        </svg>
      ),
    },
    {
      key: 'conseils',
      title: isAr ? 'نصائح مخصصة' : 'Conseils personnalisés',
      description: isAr
        ? 'مرافقة واستماع شخصي'
        : 'Un accompagnement sur mesure',
      longDescription: isAr
        ? 'جلسات استشارية للإصغاء والتوجيه حول جميع مراحل التغيرات النسائية: سن البلوغ، انقطاع الطمث، التوازن الهرموني، ونمط الحياة الصحي.'
        : 'Un espace d\'écoute attentive et de dialogue pour répondre à toutes vos interrogations : ménopause, puberté, bien-être intime, équilibre hormonal et hygiène de vie.',
      benefits: isAr
        ? ['مرافقة مرحلة انقطاع الطمث', 'إجابات علمية وشاملة لكل أسئلتكِ', 'سرية تامة وإنصات صادق']
        : ['Accompagnement de la transition ménopausique', 'Réponses claires et bienveillantes', 'Confidentialité et écoute sans jugement'],
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9B2335" strokeWidth={1.8}>
          <path
            d="M20 11.5c0 4.14-3.58 7.5-8 7.5-1.28 0-2.48-.28-3.54-.78L4 19.5l1.32-3.8A7.32 7.32 0 0 1 4 11.5C4 7.36 7.58 4 12 4s8 3.36 8 7.5z"
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="11.5" r="1" fill="#9B2335" />
          <circle cx="12" cy="11.5" r="1" fill="#9B2335" />
          <circle cx="15.5" cy="11.5" r="1" fill="#9B2335" />
        </svg>
      ),
    },
  ];

  const handleBookFromModal = (serviceTitle: string) => {
    setSelectedService(null);
    const elem = document.getElementById('formulaire-rdv') || document.getElementById('contact');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
      // Pre-fill description if input exists
      const descInput = document.getElementById('description') as HTMLTextAreaElement | null;
      if (descInput) {
        descInput.value = `${isAr ? 'طلب موعد بخصوص' : 'Demande concernant'} : ${serviceTitle}`;
        descInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  return (
    <section id="services" className="relative pt-6 pb-14 sm:pt-8 sm:pb-20 bg-white overflow-hidden scroll-mt-20">
      {/* Delicate botanical branches in top-left and top-right corners */}
      <div className="absolute top-2 left-0 sm:left-4 w-28 sm:w-36 opacity-60 pointer-events-none select-none">
        <BotanicalBranch flip={false} opacity={0.65} />
      </div>
      <div className="absolute top-2 right-0 sm:right-4 w-28 sm:w-36 opacity-60 pointer-events-none select-none">
        <BotanicalBranch flip={true} opacity={0.65} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div ref={headerRef} className="reveal text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          {/* Pill Badge: NOS SERVICES */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FCEBEF] border border-[#F5D6DF] shadow-2xs mb-3">
            <span className="text-xs font-semibold text-[#9B2335] uppercase tracking-wider">
              {isAr ? 'خدماتنا' : 'Nos services'}
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#24181B] tracking-tight leading-tight mb-3">
            {isAr
              ? 'رعاية مخصصة في كل مرحلة من حياتكِ'
              : 'Des soins personnalisés pour chaque étape de votre vie'}
          </h2>

          {/* Centered Heart Divider: ── ♡ ── */}
          <HeartDivider className="mt-2" />
        </div>

        {/* 5 Service Cards Grid matching Reference Design with Interactive Hover */}
        <div ref={gridRef} className="reveal reveal-stagger grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {services.map((item) => (
            <div
              key={item.key}
              onClick={() => setSelectedService(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedService(item);
                }
              }}
              className="group relative flex flex-col items-center text-center justify-between p-6 sm:p-5 lg:p-6 rounded-[1.75rem] bg-white border border-[#F6D7DF] shadow-[0_4px_24px_rgba(155,35,53,0.04)] hover:shadow-[0_12px_36px_rgba(155,35,53,0.12)] hover:border-[#E896AB] hover:-translate-y-1.5 transition-all duration-300 min-h-[260px] cursor-pointer"
            >
              <div className="flex flex-col items-center w-full">
                {/* Circular soft pink icon badge with elevation */}
                <div className="w-16 h-16 rounded-full bg-[#FCEBEF] border border-[#F8D8E2] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#FADCE4] transition-all duration-300 shadow-2xs">
                  {item.icon}
                </div>

                {/* Title */}
                <h3 className="font-sans font-semibold text-base text-[#24181B] group-hover:text-[#9B2335] transition-colors leading-snug mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#6B5C62] leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              {/* Bottom circular pink arrow action */}
              <div
                className="mt-4 w-8 h-8 rounded-full bg-[#FCEBEF] text-[#9B2335] flex items-center justify-center group-hover:bg-[#9B2335] group-hover:text-white transition-all duration-300 shadow-2xs group-hover:scale-110"
                aria-label={`En savoir plus sur ${item.title}`}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  className={isAr ? 'rotate-180' : ''}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INTERACTIVE SERVICE DETAIL MODAL ── */}
      {selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-300 overscroll-contain"
          onClick={() => setSelectedService(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-lg rounded-[2.5rem] bg-gradient-to-br from-white via-[#FFF9FA] to-[#FDF0F4] border border-[#F6D7DF] p-6 sm:p-8 shadow-2xl transition-all max-h-[90vh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 rtl:right-auto rtl:left-5 w-8 h-8 rounded-full bg-[#FCEBEF] text-[#9B2335] hover:bg-[#9B2335] hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Fermer"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-[#FCEBEF] border border-[#F8D8E2] flex items-center justify-center shrink-0 shadow-xs">
                {selectedService.icon}
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#9B2335] font-semibold block">
                  {isAr ? 'تفاصيل الخدمة' : 'Service médical'}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#24181B]">
                  {selectedService.title}
                </h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-[#4A3D42] leading-relaxed mb-5">
              {selectedService.longDescription}
            </p>

            {/* Benefits Bullet points */}
            <div className="mb-6 space-y-2.5">
              <span className="text-xs font-semibold text-[#24181B] uppercase tracking-wide block">
                {isAr ? 'ما تتضمنه الاستشارة :' : 'Ce que comprend ce soin :'}
              </span>
              {selectedService.benefits.map((b, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#6B5C62]">
                  <span className="w-5 h-5 rounded-full bg-[#FCEBEF] text-[#9B2335] flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </span>
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {/* Booking CTA Button */}
            <button
              type="button"
              onClick={() => handleBookFromModal(selectedService.title)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#9B2335] hover:bg-[#7A1B29] text-white text-sm font-semibold shadow-[0_4px_14px_rgba(155,35,53,0.25)] hover:shadow-[0_6px_20px_rgba(155,35,53,0.35)] transition-all cursor-pointer active:scale-98"
            >
              <span>{isAr ? 'طلب موعد لهذه الخدمة' : 'Prendre rendez-vous pour ce soin'}</span>
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className={isAr ? 'rotate-180' : ''}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServicesSection;