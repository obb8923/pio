import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import {Background} from "../../../components/Background";
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import { useLocationStore } from "../../../store/locationStore";
import CameraIcon from "../../../../assets/svgs/Camera.svg";
import ImageAddIcon from "../../../../assets/svgs/ImageAdd.svg";

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

  return <Background>
    <View className="flex-1 p-4">
      {/* add buttons */}
      <View className="flex-row justify-between">
        <TouchableOpacity className="flex-row gap-2 h-10 rounded-md items-center justify-center bg-white border border-gray-300 p-2">
          <CameraIcon style={{color: "black", width: 20, height: 20}}/>
          <Text className="text-black">카메라</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row gap-2 h-10 rounded-md items-center justify-center bg-white border border-gray-300 p-2">
          <ImageAddIcon style={{color: "black", width: 20, height: 20}}/>
          <Text className="text-black">이미지 추가</Text>
        </TouchableOpacity>
      
      </View>
      {/* <NaverMapView
          style={{ flex: 1 }}
          initialCamera={INITIAL_CAMERA}
        /> */}
        <View className="mb-4">
          <Text>{latitude},{longitude},{isLoading},{error}</Text>
        </View>
        <TouchableOpacity
        className=" h-10 rounded-full bg-red-500 items-center justify-center"
        onPress={() => {
          console.log("test button pressed");
        }}
        >
          <Text className="text-white">Test Button</Text>
        </TouchableOpacity>
    </View>
  </Background>
}

