import { useCallback } from 'react';
import { useFoundPlantsStore } from '@store/foundPlantsStore.ts';

// 발견된 식물들을 관리하는 커스텀 훅
export const useFoundPlants = (showOnlyMyPlants: boolean) => {
  const {
    myPlants,
    allPlants,
    loading,
    fetchMyPlants,
    fetchAllPlants,
  } = useFoundPlantsStore();

  const fetchPlants = useCallback(async () => {
    if (showOnlyMyPlants) {
      await fetchMyPlants();
    } else {
      await fetchAllPlants();
    }
  }, [showOnlyMyPlants, fetchMyPlants, fetchAllPlants]);

  return {
    myPlants,
    allPlants,
    isLoading: loading,
    fetchPlants,
  };
}; 