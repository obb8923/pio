import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboardingCompleted';

export const useOnboarding = () => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 온보딩 완료 여부 체크하는 함수
  const checkOnboardingStatus = useCallback(async (): Promise<boolean> => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      const isCompleted = completed === 'true';
      setIsOnboardingCompleted(isCompleted);
      return isCompleted;
    } catch (error) {
      console.error('온보딩 상태 체크 중 오류:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 온보딩 완료 상태로 설정하는 함수
  const completeOnboarding = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setIsOnboardingCompleted(true);
    } catch (error) {
      console.error('온보딩 완료 저장 중 오류:', error);
    }
  }, []);

  // 컴포넌트 마운트 시 온보딩 상태 체크
  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return {
    isOnboardingCompleted,
    isLoading,
    checkOnboardingStatus,
    completeOnboarding,
  };
};
