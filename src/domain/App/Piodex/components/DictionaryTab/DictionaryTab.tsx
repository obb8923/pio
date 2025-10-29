import React, { useState, useCallback, useEffect } from "react";
import { View, SectionList, RefreshControl, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useDictionaryStore } from "@store/dictionaryStore.ts";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PiodexStackParamList } from "@nav/stack/Piodex";
// 커스텀 훅들
import { useImagePrefetch } from "@domain/App/Piodex/components/DictionaryTab/hooks/useImagePrefetch.ts";
import { useSeasonSections } from "@domain/App/Piodex/components/DictionaryTab/hooks/useSeasonSections.ts";
// 컴포넌트들
import { PlantCard } from "@domain/App/Piodex/components/DictionaryTab/components/PlantCard.tsx";
// 상수들
import { ITEMS_PER_ROW, ITEM_SPACING, DEFAULT_ITEM_WIDTH } from "@domain/App/Piodex/components/DictionaryTab/constants.ts";

export const DictionaryTab = () => {
  const { dictionary, fetchDictionary, loading } = useDictionaryStore();
  const [refreshing, setRefreshing] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<PiodexStackParamList>>();

  // 커스텀 훅 사용
  const { imageLoading, getPublicImageUrl } = useImagePrefetch(dictionary);
  const { sections, toggleSection, openSections } = useSeasonSections(dictionary);

  // 초기 데이터 로딩
  useEffect(() => {
    if (!dictionary) {
      fetchDictionary();
    }
  }, [dictionary, fetchDictionary]);

  // 새로고침 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDictionary();
    setRefreshing(false);
  }, [fetchDictionary]);

  // 컨테이너 레이아웃 핸들러
  const handleContainerLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout;
    if (containerWidth === 0) setContainerWidth(width);
  }, [containerWidth]);

  // 식물 카드 클릭 핸들러
  const handlePlantPress = useCallback((plant: any) => {
    const publicUrl = getPublicImageUrl(plant.id + ".webp");
    navigation.navigate('Detail', { plant, image_url: publicUrl,isPreviousScreenDictionary:true });
  }, [getPublicImageUrl, navigation]);

  // 아이템 너비 계산
  const itemWidth = containerWidth > 0 
    ? (containerWidth - ITEM_SPACING) / ITEMS_PER_ROW 
    : DEFAULT_ITEM_WIDTH;

  // 로딩 상태 체크
  if (loading || imageLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 빈 데이터 체크
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
      initialNumToRender={10} // 최초 렌더링 아이템 수
      maxToRenderPerBatch={10} // 한 번에 렌더링할 최대 아이템 수
      windowSize={1} // 화면 밖에 몇 배수까지 렌더링할지
      removeClippedSubviews={true} // 화면 밖 아이템 언마운트
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
            onLayout={handleContainerLayout}
          >
            {plantsInSection.map((plant) => {
              const publicUrl = getPublicImageUrl(plant.id + ".webp");
              return (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  imageUrl={publicUrl}
                  itemWidth={itemWidth}
                  onPress={() => handlePlantPress(plant)}
                />
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