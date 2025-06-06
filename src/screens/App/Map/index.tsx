
import { View, Text, TouchableOpacity, Animated, Alert, ActivityIndicator, Platform, Linking, Modal, Image, ScrollView } from "react-native";
import {Background} from "../../../components/Background";
import { NaverMapMarkerOverlay, NaverMapView } from '@mj-studio/react-native-naver-map';
import { useLocationStore } from "../../../store/locationStore";
import { Colors } from "../../../constants/Colors";
import { useState, useRef, useEffect, useCallback } from "react";
import {MapStackParamList} from "../../../nav/stack/Map"
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../../../store/authStore";
import { TextToggle } from "../../../components/TextToggle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlantDetailModal } from "./components/PlantDetailModal";
import { AddPlantFAB } from "./components/AddPlantFAB";
import { useFoundPlants } from "./hooks/useFoundPlants";
import { usePermissions } from "./hooks/usePermissions";
import { useMapMarkers } from "./hooks/useMapMarkers";
import { getFlowerImageForPlant } from "./utils/markerUtils";

type MapScreenProps = NativeStackScreenProps<MapStackParamList,'Map'>

export const MapScreen = ({navigation}:MapScreenProps) => {
  const { latitude, longitude } = useLocationStore();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showOnlyMyPlants, setShowOnlyMyPlants] = useState(false);
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;
  const { userId } = useAuthStore();
  const insets = useSafeAreaInsets();

  // 커스텀 훅 사용
  const { foundPlants, isLoading: isLoadingPlants, refreshPlants } = useFoundPlants(showOnlyMyPlants);
  const { checkAndRequestPermissions } = usePermissions();
  const { selectedPlant, isModalVisible, handleMarkerPress, closeModal } = useMapMarkers();

  // 화면이 포커스될 때마다 식물 데이터 가져오기
  useFocusEffect(
    useCallback(() => {
      refreshPlants();
    }, [showOnlyMyPlants])
  );

  // FAB 애니메이션
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fabAnimation, {
        toValue: isFabOpen ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnimation, {
        toValue: isFabOpen ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFabOpen]);

  const toggleFab = async () => {
    if (isFabOpen) {
      setIsFabOpen(false);
      return;
    }

    const { hasAllPermissions } = await checkAndRequestPermissions();
    
    if (hasAllPermissions) {
      setIsFabOpen(true);
    } else {
      Alert.alert(
        "권한 필요",
        "식물 추가 기능을 사용하려면 카메라 및 앨범 접근 권한이 모두 필요합니다. 설정에서 권한을 허용해주세요.",
        [
          { text: "취소", style: "cancel" },
          { text: "설정으로 이동", onPress: () => Linking.openSettings() }
        ]
      );
    }
  };

  const handleTogglePress = () => {
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
  };

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
      isFabOpen={isFabOpen}
      onToggleFab={toggleFab}
      onNavigate={(screen, params) => navigation.navigate(screen as any, params)}
    />
  </Background>
}

