import { useState, useRef } from 'react';
import { found_plants_columns } from '../../../../libs/supabase/operations/foundPlants/type';
import { NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { DEVICE_WIDTH_HALF, DEVICE_HEIGHT_HALF } from '../../../../constants/normal';
export const useMapMarkers = () => {
  const [selectedPlant, setSelectedPlant] = useState<found_plants_columns | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [screenPosition, setScreenPosition] = useState<{ x: number; y: number }>({x:DEVICE_WIDTH_HALF,y:DEVICE_HEIGHT_HALF});
  const mapRef = useRef<NaverMapViewRef>(null);
  const setScreenPositionCenter = ()=>{ setScreenPosition({
    x: DEVICE_WIDTH_HALF,
    y: DEVICE_HEIGHT_HALF
  });}
  const handleMarkerPress = async (plant: found_plants_columns) => {
   
    
    try {
      // 지도 참조가 유효한지 확인
      if (!mapRef.current) {
        console.warn('[useMapMarkers] Map ref is not available');
        setScreenPositionCenter();
        return;
      }
      // 마커의 위도/경도를 스크린 좌표로 변환
      const position = await mapRef.current.coordinateToScreen({
        latitude: plant.lat,
        longitude: plant.lng,
      });
      
      if (position?.isValid) {
        setScreenPosition({
          x: position.screenX,
          y: position.screenY
        });
      } else {
        console.warn('[useMapMarkers] Invalid screen position for plant:', plant.id);
        // 화면 중앙으로 설정
        setScreenPositionCenter();
      }
    } catch (error) {
      console.error('[useMapMarkers] Failed to get marker screen position:', error);
      // 화면 중앙으로 설정
      setScreenPositionCenter();
    }
     // 식물 정보와 모달을 표시
     setSelectedPlant(plant);
     setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedPlant(null);
    setScreenPositionCenter();
  };

  return {
    selectedPlant,
    isModalVisible,
    screenPosition,
    handleMarkerPress,
    closeModal,
    mapRef
  };
}; 