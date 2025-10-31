import {View,Text,TouchableOpacity} from "react-native"
export const MapModalButton = ({isLocationSelected,onOpenModal}: {isLocationSelected: boolean,onOpenModal: (modalType: 'map' | 'memo' | 'reviewRequest') => void}) => {
  return (
    <View className="bg-gray-100 pl-4 rounded-full flex-row justify-between items-center">
              <View className="h-full w-auto py-4">
                <Text className="text-greenTab text-center font-medium">
                  {isLocationSelected ? "위치가 선택되었습니다" : "발견한 곳을 선택해 주세요"}
                </Text>
              </View>
              <TouchableOpacity 
                className="p-4 bg-greenTab rounded-full justify-center items-center"
                onPress={() => onOpenModal('map')}
              >
                <Text className="text-greenActive text-center font-medium">
                  {isLocationSelected ? "수정하기" : "선택하기"}
                </Text>
              </TouchableOpacity>
            </View>
  )
}