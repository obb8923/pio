import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { getFoundPlants } from '../supabase/operations/foundPlants/getFoundPlants';
import { useAuthStore } from '../../store/authStore';
import { useFoundPlantsStore } from '../../store/foundPlantsStore';

// 발견된 식물들을 관리하는 커스텀 훅
export const useFoundPlants = (showOnlyMyPlants: boolean) => {
  const {myPlants, allPlants,setMyPlants,setAllPlants} = useFoundPlantsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 식물 데이터를 가져오는 함수 (useCallback으로 메모이제이션)
  const fetchPlants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { userId } = useAuthStore.getState();
      const plants = await getFoundPlants(showOnlyMyPlants ? userId || undefined : undefined);
      if (plants) {
        showOnlyMyPlants ? setMyPlants(plants) : setAllPlants(plants);
      }
    } catch (err) {
      console.error('Error fetching plants:', err);
      setError(err instanceof Error ? err : new Error('식물 데이터를 가져오는 중 오류가 발생했습니다.'));
      Alert.alert('오류', '식물 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [showOnlyMyPlants, setMyPlants, setAllPlants]);

  // 훅의 반환값
  return {
    myPlants,
    allPlants,
    isLoading,       // 로딩 상태
    setIsLoading,
    error,           // 에러 상태
    fetchPlants      // 데이터 가져오기 함수
  };
}; 