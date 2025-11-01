import {View,Text,TouchableOpacity} from "react-native"
import { useTranslation } from 'react-i18next';

export const MapModalButton = ({isLocationSelected,onOpenModal}: {isLocationSelected: boolean,onOpenModal: (modalType: 'map' | 'memo' | 'reviewRequest') => void}) => {
  const { t } = useTranslation('domain');
  return (
    <View className="bg-gray-100 pl-4 rounded-full flex-row justify-between items-center">
              <View className="h-full w-auto py-4">
                <Text className="text-greenTab text-center font-medium">
                  {isLocationSelected ? t('map.location.locationSelected') : t('map.location.selectLocation')}
                </Text>
              </View>
              <TouchableOpacity 
                className="p-4 bg-greenTab rounded-full justify-center items-center"
                onPress={() => onOpenModal('map')}
              >
                <Text className="text-greenActive text-center font-medium">
                  {isLocationSelected ? t('map.location.edit') : t('map.location.select')}
                </Text>
              </TouchableOpacity>
            </View>
  )
}