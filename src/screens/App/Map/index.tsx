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
  const { latitude, longitude, isLoading, error } = useLocationStore();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [foundPlants, setFoundPlants] = useState<FoundPlant[]>([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);
  const [showOnlyMyPlants, setShowOnlyMyPlants] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<FoundPlant | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;
  const { userId } = useAuthStore();
  const insets = useSafeAreaInsets();
  // 권한 상태 가져오기
  const {
    camera: cameraPermission,
    photoLibrary: photoLibraryPermission,
    setCameraPermission,
    setPhotoLibraryPermission,
  } = usePermissionStore();

  // 발견된 식물 데이터 가져오기 - 화면이 포커스될 때마다 실행
  useFocusEffect(
    React.useCallback(() => {
      const fetchFoundPlants = async () => {
        try {
          setIsLoadingPlants(true);
          const plants = showOnlyMyPlants 
            ? await getCurrentUserFoundPlants()
            : await getFoundPlants();
          if (plants) {
            setFoundPlants(plants);
          }
        } catch (error) {
          console.error('Error fetching found plants:', error);
          Alert.alert('오류', '식물 데이터를 가져오는 중 오류가 발생했습니다.');
        } finally {
          setIsLoadingPlants(false);
        }
      };

      fetchFoundPlants();
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

    // FAB을 열려고 할 때 권한 확인 및 요청
    let currentCameraPermission = cameraPermission;
    let currentPhotoLibraryPermission = photoLibraryPermission;

    if (!currentCameraPermission || !currentPhotoLibraryPermission) {
      const permissionsToRequest: Permission[] = [];
      if (!currentCameraPermission) {
        permissionsToRequest.push(
          Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA
        );
      }
      if (!currentPhotoLibraryPermission) {
        permissionsToRequest.push(
          Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY :
          (typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version) >= 33 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
        );
      }

      if (permissionsToRequest.length > 0) {
        const statuses = await requestMultiple(permissionsToRequest);
        const cameraStatus = statuses[Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA];
        const photoStatus = statuses[
          Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY :
          (typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version) >= 33 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
        ];

        if (cameraStatus !== undefined) {
          const granted = cameraStatus === RESULTS.GRANTED;
          setCameraPermission(granted);
          currentCameraPermission = granted;
        }
        if (photoStatus !== undefined) {
          const granted = photoStatus === RESULTS.GRANTED;
          setPhotoLibraryPermission(granted);
          currentPhotoLibraryPermission = granted;
        }
      }
    }

    if (currentCameraPermission && currentPhotoLibraryPermission) {
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

  const handleCameraPress = async () => {
    const hasPermission = usePermissionStore.getState().camera;
    if (!hasPermission) {
      setIsFabOpen(false); // FAB 닫기
      Alert.alert(
        "카메라 권한 필요",
        "카메라를 사용하려면 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
        [
          { text: "취소", style: "cancel" },
          { text: "설정으로 이동", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    setIsFabOpen(false);
    launchCamera({
      mediaType: 'photo',
      quality: 1,
    }, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('오류', '카메라 실행 중 오류가 발생했습니다.');
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        navigation.navigate('ImageProcessing', {
          imageUri: response.assets[0].uri,
        });
      } else {
        Alert.alert('오류', '이미지를 가져올 수 없습니다.');
      }
    });
  };

  const handleGalleryPress = async () => {
    const hasPermission = usePermissionStore.getState().photoLibrary;
    if (!hasPermission) {
      setIsFabOpen(false); // FAB 닫기
      Alert.alert(
        "앨범 접근 권한 필요",
        "앨범에서 사진을 선택하려면 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
        [
          { text: "취소", style: "cancel" },
          { text: "설정으로 이동", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    setIsFabOpen(false);
    launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    }, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('오류', '갤러리 실행 중 오류가 발생했습니다.');
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        navigation.navigate('ImageProcessing', {
          imageUri: response.assets[0].uri,
        });
      } else {
        Alert.alert('오류', '이미지를 가져올 수 없습니다.');
      }
    });
  };

  const handleMarkerPress = async (plant: FoundPlant) => {
    try {
      const signedUrl = await getSignedUrls(plant.image_url);
      // signedUrl이 배열이면 첫 번째 요소를 사용, 아니면 그대로 사용
      const finalSignedUrl = Array.isArray(signedUrl) ? signedUrl[0] : signedUrl;
      setSelectedPlant({ ...plant, signed_url: finalSignedUrl || undefined });
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error getting signed URL:', error);
      setSelectedPlant(plant);
      setIsModalVisible(true);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoadingPlants(true);
      const plants = showOnlyMyPlants 
        ? await getCurrentUserFoundPlants()
        : await getFoundPlants();
      if (plants) {
        setFoundPlants(plants);
      }
    } catch (error) {
      console.error('Error refreshing plants:', error);
      Alert.alert('오류', '식물 데이터를 새로고침하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingPlants(false);
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

  // 애니메이션 값들
  const cameraButtonTranslateY = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const galleryButtonTranslateY = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const buttonScale = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return <Background >
    <View className="flex-1">
      {/* 상단 네비게이션 바 */}
      <View className="absolute h-10 px-4 z-10 flex-row items-center justify-between w-full" style={{marginTop: insets.top + 10}}>
         {/* 새로고침 버튼 */}
      <TouchableOpacity
        className="bg-white rounded-full px-3 py-1.5 shadow-lg flex-row items-center border border-greenTab"
        onPress={handleRefresh}
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
    
    {/* 식물 정보 모달 */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%] min-h-[50%]">
          <ScrollView 
            className="p-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 100}}
          >
            <View className="flex-row justify-start items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                {selectedPlant?.plant_name || '이름 없는 식물'}
              </Text>
            </View>
            
            {(selectedPlant?.signed_url || selectedPlant?.image_url) && (
              <Image
                source={{ uri: selectedPlant?.signed_url || selectedPlant?.image_url }}
                className="w-full h-48 rounded-lg mb-4"
                resizeMode="cover"
                onError={() => {
                  console.log('이미지 로드 실패', selectedPlant?.signed_url, 'signed_url', selectedPlant?.image_url, 'image_url');
                }}
              />
            )}
            
            <View className="mb-4">
              <Text className="text-gray-600 mb-2">
                {selectedPlant?.description || '설명 없음'}
              </Text>
              <Text className="text-gray-500">
                메모: {selectedPlant?.memo || '메모 없음'}
              </Text>
            </View>
          </ScrollView>
          <View className="absolute bottom-6 left-0 right-0 justify-center items-center">
            <CustomButton
              text="닫기"
              size={60}
              onPress={() => setIsModalVisible(false)}
            />
          </View>
        </View>
      </View>
    </Modal>

    {/* Extended FAB */}
    <View className="w-1/2 absolute" style={{ bottom: TAB_BAR_HEIGHT + 20, right: 20 }}>
      {/* 갤러리 버튼 */}
      <Animated.View
        style={{
          transform: [
            { translateY: galleryButtonTranslateY },
            { scale: buttonScale }
          ],
          opacity: fabAnimation,
        }}
      >
        <TouchableOpacity
          className="bg-greenTab rounded-full px-6 py-4 flex-row justify-center items-center shadow-lg"
          onPress={handleGalleryPress}
        >
          <ImageAddIcon style={{color: Colors.greenActive, width: 20, height: 20, marginRight: 8}}/>
          <Text className="text-greenActive font-medium">앨범에서 선택</Text>
        </TouchableOpacity>
      </Animated.View>
      {/* 카메라 버튼 */}
      <Animated.View
        style={{
          transform: [
            { translateY: cameraButtonTranslateY },
            { scale: buttonScale }
          ],
          opacity: fabAnimation,
        }}
      >
        <TouchableOpacity
          className="bg-greenTab rounded-full px-6 py-4 flex-row justify-center items-center shadow-lg"
          onPress={handleCameraPress}
        >
          <CameraIcon style={{color: Colors.greenActive, width: 20, height: 20, marginRight: 8}}/>
          <Text className="text-greenActive font-medium">카메라로 찍기</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 메인 Extended FAB */}
      <TouchableOpacity
        className="bg-greenTab rounded-full px-6 py-4 flex-row justify-center items-center shadow-lg"
        style={{opacity: isFabOpen ? 0.7 : 1}}
        onPress={toggleFab}
      >
        <Animated.Text
          className="text-greenActive text-3xl font-bold"
          style={{
            transform: [{ rotate: isFabOpen ? '45deg' : '0deg' }]
          }}
        >
          +
        </Animated.Text>
        {!isFabOpen && (
          <Text className="text-greenActive text-lg font-bold ml-2">발견한 식물 추가하기</Text>
        )}
        
      </TouchableOpacity>
    </View>
  </Background>
}

