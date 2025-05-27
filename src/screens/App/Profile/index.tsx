import React, { useEffect, useState } from "react";
import { View, Text, SectionList, TouchableOpacity, SectionListData, ActivityIndicator } from "react-native";
import { useAuthStore } from "../../../store/authStore"; // 경로는 실제 위치에 맞게 수정
import { Colors } from "../../../constants/Colors";
import { getUserNickname } from "../../../libs/supabase/supabaseOperations";
// 아이템 타입 정의
interface ProfileItem {
  label: string;
  isVersion?: boolean;
  isProfile?: boolean;
}

const SECTIONS: { title?: string; data: ProfileItem[] }[] = [
  {
    data: [
      { label: "", isProfile: true },
    ],
  },
  {
    title: "회원 설정",
    data: [
      { label: "회원 정보" },
      { label: "차단 회원" },
    ],
  },
  {
    title: "고객센터",
    data: [
      { label: "공지사항" },
      { label: "FAQ" },
      { label: "문의/제휴" },
    ],
  },
  {
    title: "약관 및 정책",
    data: [
      { label: "이용약관" },
      { label: "개인정보처리방침" },
      { label: "운영정책" },
    ],
  },
  {
    data: [
      { label: "버전 2.13.5", isVersion: true },
    ],
  },
];

// 리스트 아이템 컴포넌트 분리
const ProfileListItem = ({ item }: { item: ProfileItem }) => {
  const { isLoggedIn, isLoading } = useAuthStore();
  const [nickname, setNickname] = useState<string | null>(null);
  const [nicknameLoading, setNicknameLoading] = useState(false);

  useEffect(() => {
    if (item.isProfile && isLoggedIn) {
      setNicknameLoading(true);
      getUserNickname()
        .then((name) => setNickname(name))
        .finally(() => setNicknameLoading(false));
    }
  }, [item.isProfile, isLoggedIn]);

  if (item.isVersion) {
    return (
      <Text className="text-center text-xs text-gray-400 my-4">{item.label}</Text>
    );
  }
  if (item.isProfile) {
    if (isLoading) {
      return (
        <View className="py-8 items-center">
          <ActivityIndicator size="small" color={Colors.matcha} />
        </View>
      );
    }
    if (isLoggedIn) {
      // 로그인된 경우의 프로필 UI (닉네임 표시)
      return (
        <View className="flex-row items-center px-5 py-6 bg-white">
          {/* 예시: 프로필 이미지, 이름, 이메일 등 */}
          <View className="w-16 h-16 rounded-full bg-gray-200 mr-4" />
          <View>
            {nicknameLoading ? (
              <ActivityIndicator size="small" color={Colors.matcha} />
            ) : (
              <Text className="text-lg font-bold text-gray-900">{nickname ?? "이름 없음"}</Text>
            )}
            <Text className="text-sm text-gray-500">user@email.com</Text>
          </View>
        </View>
      );
    }
    // 로그인 안 된 경우
    return (
      <View className="items-center py-8 bg-white">
        <Text className="text-base text-gray-700 mb-2">로그인이 필요합니다</Text>
        <TouchableOpacity className="bg-orange-500 px-6 py-2 rounded-full">
          <Text className="text-white font-bold">로그인하기</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <TouchableOpacity className="bg-white py-4 px-5">
      <Text className="text-base text-gray-900">{item.label}</Text>
    </TouchableOpacity>
  );
};

export const ProfileScreen = () => {
  return (
    <View className="flex-1 bg-white pt-10">
      <Text className="text-2xl font-bold text-black ml-5 mb-4">프로필</Text>
      <SectionList
        sections={SECTIONS}
        keyExtractor={(item, index) => item.label + index}
        renderItem={({ item }) => <ProfileListItem item={item} />}
        renderSectionHeader={({ section: { title } }) =>
          title ? (
            <Text className="text-sm font-bold bg-gray-100 py-2 px-5 text-gray-500">{title}</Text>
          ) : null
        }
        ItemSeparatorComponent={() => <View className="h-px bg-gray-200 ml-5" />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

