import { View, Text } from "react-native";
import { type MaintenanceResponse } from "../../libs/supabase/operations/normal/checkMaintenance";
import { Background } from "../../components/Background";
type MaintenanceScreenProps = {
  maintenanceData: MaintenanceResponse;
};

export const MaintenanceScreen = ({ maintenanceData }: MaintenanceScreenProps) => {
  return (
    <Background isStatusBarGap={true} isTabBarGap={true}>
      <View className="flex-1 justify-center items-center">
      <View className="justify-center items-center bg-white p-5 w-full">
        <Text className="text-2xl font-bold mb-2.5 text-greenTab900">현재 점검 중입니다</Text>
        {/* <Text className="text-base text-[#666666] text-center mb-1.5">{maintenanceData.message}</Text> */}
        <Text className="text-sm text-[#999999]">예상 종료: {formatUntil(maintenanceData.until)}</Text>
        </View>

      </View>
    </Background>
  );
};

const formatUntil = (until: string | null) => {
  if (!until) return "정보 없음";
  const date = new Date(until);
  return date.toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};
