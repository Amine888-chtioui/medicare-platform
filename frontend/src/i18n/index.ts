import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr.json';
import ar from './locales/ar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'ar'],
    defaultNS: 'translation',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'medicare_lang',
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Apply RTL direction when language changes
i18n.on('languageChanged', (lng) => {
  const html = document.documentElement;
  if (lng === 'ar') {
    html.setAttribute('dir', 'rtl');
    html.setAttribute('lang', 'ar');
  } else {
    html.setAttribute('dir', 'ltr');
    html.setAttribute('lang', 'fr');
  }
});

export default i18n;
