import { View, Text, TouchableOpacity, ActivityIndicator, Animated, Alert } from "react-native";
import {Background} from "../../../components/Background";
import { NaverMapMarkerOverlay, NaverMapView } from '@mj-studio/react-native-naver-map';
import { useLocationStore } from "../../../store/locationStore";
import CameraIcon from "../../../../assets/svgs/Camera.svg";
import ImageAddIcon from "../../../../assets/svgs/ImageAdd.svg";
import ChevronUpIcon from "../../../../assets/svgs/ChevronUp.svg";
import ChevronDownIcon from "../../../../assets/svgs/ChevronDown.svg";
import { Colors } from "../../../constants/Colors";
import { useState, useRef, useEffect } from "react";
import {MapStackParamList} from "../../../nav/stack/Map"
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getFoundPlants } from "../../../libs/supabase/supabaseOperations";
import { TAB_BAR_HEIGHT } from "../../../constants/TabNavOptions";
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

export const MapScreen = ({navigation}:MapScreenProps) => {
  const { latitude, longitude, isLoading, error } = useLocationStore();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [foundPlants, setFoundPlants] = useState<FoundPlant[]>([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  // 발견된 식물 데이터 가져오기
  useEffect(() => {
    const fetchFoundPlants = async () => {
      try {
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
  }, []);

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

  const toggleFab = () => {
    setIsFabOpen(!isFabOpen);
  };

  const handleCameraPress = () => {
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

  const handleGalleryPress = () => {
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
    Alert.alert(
      plant.plant_name || '이름 없는 식물',
      `${plant.description || '설명 없음'}\n\n메모: ${plant.memo || '메모 없음'}`,
      [
        {
          text: '확인',
          style: 'default'
        }
      ]
    );
  };

  // 애니메이션 값들
  const cameraButtonTranslateY = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  const galleryButtonTranslateY = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -140],
  });

  const buttonScale = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const overlayOpacity = overlayAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return <Background>
    <View className="flex-1">
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
            image={require('../../../../assets/pngs/flowers/flower1.png')}
            width={32}
            height={32}
          />
        ))}
      </NaverMapView>
    </View>
    
    {/* Extended FAB */}
    <View className="absolute" style={{ bottom: TAB_BAR_HEIGHT + 20, right: 20 }}>
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
        <Text className="text-greenActive text-lg font-bold ml-2">발견한 식물 추가하기</Text>
        
      </TouchableOpacity>
    </View>
  </Background>
}

