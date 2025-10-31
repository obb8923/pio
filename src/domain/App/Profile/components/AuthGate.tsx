import { View,Text,Platform } from "react-native";
import { AuthButton } from "@domain/App/Profile/components/AuthButton.tsx";

export const AuthGate = () => {    
    return (
      <View className="items-center py-8 rounded-lg">
        <Text className="text-base text-gray-700 mb-2">로그인이 필요합니다</Text>
        <View className="flex-row justify-between items-center gap-4">
       <AuthButton type="Google"/>
       {Platform.OS === 'ios' && <AuthButton type="Apple"/>}
       {Platform.OS === 'ios' && <AuthButton type="Email"/>}

       </View>
      </View>
    );
  
  };