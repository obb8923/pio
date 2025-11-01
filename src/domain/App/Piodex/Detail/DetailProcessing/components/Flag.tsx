import { View, Text } from "react-native"
import { useTranslation } from 'react-i18next';

export const Flag = () => {
  const { t } = useTranslation('domain');
  return (
    <View className="flex justify-center items-center z-10 absolute top-16 left-0 bg-greenTab rounded-r-full w-auto h-auto py-2 pr-2 pl-0">
    <View className="flex justify-center items-start p-4 border border-greenActive border-l-0 w-auto h-full rounded-r-full">
   <Text className="text-greenActive font-medium">{t('piodex.detailProcessing.title')}</Text>
   </View>
   </View>
  )
}