import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { siteConfig } from '@/config/site';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();

  const sections = [
    { key: 'data', title: t('privacy.sections.data.title'), body: t('privacy.sections.data.body') },
    { key: 'purpose', title: t('privacy.sections.purpose.title'), body: t('privacy.sections.purpose.body') },
    { key: 'legal', title: t('privacy.sections.legal.title'), body: t('privacy.sections.legal.body') },
    { key: 'retention', title: t('privacy.sections.retention.title'), body: t('privacy.sections.retention.body') },
    { key: 'recipients', title: t('privacy.sections.recipients.title'), body: t('privacy.sections.recipients.body') },
    { key: 'rights', title: t('privacy.sections.rights.title'), body: t('privacy.sections.rights.body') },
    { key: 'security', title: t('privacy.sections.security.title'), body: t('privacy.sections.security.body') },
    { key: 'cookies', title: t('privacy.sections.cookies.title'), body: t('privacy.sections.cookies.body') },
    { key: 'cndp', title: t('privacy.sections.cndp.title'), body: t('privacy.sections.cndp.body') },
  ];

  return (
    <div className="py-12 md:py-16 bg-[#FDFAF8] min-h-[80vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[var(--color-border)] shadow-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] hover:underline mb-6"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('common.back')}
          </Link>

          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[var(--color-text-primary)] mb-2">
            {t('privacy.title')}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mb-8">{t('privacy.lastUpdated')}</p>

          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-8">
            {t('privacy.intro')}
          </p>

          <div className="flex flex-col gap-6">
            {sections.map((section) => (
              <section key={section.key}>
                <h2 className="font-serif text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {section.title}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
              {t('privacy.contactTitle')}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {t('privacy.contactBody')}{' '}
              {siteConfig.email ? (
                <a href={`mailto:${siteConfig.email}`} className="text-[var(--color-primary)] font-medium hover:underline break-all">
                  {siteConfig.email}
                </a>
              ) : (
                <span className="text-[var(--color-text-muted)]">{t('contact.toConfirm')}</span>
              )}
            </p>
          </div>

          <p className="mt-8 text-xs text-[var(--color-text-muted)] leading-relaxed">
            {t('privacy.medicalDataNote')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
