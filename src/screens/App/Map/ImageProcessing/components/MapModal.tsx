import { NaverMapView, NaverMapMarkerOverlay, Camera } from "@mj-studio/react-native-naver-map"
import { View, Text, Modal } from "react-native"
import { CustomButton } from "../../../../../components/CustomButton";

interface MapModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
  center: Camera;
  onCameraChange: (camera: Camera) => void;
}

export const MapModal = ({ isVisible, onClose, onComplete, center, onCameraChange }: MapModalProps) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
    >
      {/* 배경 검은색 오버레이 */}
      <View className="flex-1 bg-black/50">
        {/* 내부 영역*/}
        <View className="flex-1 relative mx-4 my-20 pt-20 pb-20 border border-greenTab900 rounded-3xl bg-greenTab">
          <View className="absolute top-0 left-0 right-0 h-20 items-start justify-end px-4 py-2">
            <Text className="text-center text-lg text-greenActive">지도를 움직여서 발견한 위치를 선택해 주세요</Text>
          </View>
          <NaverMapView
            style={{ width: '100%', height: '100%'}}
            initialCamera={{
              latitude: center.latitude,
              longitude: center.longitude,
              zoom: center.zoom,
            }}
            onCameraChanged={onCameraChange}
          >
            <NaverMapMarkerOverlay 
              latitude={center.latitude}
              longitude={center.longitude}
              image={require('../../../../../../assets/pngs/flowers/flower1.png')}
              width={24}
              height={24}
            />
          </NaverMapView>
          {/* modal button section */}
          <View className="h-20 flex-row justify-between items-center gap-4 px-4">
            <CustomButton text="취소" size={60} onPress={onClose}/>
            <CustomButton text="완료" size={70} onPress={onComplete}/>
          </View>
        </View>
      </View>
    </Modal>
  )
}

