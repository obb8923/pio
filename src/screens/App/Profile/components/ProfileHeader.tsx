import { useState,useEffect } from "react";
import { View,Text,Platform } from "react-native";
import { AuthButton } from "./AuthButton";
import { Skeleton } from "../../../../components/Skeleton";
import { useAuthStore } from "../../../../store/authStore";
import { getUserNickname } from "../../../../libs/supabase/operations/users/getUserNickname";

// 프로필 헤더 컴포넌트
export const ProfileHeader = () => {
    const { isLoggedIn } = useAuthStore();
    const [nickname, setNickname] = useState<string | null>(null);
    const [nicknameLoading, setNicknameLoading] = useState(false);
    useEffect(() => {
      if (isLoggedIn) {
        setNicknameLoading(true);
        getUserNickname()
          .then((name) => setNickname(name))
          .finally(() => setNicknameLoading(false));
      }
    }, [isLoggedIn]);
    
    if (isLoggedIn) {
      // 로그인된 경우의 프로필 UI (닉네임 표시)
      return (
        <View className="flex-row items-center px-5 py-6 border-b border-greenTab ">
          {nicknameLoading ? (
            <Skeleton/>
          ) : (
            <Text className="text-lg font-bold text-greenTab">{nickname ?? "이름 없음"} 님</Text>
          )}
        </View>
      );
    }
    
    // 로그인 안 된 경우
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