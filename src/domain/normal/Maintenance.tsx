import { View, Text } from "react-native";
import { useTranslation } from 'react-i18next';
import { type MaintenanceResponse } from "@libs/supabase/operations/normal/checkMaintenance";
import { Background } from "@components/Background";
type MaintenanceScreenProps = {
  maintenanceData: MaintenanceResponse;
};

export const MaintenanceScreen = ({ maintenanceData }: MaintenanceScreenProps) => {
  const { t, i18n } = useTranslation('domain');
  return (
    <Background isStatusBarGap={true} isTabBarGap={true}>
      <View className="flex-1 justify-center items-center">
      <View className="justify-center items-center bg-white p-5 w-full">
        <Text className="text-2xl font-bold mb-2.5 text-greenTab900">{t('maintenance.title')}</Text>
        {/* <Text className="text-base text-[#666666] text-center mb-1.5">{maintenanceData.message}</Text> */}
        <Text className="text-sm text-[#999999]">{t('maintenance.expectedEnd')}: {formatUntil(maintenanceData.until, i18n.language)}</Text>
        </View>

      </View>
    </Background>
  );
};

const formatUntil = (until: string | null, lang: string) => {
  if (!until) return "";
  const date = new Date(until);
  const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
  return date.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};
