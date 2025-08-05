import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REVIEW_STATUS_KEY } from '../../constants/ASYNCSTORAGE_KEYS';

interface UseReviewReturn {
  isReviewedInYear: boolean;
  setReviewedInYear: () => Promise<void>;
  isLoading: boolean;
  lastReviewDate: Date | null;
}

export const useReview = (): UseReviewReturn => {
  const [isReviewedInYear, setIsReviewedInYear] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastReviewDate, setLastReviewDate] = useState<Date | null>(null);

  // 1년 내에 리뷰를 작성했는지 확인하는 함수
  const isReviewWithinYear = useCallback((reviewDate: Date): boolean => {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    return reviewDate >= oneYearAgo;
  }, []);

  // AsyncStorage에서 리뷰 작성 여부 확인
  const checkReviewStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const reviewDateString = await AsyncStorage.getItem(REVIEW_STATUS_KEY);
      
      if (reviewDateString) {
        const reviewDate = new Date(reviewDateString);
        setLastReviewDate(reviewDate);
        
        // 1년 내에 리뷰를 했는지 확인
        const isWithinYear = isReviewWithinYear(reviewDate);
        setIsReviewedInYear(isWithinYear);
      } else {
        setLastReviewDate(null);
        setIsReviewedInYear(false);
      }
    } catch (error) {
      console.error('리뷰 상태 확인 실패:', error);
      setLastReviewDate(null);
      setIsReviewedInYear(false);
    } finally {
      setIsLoading(false);
    }
  }, [isReviewWithinYear]);

  // 리뷰 작성 완료로 상태 업데이트
  const setReviewedInYear = useCallback(async () => {
    try {
      const now = new Date();
      const dateString = now.toISOString();
      
      await AsyncStorage.setItem(REVIEW_STATUS_KEY, dateString);
      setLastReviewDate(now);
      setIsReviewedInYear(true);
    } catch (error) {
      console.error('리뷰 상태 저장 실패:', error);
    }
  }, []);

  // 컴포넌트 마운트 시 리뷰 상태 확인
  useEffect(() => {
    checkReviewStatus();
  }, [checkReviewStatus]);

  return {
    isReviewedInYear,
    setReviewedInYear,
    isLoading,
    lastReviewDate,
  };
};
