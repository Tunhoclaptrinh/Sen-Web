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
import viGameMenu from './locales/vi/game_menu.json';
import viGameDashboard from './locales/vi/game_dashboard.json';
import viGameChapters from './locales/vi/game_chapters.json';
import viGameLevels from './locales/vi/game_levels.json';
import viGameQuests from './locales/vi/game_quests.json';
import viGameMuseum from './locales/vi/game_museum.json';
import viGameShop from './locales/vi/game_shop.json';
import viGameWelfare from './locales/vi/game_welfare.json';
import viGameLeaderboard from './locales/vi/game_leaderboard.json';
import viGameScan from './locales/vi/game_scan.json';
import viGameLearning from './locales/vi/game_learning.json';
import viGamePlay from './locales/vi/game_play.json';
import viProfile from './locales/vi/profile.json';
import viNotifications from './locales/vi/notifications.json';
import viChat from './locales/vi/chat.json';
import viPoster from './locales/vi/poster.json';

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
import enGameMenu from './locales/en/game_menu.json';
import enGameDashboard from './locales/en/game_dashboard.json';
import enGameChapters from './locales/en/game_chapters.json';
import enGameLevels from './locales/en/game_levels.json';
import enGameQuests from './locales/en/game_quests.json';
import enGameMuseum from './locales/en/game_museum.json';
import enGameShop from './locales/en/game_shop.json';
import enGameWelfare from './locales/en/game_welfare.json';
import enGameLeaderboard from './locales/en/game_leaderboard.json';
import enGameScan from './locales/en/game_scan.json';
import enGameLearning from './locales/en/game_learning.json';
import enGamePlay from './locales/en/game_play.json';
import enProfile from './locales/en/profile.json';
import enNotifications from './locales/en/notifications.json';
import enChat from './locales/en/chat.json';
import enPoster from './locales/en/poster.json';

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
          gameMenu: viGameMenu,
          gameDashboard: viGameDashboard,
          gameChapters: viGameChapters,
          gameLevels: viGameLevels,
          gameQuests: viGameQuests,
          gameMuseum: viGameMuseum,
          gameShop: viGameShop,
          gameWelfare: viGameWelfare,
          gameLeaderboard: viGameLeaderboard,
          gameScan: viGameScan,
          gameLearning: viGameLearning,
          gamePlay: viGamePlay,
          profile: viProfile,
          notifications: viNotifications,
          chat: viChat,
          poster: viPoster,
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
          gameMenu: enGameMenu,
          gameDashboard: enGameDashboard,
          gameChapters: enGameChapters,
          gameLevels: enGameLevels,
          gameQuests: enGameQuests,
          gameMuseum: enGameMuseum,
          gameShop: enGameShop,
          gameWelfare: enGameWelfare,
          gameLeaderboard: enGameLeaderboard,
          gameScan: enGameScan,
          gameLearning: enGameLearning,
          gamePlay: enGamePlay,
          profile: enProfile,
          notifications: enNotifications,
          chat: enChat,
          poster: enPoster,
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
