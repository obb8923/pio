// src/store/onboardingStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_KEY } from '../constants/ASYNCSTORAGE_KEYS';

interface OnboardingStore {
  isOnboardingCompleted: boolean;
  isLoading: boolean;
  checkOnboardingStatus: () => Promise<boolean>;
  completeOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  isOnboardingCompleted: false,
  isLoading: true,

  checkOnboardingStatus: async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      const isCompleted = completed === 'true';
      set({ isOnboardingCompleted: isCompleted, isLoading: false });
      return isCompleted;
    } catch (error) {
      console.error('온보딩 상태 체크 중 오류:', error);
      set({ isLoading: false });
      return false;
    }
  },

  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      set({ isOnboardingCompleted: true });
    } catch (error) {
      console.error('온보딩 완료 저장 중 오류:', error);
    }
  },
}));
