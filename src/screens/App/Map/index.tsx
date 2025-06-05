import { View, Text, TouchableOpacity, Animated, Alert, ActivityIndicator, Platform, Linking } from "react-native";
import {Background} from "../../../components/Background";
import { NaverMapMarkerOverlay, NaverMapView } from '@mj-studio/react-native-naver-map';
import { useLocationStore } from "../../../store/locationStore";
import CameraIcon from "../../../../assets/svgs/Camera.svg";
import ImageAddIcon from "../../../../assets/svgs/ImageAdd.svg";
import RefreshIcon from "../../../../assets/svgs/Refresh.svg";
import { Colors } from "../../../constants/Colors";
import { useState, useRef, useEffect } from "react";
import {MapStackParamList} from "../../../nav/stack/Map"
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { getFoundPlants } from "../../../libs/supabase/supabaseOperations";
import { TAB_BAR_HEIGHT } from "../../../constants/TabNavOptions";
import React from "react";
import { usePermissionStore } from "../../../store/permissionStore";
import { requestMultiple, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';

type MapScreenProps = NativeStackScreenProps<MapStackParamList,'Map'>

type FoundPlant = {
  id: string;
  lat: number;
  lng: number;
  image_url: string;
  plant_name: string;
  description: string;
  memo: string;
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
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

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
          const plants = await getFoundPlants();
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
    }, [])
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

  const handleMarkerPress = (plant: FoundPlant) => {
    //일단 아무 기능 없게 해놓고 나중에 추가할 예정
    // Alert.alert(
    //   plant.plant_name || '이름 없는 식물',
    //   `${plant.description || '설명 없음'}\n\n메모: ${plant.memo || '메모 없음'}`,
    //   [
    //     {
    //       text: '확인',
    //       style: 'default'
    //     }
    //   ]
    // );
  };

  const handleRefresh = async () => {
    try {
      setIsLoadingPlants(true);
      const plants = await getFoundPlants();
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

  return <Background>
    <View className="flex-1">
      {/* 새로고침 버튼 */}
      <TouchableOpacity
        className="absolute top-14 left-4 z-10 bg-white rounded-full px-4 py-2 shadow-lg flex-row items-center"
        onPress={handleRefresh}
        disabled={isLoadingPlants}
      >
        {isLoadingPlants ? (
          <ActivityIndicator size="small" color={Colors.greenTab} />
        ) : (
          <Text className="text-greenTab font-medium">지도 새로고침</Text>
        )}
      </TouchableOpacity>

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

