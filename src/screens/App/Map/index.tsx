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
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [foundPlants, setFoundPlants] = useState<FoundPlant[]>([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);
  const menuAnimation = useRef(new Animated.Value(1)).current;
  const buttonAnimation = useRef(new Animated.Value(1)).current;
  const menuheight = 125;

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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(menuAnimation, {
        toValue: isMenuOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: isMenuOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isMenuOpen]);

  const menuTranslateY = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [menuheight, 0],
  });

  const buttonTranslateY = buttonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -menuheight],
  });

  const handleCameraPress = () => {
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
    
    {/* 메뉴바 */}
    <Animated.View 
      className="py-6 px-4 absolute bottom-0 w-full rounded-t-3xl bg-white border-t border-l border-r border-gray-300"
      style={{
        transform: [{ translateY: menuTranslateY }],
        height: menuheight,
      }}
    ><Text className="text-lg font-bold">발견한 식물을 추가해 보세요!</Text>
     <View className="w-full flex-row justify-between mt-2">
      <TouchableOpacity 
        className="flex-1 py-4 rounded-md flex-row items-center justify-center border border-gray-300"
        onPress={handleCameraPress}
      >
       <CameraIcon style={{color: Colors.svggray, width: 20, height: 20,marginRight: 8}}/>
        <Text>카메라로 찍기</Text>
      </TouchableOpacity>
      <View className="w-4"/>
      <TouchableOpacity 
        className="flex-1 py-4 rounded-md flex-row items-center justify-center border border-gray-300"
        onPress={handleGalleryPress}
      >
        <ImageAddIcon style={{color: Colors.svggray, width: 20, height: 20,marginRight: 8}}/>
        <Text>앨범에서 사진 추가</Text>
      </TouchableOpacity>

     </View>
    </Animated.View>

    {/* 버튼 */}
    <Animated.View 
      className="absolute bottom-4 w-full items-center justify-center"
      style={{
        transform: [{ translateY: buttonTranslateY }],
      }}
    >
      <TouchableOpacity
        className="w-20 h-10 rounded-full bg-bluegray border border-gray-300 items-center justify-center"
        onPress={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? (
          <ChevronDownIcon style={{color: Colors.svggray, width: 20, height: 20}}/>
        ) : (
          <ChevronUpIcon style={{color: Colors.svggray, width: 20, height: 20}}/>
        )}
      </TouchableOpacity>
    </Animated.View>
  </Background>
}

