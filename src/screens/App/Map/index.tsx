import { View, Text, TouchableOpacity, Animated, Alert, ActivityIndicator, Platform, Linking, Modal, Image, ScrollView } from "react-native";
import {Background} from "../../../components/Background";
import { NaverMapMarkerOverlay, NaverMapView } from '@mj-studio/react-native-naver-map';
import { useLocationStore } from "../../../store/locationStore";
import CameraIcon from "../../../../assets/svgs/Camera.svg";
import ImageAddIcon from "../../../../assets/svgs/ImageAdd.svg";
import { Colors } from "../../../constants/Colors";
import { useState, useRef, useEffect } from "react";
import {MapStackParamList} from "../../../nav/stack/Map"
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { getFoundPlants, getCurrentUserFoundPlants, getSignedUrls } from "../../../libs/supabase/supabaseOperations";
import { TAB_BAR_HEIGHT } from "../../../constants/TabNavOptions";
import React from "react";
import { usePermissionStore } from "../../../store/permissionStore";
import { requestMultiple, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import { useAuthStore } from "../../../store/authStore";
import { TextToggle } from "../../../components/TextToggle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomButton } from "../../../components/CustomButton";
import { PlantDetailModal } from "./components/PlantDetailModal";
import { AddPlantFAB } from "./components/AddPlantFAB";
import { useFoundPlants } from "./hooks/useFoundPlants";
import { usePermissions } from "./hooks/usePermissions";
import { useMapMarkers } from "./hooks/useMapMarkers";

type MapScreenProps = NativeStackScreenProps<MapStackParamList,'Map'>

type FoundPlant = {
  id: string;
  lat: number;
  lng: number;
  image_url: string;
  plant_name: string;
  description: string;
  memo: string;
  signed_url?: string;
};

const flowerImages = [
  require('../../../../assets/pngs/flowers/flower1.png'),
  require('../../../../assets/pngs/flowers/flower2.png'),
  require('../../../../assets/pngs/flowers/flower3.png'),
  require('../../../../assets/pngs/flowers/flower4.png'),
  require('../../../../assets/pngs/flowers/flower5.png'),
  require('../../../../assets/pngs/flowers/flower6.png'),
  require('../../../../assets/pngs/flowers/flower7.png'),
  require('../../../../assets/pngs/flowers/flower8.png'),
];

const getFlowerImageForPlant = (plantId: string) => {
  // 식물 ID의 마지막 문자를 숫자로 변환하여 이미지 인덱스로 사용
  const lastChar = plantId.slice(-1);
  // 0-9 사이의 숫자만 사용하고, 1-8 사이로 매핑
  const num = parseInt(lastChar);
  const index = (isNaN(num) ? 0 : num) % 8;
  return flowerImages[index];
};

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
    React.useCallback(() => {
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

