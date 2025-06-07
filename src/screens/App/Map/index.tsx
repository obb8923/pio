import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import {Background} from "../../../components/Background";
import { NaverMapMarkerOverlay, NaverMapView } from '@mj-studio/react-native-naver-map';
import { useLocationStore } from "../../../store/locationStore";
import { Colors } from "../../../constants/Colors";
import { useState, useCallback, useEffect } from "react";
import {MapStackParamList} from "../../../nav/stack/Map"
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import React from "react";
import { useAuthStore } from "../../../store/authStore";
import { TextToggle } from "../../../components/TextToggle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlantDetailModal } from "./components/PlantDetailModal";
import { AddPlantFAB } from "./components/AddPlantFAB";
import { useFoundPlants } from "./hooks/useFoundPlants";
import { useMapMarkers } from "./hooks/useMapMarkers";
import { getFlowerImageForPlant } from "./utils/markerUtils";
import { usePermissionStore } from "../../../store/permissionStore";
import { useVisitStore } from "../../../store/visitStore";
import { RootStackParamList } from "../../../nav/stack/Root";

type MapStack = NativeStackScreenProps<MapStackParamList,'Map'>
type RootStack = NativeStackScreenProps<RootStackParamList>
type MapScreenProps = CompositeScreenProps<MapStack, RootStack>;
export const MapScreen = ({navigation}:MapScreenProps) => {
  const { latitude, longitude } = useLocationStore();
  const [showOnlyMyPlants, setShowOnlyMyPlants] = useState(false);
  const { userId } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { camera, photoLibrary, location, isInitialized } = usePermissionStore();
  const { isFirstVisit, setFirstVisit } = useVisitStore();
  // 커스텀 훅 사용
  const { foundPlants, isLoading: isLoadingPlants, refreshPlants } = useFoundPlants(showOnlyMyPlants);
  const { selectedPlant, isModalVisible, handleMarkerPress, closeModal } = useMapMarkers();
  
  useEffect(() => {
    if (isFirstVisit && isInitialized) {
      setFirstVisit(false);
      console.log('isInitialized',isInitialized);
      console.log('camera',camera);
      console.log('photoLibrary',photoLibrary);
      console.log('location',location);
      console.log('isFirstVisit',isFirstVisit);
      if (!camera || !photoLibrary || !location) {
        navigation.navigate('PermissionScreen');
      }
    }
  }, [isInitialized, camera, photoLibrary, location]);
  // 화면이 포커스될 때마다 식물 데이터 가져오기
  useFocusEffect(
    useCallback(() => {
      refreshPlants();
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
        onPress={refreshPlants}
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
        style={{ flex: 1 }}
        initialCamera={{
          latitude: latitude || 37.5666102,
          longitude: longitude || 126.9783881,
          zoom: 12,
        }}
      >
        {foundPlants.map((plant) => (
          <NaverMapMarkerOverlay
            key={plant.id}
            latitude={plant.lat}
            longitude={plant.lng}
            onTap={() => handleMarkerPress(plant)}
            image={getFlowerImageForPlant(plant.id)}
            width={16}
            height={16}
          />
        ))}
      </NaverMapView>
    </View>
    
    <PlantDetailModal
      isVisible={isModalVisible}
      onClose={closeModal}
      selectedPlant={selectedPlant}
    />

    <AddPlantFAB
      onNavigate={(screen, params) => navigation.navigate(screen as any, params)}
    />
  </Background>
}

