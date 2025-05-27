import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import {Background} from "../../../components/Background";
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import { useLocationStore } from "../../../store/locationStore";
import CameraIcon from "../../../../assets/svgs/Camera.svg";
import ImageAddIcon from "../../../../assets/svgs/ImageAdd.svg";
import ChevronUpIcon from "../../../../assets/svgs/ChevronUp.svg";
import ChevronDownIcon from "../../../../assets/svgs/ChevronDown.svg";
import { Colors } from "../../../constants/Colors";
import { useState, useRef, useEffect } from "react";
// 초기 카메라 위치 설정
/*
const INITIAL_CAMERA = {
  latitude: 37.5666102,  // 서울 중심부 위도
  longitude: 126.9783881,  // 서울 중심부 경도
  zoom: 12,  // 줌 레벨
};
*/

export const MapScreen = () => {
  const { latitude, longitude, isLoading, error } = useLocationStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const buttonAnimation = useRef(new Animated.Value(0)).current;
const menuheight = 125;
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

  return <Background>
    <View className="flex-1">
     
      {/* <NaverMapView
          style={{ flex: 1 }}
          initialCamera={INITIAL_CAMERA}
        /> */}
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
      <TouchableOpacity className="flex-1 py-4 rounded-md flex-row items-center justify-center border border-gray-300">
       <CameraIcon style={{color: Colors.svggray, width: 20, height: 20,marginRight: 8}}/>
        <Text>카메라로 찍기</Text>
      </TouchableOpacity>
      <View className="w-4"/>
      <TouchableOpacity className="flex-1 py-4 rounded-md flex-row items-center justify-center border border-gray-300">
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

