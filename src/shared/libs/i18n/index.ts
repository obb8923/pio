import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

// Import translation files
import enCommonComponents from './resources/en/common/components.json';
import enCommonErrors from './resources/en/common/errors.json';
import enCommonNotifications from './resources/en/common/notifications.json';
import enCommonLanguage from './resources/en/common/language.json';
import enDomainProfile from './resources/en/domain/profile.json';
import enDomainOnboarding from './resources/en/domain/onboarding.json';
import enDomainMap from './resources/en/domain/map.json';
import enDomainMaintenance from './resources/en/domain/maintenance.json';
import enDomainPiodex from './resources/en/domain/piodex.json';
import enPolicyPrivacy from './resources/en/policy/privacy.json';
import enPolicyTerms from './resources/en/policy/terms.json';

import koCommonComponents from './resources/ko/common/components.json';
import koCommonErrors from './resources/ko/common/errors.json';
import koCommonNotifications from './resources/ko/common/notifications.json';
import koCommonLanguage from './resources/ko/common/language.json';
import koDomainProfile from './resources/ko/domain/profile.json';
import koDomainOnboarding from './resources/ko/domain/onboarding.json';
import koDomainMap from './resources/ko/domain/map.json';
import koDomainMaintenance from './resources/ko/domain/maintenance.json';
import koDomainPiodex from './resources/ko/domain/piodex.json';
import koPolicyPrivacy from './resources/ko/policy/privacy.json';
import koPolicyTerms from './resources/ko/policy/terms.json';

const LANGUAGE_STORAGE_KEY = 'app_language';

const resources = {
  en: {
    common: {
      components: enCommonComponents,
      errors: enCommonErrors,
      notifications: enCommonNotifications,
      language: enCommonLanguage,
    },
    domain: {
      profile: enDomainProfile,
      onboarding: enDomainOnboarding,
      map: enDomainMap,
      maintenance: enDomainMaintenance,
      piodex: enDomainPiodex,
    },
    policy: {
      privacy: enPolicyPrivacy,
      terms: enPolicyTerms,
    },
  },
  ko: {
    common: {
      components: koCommonComponents,
      errors: koCommonErrors,
      notifications: koCommonNotifications,
      language: koCommonLanguage,
    },
    domain: {
      profile: koDomainProfile,
      onboarding: koDomainOnboarding,
      map: koDomainMap,
      maintenance: koDomainMaintenance,
      piodex: koDomainPiodex,
    },
    policy: {
      privacy: koPolicyPrivacy,
      terms: koPolicyTerms,
    },
  },
};

export const supportedLanguages = ['en', 'ko'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: [
      'common',
      'domain',
      'policy',
    ],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    compatibilityJSON: 'v4', // for better compatibility with React Native
  });

// Helper function to get device language
const getDeviceLanguage = (): SupportedLanguage => {
  try {
    const locales = RNLocalize.getLocales();
    if (locales && locales.length > 0) {
      const languageCode = locales[0].languageCode;
      // Map device language codes to supported languages
      if (supportedLanguages.includes(languageCode as SupportedLanguage)) {
        return languageCode as SupportedLanguage;
      }
    }
  } catch (error) {
    console.error('Failed to get device language:', error);
  }
  return 'en'; // Default to English
};

// Helper function to load saved language preference
export const loadSavedLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && supportedLanguages.includes(savedLanguage as SupportedLanguage)) {
      return savedLanguage;
    }
    // If no saved language, use device language
    const deviceLanguage = getDeviceLanguage();
    return deviceLanguage;
  } catch (error) {
    console.error('Failed to load saved language:', error);
    // Fallback to device language or English
    return getDeviceLanguage();
  }
};

// Helper function to save language preference
export const saveLanguagePreference = async (language: SupportedLanguage): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Failed to save language preference:', error);
  }
};

// Helper function to change language
export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
  await saveLanguagePreference(language);
  i18n.changeLanguage(language);
};

export default i18n;

