import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getFoundPlants, getCurrentUserFoundPlants } from '../../../../libs/supabase/supabaseOperations';

export type FoundPlant = {
  id: string;
  lat: number;
  lng: number;
  image_url: string;
  plant_name: string;
  description: string;
  memo: string;
  signed_url?: string;
};

export const useFoundPlants = (showOnlyMyPlants: boolean) => {
  const [foundPlants, setFoundPlants] = useState<FoundPlant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshPlants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const plants = showOnlyMyPlants 
        ? await getCurrentUserFoundPlants()
        : await getFoundPlants();
      
      if (plants) setFoundPlants(plants);
    } catch (err) {
      console.error('Error refreshing plants:', err);
      setError(err instanceof Error ? err : new Error('식물 데이터를 새로고침하는 중 오류가 발생했습니다.'));
      Alert.alert('오류', '식물 데이터를 새로고침하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    refreshPlants();
  }, [showOnlyMyPlants]);

  return {
    foundPlants,
    isLoading,
    error,
    refreshPlants
  };
}; 