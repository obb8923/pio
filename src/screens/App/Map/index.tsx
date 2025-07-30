// React & React Native 기본 모듈
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState, useCallback, useEffect } from "react";
// 네비게이션 & 안전 영역 관리
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
// 외부 라이브러리
import { NaverMapMarkerOverlay, NaverMapView } from '@mj-studio/react-native-naver-map';
// 내부 컴포넌트
import { Background } from "../../../components/Background";
import { TextToggle } from "../../../components/TextToggle";
import { PlantDetailModal } from "./components/PlantDetailModal";
import { AddPlantFAB } from "./components/AddPlantFAB";
// 상수 & 네비게이션 타입
import { Colors } from "../../../constants/Colors";
import { MapStackParamList } from "../../../nav/stack/Map";
import { RootStackParamList } from "../../../nav/stack/Root";
// 상태 관리 스토어 (Zustand)
import { useLocationStore } from "../../../store/locationStore";      // 위치 정보 관리
import { useAuthStore } from "../../../store/authStore";              // 사용자 인증 관리
import { usePermissionStore } from "../../../store/permissionStore";  // 앱 권한 관리
import { useVisitStore } from "../../../store/visitStore";            // 방문 기록 관리
// 커스텀 훅스 & 유틸리티 & 데이터베이스 타입
import { useFoundPlants } from "../../../libs/hooks/useFoundPlants";  // 발견한 식물 데이터 관리
import { useMapMarkers } from "./hooks/useMapMarkers";                // 지도 마커 관리
import { usePermissions } from '../../../libs/hooks/usePermissions';  // 권한 요청 및 확인
import { useNotifee } from "../../../libs/hooks/useNotifee";          // 알림 관리
import { getFlowerImageForPlant } from "./utils/markerUtils";                           // 식물별 꽃 이미지 가져오기
import { found_plants_columns } from '../../../libs/supabase/operations/foundPlants/type'; // Supabase 테이블 타입 정의


type MapStack = NativeStackScreenProps<MapStackParamList,'Map'>;
type RootStack = NativeStackScreenProps<RootStackParamList>;
type MapScreenProps = CompositeScreenProps<MapStack, RootStack>;

export const MapScreen = ({navigation}:MapScreenProps) => {
  const { latitude, longitude } = useLocationStore();
  const [showOnlyMyPlants, setShowOnlyMyPlants] = useState(false);
  const { userId } = useAuthStore();
  const insets = useSafeAreaInsets();
  const {isInitialized } = usePermissionStore();
  const {checkAndRequestLocationPermission} = usePermissions();

  const { isFirstVisit, setFirstVisit } = useVisitStore();
 
  // 커스텀 훅 사용
  const { myPlants, allPlants, isLoading: isLoadingPlants, fetchPlants } = useFoundPlants(showOnlyMyPlants);
  const { selectedPlant, isModalVisible, screenPosition, handleMarkerPress, closeModal, mapRef } = useMapMarkers();
    // useNotifee 훅을 호출하여 알림 자동 설정 (반환값은 사용하지 않음)
    useNotifee();
  useEffect(() => {
    if (isFirstVisit && isInitialized) {
      setFirstVisit(false);

      checkAndRequestLocationPermission();
      // if (!camera || !photoLibrary || !location) {
      //   navigation.navigate('PermissionScreen');
      // }
    }
  }, [isInitialized]);

  // 화면이 포커스될 때마다 식물 데이터 가져오기
  useFocusEffect(
    useCallback(() => {
      fetchPlants();
    }, [showOnlyMyPlants])
  );

  const handleTogglePress = useCallback(() => {
    if (!showOnlyMyPlants && !userId) {
      Alert.alert(
        "로그인 필요",
        "내 식물을 보려면 로그인이 필요합니다.",
        [
          { text: "확인", style: "default" }
        ]
      );
      return;
    }
    setShowOnlyMyPlants(!showOnlyMyPlants);
  }, [showOnlyMyPlants, userId]);
  
  return <Background >
    <View className="flex-1">
      {/* 상단 네비게이션 바 */}
      <View className="absolute h-10 px-4 z-10 flex-row items-center justify-between w-full" style={{marginTop: insets.top + 10}}>
         {/* 새로고침 버튼 */}
      <TouchableOpacity
        className="bg-white rounded-full px-3 py-1.5 shadow-lg flex-row items-center border border-greenTab"
        onPress={fetchPlants}
        disabled={isLoadingPlants}
      >
        {isLoadingPlants ? (
          <ActivityIndicator size="small" color={Colors.greenTab} />
        ) : (
          <Text className="text-greenTab font-medium text-sm">지도 새로고침</Text>
        )}
      </TouchableOpacity>
      {/* 필터링 토글 */}
        <TextToggle
          isActive={showOnlyMyPlants}
          activeText="내 식물만"
          inactiveText="모든 식물"
          onToggle={handleTogglePress}
        />
      </View>

     
        <NaverMapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialCamera={{
            latitude: latitude || 37.5666102,
            longitude: longitude || 126.9783881,
            zoom: 12,
          }}
        >
          {(showOnlyMyPlants ? myPlants : allPlants).map((plant: found_plants_columns) => (
            <NaverMapMarkerOverlay
              key={plant.id}
              latitude={plant.lat}
              longitude={plant.lng}
              onTap={() => handleMarkerPress(plant)}
              image={getFlowerImageForPlant(plant.type_code,plant.id)}
              width={16}
              height={16}
            />
          ))}
        </NaverMapView>     
    </View>
    
    <PlantDetailModal
      isVisible={isModalVisible}
      onClose={closeModal}
      selectedPlant={selectedPlant as found_plants_columns | null}
      markerPositionAtScreen={screenPosition}
    />

    <AddPlantFAB
      onNavigate={(screen, params) => navigation.navigate(screen as any, params)}
    />
  </Background>
}

