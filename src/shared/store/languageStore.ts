import { create } from 'zustand';
import type { SupportedLanguage } from '@libs/i18n';
import { changeLanguage as i18nChangeLanguage } from '@libs/i18n';

interface LanguageState {
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  initializeLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set, _get) => ({
  currentLanguage: 'en',
  isLoading: true,
  changeLanguage: async (language: SupportedLanguage) => {
    set({ isLoading: true });
    try {
      await i18nChangeLanguage(language);
      set({ currentLanguage: language });
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  initializeLanguage: async () => {
    set({ isLoading: true });
    try {
      // Language will be loaded in App.tsx during initialization
      // This method can be used for re-initialization if needed
      set({ currentLanguage: 'en' });
    } catch (error) {
      console.error('Error initializing language:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

