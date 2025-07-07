import React, { useEffect, useState } from "react";
import { View, Text, SectionList, Image, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { useDictionaryStore } from "../../../../store/dictionaryStore";
import { SUPABASE_URL} from '@env';
import {DICTIONARY_BUCKET_NAME} from '../../../../constants/normal'
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PiodexStackParamList } from "../../../../nav/stack/Piodex";
const SEASON_LABELS = ["봄", "여름", "가을", "겨울"];

function getPublicImageUrl(fileName: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${DICTIONARY_BUCKET_NAME}/${fileName}`;
}

export const DictionaryTab = () => {
  const { dictionary, fetchDictionary, loading } = useDictionaryStore();
  const [refreshing, setRefreshing] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  // 섹션별 펼침/접힘 상태 관리
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true, 3: true });
  const navigation = useNavigation<NativeStackNavigationProp<PiodexStackParamList>>();

  useEffect(() => {
    if (!dictionary) fetchDictionary();
  }, []);

  // 섹션 토글 함수
  const toggleSection = (idx: number) => {
    setOpenSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // season별로 그룹핑 (dictionary 사용)
  const sections = React.useMemo(() => {
    if (!dictionary) return [];
    const seasonGroups: Record<number, any[]> = {
      0: [], 1: [], 2: [], 3: []
    };
    dictionary.forEach((item) => {
      if (Array.isArray(item.season)) {
        item.season.forEach((isInSeason: boolean, idx: number) => {
          if (isInSeason) {
            seasonGroups[idx].push(item);
          }
        });
      }
    });
    return SEASON_LABELS.map((label, idx) => ({
      title: label,
      idx,
      data: openSections[idx] ? [seasonGroups[idx]] : [],
    })).filter((section) => seasonGroups[section.idx].length > 0);
  }, [dictionary, openSections]);

  // 새로고침 핸들러
  const onRefresh = () => {
    setRefreshing(true);
    fetchDictionary().finally(() => setRefreshing(false));
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="text-gray-500 mt-2">데이터를 불러오는 중...</Text>
      </View>
    );
  }

  if (!dictionary || dictionary.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500 text-center">사전 데이터가 없습니다.</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) => `section-${index}`}
      renderSectionHeader={({ section: { title, idx } }) => (
        <TouchableOpacity onPress={() => toggleSection(idx)}>
          <Text className="font-semibold py-2 my-2 rounded-md">
            {title} {openSections[idx] ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>
      )}
      renderItem={({ item: plantsInSection }) => (
        plantsInSection.length === 0 ? null : (
          <View
            className="flex-row flex-wrap justify-start px-1"
            onLayout={(event) => {
              const { width } = event.nativeEvent.layout;
              if (containerWidth === 0) setContainerWidth(width);
            }}
          >
            {plantsInSection.map((plant, idx) => {
              const itemWidth = containerWidth > 0 ? (containerWidth - 8) / 4 : 90;
              // public url 생성
              const publicUrl = getPublicImageUrl(plant.id + ".jpg");
              return (
                <TouchableOpacity
                  key={plant.id}
                  className="p-1 mb-1"
                  style={{ width: itemWidth, height: itemWidth + 30 }}
                  onPress={() => navigation.navigate('Detail', { plant, image_url: publicUrl })}
                  activeOpacity={0.8}
                >
                  <View className="w-full h-full rounded-sm overflow-hidden bg-gray-100 items-center">
                    {/* 이미지가 실제로 존재하는지 확인하려면, 서버에 파일이 없을 경우 404가 뜨므로, Image의 onError에서 fallback 처리 가능 */}
                    <Image
                      source={{ uri: publicUrl }}
                      className="w-full"
                      style={{ height: itemWidth, borderRadius: 6 }}
                      resizeMode="cover"
                      onError={() => {}}
                    />
                    <Text
                      className="text-center mt-1"
                      numberOfLines={1}
                      style={{ fontSize: 13, fontWeight: "bold" }}
                    >
                      {plant.plant_name ?? "이름 없음"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}
    />
  );
}; 