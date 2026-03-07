import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viNav from './locales/vi/nav.json';
import viHome from './locales/vi/home.json';
import viSupport from './locales/vi/support.json';
import viHeader from './locales/vi/header.json';
import viCommon from './locales/vi/common.json';
import viHeritage from './locales/vi/heritage.json';
import viArtifact from './locales/vi/artifact.json';
import viMap from './locales/vi/map.json';
import viExhibition from './locales/vi/exhibition.json';
import viHistory from './locales/vi/history.json';

import enNav from './locales/en/nav.json';
import enHome from './locales/en/home.json';
import enSupport from './locales/en/support.json';
import enHeader from './locales/en/header.json';
import enCommon from './locales/en/common.json';
import enHeritage from './locales/en/heritage.json';
import enArtifact from './locales/en/artifact.json';
import enMap from './locales/en/map.json';
import enExhibition from './locales/en/exhibition.json';
import enHistory from './locales/en/history.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        translation: {
          nav: viNav,
          home: viHome,
          support: viSupport,
          header: viHeader,
          common: viCommon,
          heritage: viHeritage,
          artifact: viArtifact,
          map: viMap,
          exhibition: viExhibition,
          history: viHistory,
        },
      },
      en: {
        translation: {
          nav: enNav,
          home: enHome,
          support: enSupport,
          header: enHeader,
          common: enCommon,
          heritage: enHeritage,
          artifact: enArtifact,
          map: enMap,
          exhibition: enExhibition,
          history: enHistory,
        },
      },
    },
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    },
  });

export default i18n;
