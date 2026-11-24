import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PatientAvatar } from '@/components/ui/PatientAvatar';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export const TestimonialsFaqSection: React.FC = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  // Testimonials Carousel State
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const testimonialsRef = useScrollReveal<HTMLDivElement>();
  const faqRef          = useScrollReveal<HTMLDivElement>(0.1, '0px 0px -40px 0px');

  const testimonials = [
    {
      id: 1,
      quote: isAr
        ? '« طبيبة ممتازة جداً، تستمع باهتمام وبشاشة. أشعر بالاطمئنان والراحة التامة في كل استشارة. »'
        : '« Une excellente médecin, très à l\'écoute et bienveillante. Je me sens en confiance à chaque consultation. »',
      author: isAr ? 'سارة العمراني' : 'Sara El Amrani',
      rating: 5,
    },
    {
      id: 2,
      quote: isAr
        ? '« مرافقة حمل رائعة ومطمئنة للغاية. الدكتورة إلهام تتميز بدماثة الخلق، الكفاءة الطبية العالية والدقة في المواعيد. »'
        : '« Un suivi de grossesse irréprochable et tellement rassurant. Dr. Ilham est d\'une grande compétence et d\'une douceur remarquable. »',
      author: isAr ? 'كنزة برادة' : 'Kenza Berrada',
      rating: 5,
    },
    {
      id: 3,
      quote: isAr
        ? '« عيادة نظيفة ومجهزة بأحدث التجهيزات. استقبلتني بحفاوة واستمعت إلى كل استفساراتي بكل سعة صدر. »'
        : '« Cabinet moderne, cadre apaisant et accueil très chaleureux. Je recommande Dr. Boughaza les yeux fermés. »',
      author: isAr ? 'فاطمة الزهراء العلوي' : 'Fatima-Zahra Alaoui',
      rating: 5,
    },
  ];

  // Auto-rotate testimonials every 6 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // FAQ Accordion State (open question id)
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: isAr
        ? 'كم مرة يجب استشارة طبيبة أمراض النساء؟'
        : 'À quelle fréquence consulter un gynécologue ?',
      answer: isAr
        ? 'يُنصح عموماً بإجراء استشارة وقائية سنوية للمتابعة الدورية والفحوصات الروتينية (مسحة عنق الرحم، فحص الثدي)، بالإضافة إلى أي استشارة طارئة عند ملاحظة أي أعراض غير معتادة.'
        : 'Il est généralement recommandé d\'effectuer une consultation de contrôle une fois par an pour un suivi préventif régulier (dépistage, frottis, examen sénologique) ou dès l\'apparition de symptômes inhabituels.',
    },
    {
      id: 2,
      question: isAr
        ? 'ما هي أولى علامات الحمل المبكرة؟'
        : 'Quels sont les signes d\'une grossesse ?',
      answer: isAr
        ? 'تأخر الدورة الشهرية هو المؤشر الأول والأبرز. تصاحبه في كثير من الأحيان علامات أخرى مثل الشعور بالإرهاق، حساسية وتورم الثديين، الغثيان الصباحي أو تغير الشهية.'
        : 'Le retard de règles est le signe principal. D\'autres symptômes fréquents incluent une fatigue inhabituelle, des tensions au niveau des seins, des nausées matinales et une hypersensibilité aux odeurs.',
    },
    {
      id: 3,
      question: isAr
        ? 'هل يمكنني حجز موعد عبر الموقع الإلكتروني؟'
        : 'Puis-je prendre rendez-vous en ligne ?',
      answer: isAr
        ? 'نعم، يمكنكِ بكل سهولة إرسال طلب موعد عبر استمارة الحجز في أسفل الموقع أو الاتصال بنا هاتفياً. سيتواصل معكِ طاقم العيادة لتأكيد موعدكِ المناسب.'
        : 'Oui, vous pouvez facilement envoyer votre demande de rendez-vous directement via notre formulaire en ligne ou par téléphone. Notre cabinet vous contactera rapidement pour convenir d\'un créneau adapté.',
    },
  ];

  const toggleFaq = (id: number) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  const activeTestimonial = testimonials[currentTestimonial];

  return (
    <section className="relative py-14 sm:py-20 bg-[#FFF9FA] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: TÉMOIGNAGES (6 cols) */}
          <div
            ref={testimonialsRef}
            className="lg:col-span-6 flex flex-col items-start text-left rtl:text-right rtl:items-start space-y-5 reveal-left"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Pill Badge: TÉMOIGNAGES */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FCEBEF] border border-[#F5D6DF] shadow-2xs">
              <span className="text-xs font-semibold text-[#9B2335] uppercase tracking-wider">
                {isAr ? 'آراء المريضات' : 'Témoignages'}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl font-normal text-[#24181B] tracking-tight leading-tight">
              {isAr ? (
                <>
                  مريضات يضعن{' '}
                  <span className="font-serif italic text-[#9B2335] font-medium">ثقتهن بنا</span>
                </>
              ) : (
                <>
                  Elles nous font{' '}
                  <span className="font-serif italic text-[#9B2335] font-medium">confiance</span>
                </>
              )}
            </h2>

            {/* Testimonial Card with Smooth Transitions */}
            <div className="w-full bg-white rounded-[1.75rem] sm:rounded-[2rem] border border-[#F6D7DF] p-5 sm:p-7 shadow-[0_4px_24px_rgba(155,35,53,0.05)] transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                {/* Crisp Vector Patient Avatar */}
                <PatientAvatar
                  name={activeTestimonial.author}
                  index={currentTestimonial}
                  className="w-16 h-16 sm:w-18 sm:h-18"
                />

                {/* Quote, Author & Stars */}
                <div className="flex flex-col text-center sm:text-left rtl:sm:text-right flex-1">
                  <p className="text-sm sm:text-base text-[#4A3D42] leading-relaxed italic min-h-[60px]">
                    {activeTestimonial.quote}
                  </p>

                  <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-[#FCE8EF] pt-3">
                    <span className="font-semibold text-sm text-[#24181B]">
                      — {activeTestimonial.author}
                    </span>

                    {/* 5 Burgundy Stars */}
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-[#9B2335]">
                      {[...Array(activeTestimonial.rating)].map((_, i) => (
                        <span key={i} className="text-base">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls: Left/Right circular buttons & 3 dots */}
            <div className="flex items-center justify-between w-full pt-1 px-2">
              <button
                type="button"
                onClick={prevTestimonial}
                aria-label="Témoignage précédent"
                className="w-10 h-10 rounded-full bg-white border border-[#E9C8D2] text-[#9B2335] hover:bg-[#FCEBEF] active:scale-95 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  className={isAr ? 'rotate-180' : ''}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Indicator dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentTestimonial(idx)}
                    aria-label={`Aller au témoignage ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentTestimonial === idx
                        ? 'w-7 bg-[#9B2335]'
                        : 'w-2.5 bg-[#E8CCD5] hover:bg-[#9B2335]/50'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={nextTestimonial}
                aria-label="Témoignage suivant"
                className="w-10 h-10 rounded-full bg-white border border-[#E9C8D2] text-[#9B2335] hover:bg-[#FCEBEF] active:scale-95 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  className={isAr ? 'rotate-180' : ''}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column: FAQ ACCORDION (6 cols) */}
          <div ref={faqRef} className="lg:col-span-6 flex flex-col items-start text-left rtl:text-right rtl:items-start space-y-5 reveal-right">
            {/* Pill Badge: FAQ */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FCEBEF] border border-[#F5D6DF] shadow-2xs">
              <span className="text-xs font-semibold text-[#9B2335] uppercase tracking-wider">
                {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl font-normal text-[#24181B] tracking-tight leading-tight">
              {isAr ? 'أسئلة شائعة ومتكررة' : 'Questions fréquentes'}
            </h2>

            {/* 3 Accordion Cards matching Reference Design */}
            <div className="w-full space-y-3.5 pt-1">
              {faqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-[#F6D7DF] bg-white transition-all duration-200 overflow-hidden shadow-2xs hover:border-[#E896AB]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left rtl:text-right cursor-pointer gap-4 transition-colors hover:bg-[#FFF9FB]"
                      aria-expanded={isOpen}
                    >
                      <span className="font-medium text-sm sm:text-base text-[#24181B] leading-snug">
                        {faq.question}
                      </span>
                      <span
                        className={`w-7 h-7 rounded-full bg-[#FCEBEF] text-[#9B2335] flex items-center justify-center shrink-0 transition-transform duration-300 text-lg font-light ${
                          isOpen ? 'rotate-45 bg-[#9B2335] text-white' : ''
                        }`}
                      >
                        +
                      </span>
                    </button>

                    {/* Smooth Collapsible Answer */}
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs sm:text-sm text-[#6B5C62] leading-relaxed border-t border-[#F8E2E8] pt-3 animate-slideDown">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsFaqSection;