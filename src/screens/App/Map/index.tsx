import { View, Text } from "react-native";
import {Background} from "../../../components/Background";
import { NaverMapView } from '@mj-studio/react-native-naver-map';
// 초기 카메라 위치 설정
const INITIAL_CAMERA = {
  latitude: 37.5666102,  // 서울 중심부 위도
  longitude: 126.9783881,  // 서울 중심부 경도
  zoom: 12,  // 줌 레벨
};
export const MapScreen = () => {
  return <Background>
    <View className="flex-1">
      <Text>Map</Text>
      <NaverMapView
          style={{ flex: 1 }}
          initialCamera={INITIAL_CAMERA}
        />
    </View>
  </Background>
}

