import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frTranslation from '../locales/fr/translation.json';
import enTranslation from '../locales/en/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: frTranslation,
      },
      en: {
        translation: enTranslation,
      },
    },
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // React already handles XSS protection
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
