import { useState } from 'react';
import { Alert } from 'react-native';
import { getFoundPlants } from '../supabase/operations/foundPlants/getFoundPlants';
import { useAuthStore } from '../../store/authStore';

// 발견된 식물의 데이터 타입 정의
export type FoundPlant = {
  id: string;                // 고유 식별자
  created_at: string;        // 생성 날짜
  lat: number;              // 위도
  lng: number;              // 경도
  image_path: string;        // 이미지 URL
  plant_name: string;       // 식물 이름
  description: string;      // 설명
  memo: string;            // 메모
};

// 발견된 식물들을 관리하는 커스텀 훅
export const useFoundPlants = (showOnlyMyPlants: boolean) => {
  // 상태 관리를 위한 useState 훅들
  const [foundPlants, setFoundPlants] = useState<FoundPlant[]>([]);    // 발견된 식물들의 배열
  const [isLoading, setIsLoading] = useState(true);                    // 로딩 상태
  const [error, setError] = useState<Error | null>(null);              // 에러 상태

  // 식물 데이터를 가져오는 함수
  const fetchPlants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { userId } = useAuthStore.getState();
      const plants = await getFoundPlants(showOnlyMyPlants ? userId || undefined : undefined);
      
      if (plants) {
        setFoundPlants(plants);
      }
    } catch (err) {
      console.error('Error fetching plants:', err);
      setError(err instanceof Error ? err : new Error('식물 데이터를 가져오는 중 오류가 발생했습니다.'));
      Alert.alert('오류', '식물 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 훅의 반환값
  return {
    foundPlants,     // 발견된 식물들의 배열
    isLoading,       // 로딩 상태
    error,           // 에러 상태
    fetchPlants      // 데이터 가져오기 함수
  };
}; 