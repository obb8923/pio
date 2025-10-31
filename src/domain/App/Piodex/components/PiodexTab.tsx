import { View, Text, TouchableOpacity,RefreshControl, SectionList, ActivityIndicator } from "react-native";
import { useState, useMemo } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PiodexStackParamList } from "@nav/stack/Piodex";
import { useAuthStore } from "@store/authStore.ts";
import { Colors } from "@constants/Colors.ts";
import { useFoundPlants } from "@libs/hooks/useFoundPlants";
import { found_plants_columns } from "@libs/supabase/operations/foundPlants/type";
import { useSignedUrls } from "@libs/hooks/useSignedUrls";
import { ImageItem } from "@domain/App/Piodex/components/ImageItem";
import { ITEMS_PER_ROW, ITEM_SPACING, DEFAULT_ITEM_WIDTH } from "@domain/App/Piodex/components/DictionaryTab/constants.ts";
type PiodexTabNavigationProp = NativeStackNavigationProp<PiodexStackParamList, 'Piodex'>;

interface PiodexTabProps {
  navigation: PiodexTabNavigationProp;
}

export const PiodexTab = ({ navigation }: PiodexTabProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const { myPlants, isLoading: loading, fetchPlants } = useFoundPlants(true);
  const { signedUrls, isLoading: isLoadingImages } = useSignedUrls(myPlants);
  const [refreshing, setRefreshing] = useState(false);
  const { isLoggedIn } = useAuthStore();
  
  // id -> signedUrl 매핑을 메모이제이션하여 O(1) 조회
  const idToSignedUrlMap = useMemo(() => {
    const map = new Map<number, string | null>();
    if (!myPlants || !signedUrls) return map;
    myPlants.forEach((plant, index) => {
      map.set(plant.id as unknown as number, signedUrls[index] ?? null);
    });
    return map;
  }, [myPlants, signedUrls]);

  // 새로고침 핸들러
  const onRefresh = () => {
    setRefreshing(true);
    fetchPlants().finally(() => setRefreshing(false));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 식물들을 날짜별로 그룹화하는 함수
  const groupPlantsByDate = (plants: found_plants_columns[]) => {
    if (!plants || plants.length === 0) {
      return [];
    }
    
    // 날짜별로 식물들을 그룹화
    const groupedByDate: { [key: string]: found_plants_columns[] } = plants.reduce((acc, plant) => {
      const date = formatDate(plant.created_at);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(plant);
      return acc;
    }, {} as { [key: string]: found_plants_columns[] });

    // 섹션 리스트 형식으로 변환하고 최신 날짜순으로 정렬
    const sections = Object.keys(groupedByDate).map(date => ({
      title: date,
      data: [groupedByDate[date]]
    })).sort((a, b) => new Date(b.title).getTime() - new Date(a.title).getTime());

    return sections;
  };

  const itemWidth = containerWidth > 0
    ? (containerWidth - ITEM_SPACING * (ITEMS_PER_ROW - 1)) / ITEMS_PER_ROW
    : DEFAULT_ITEM_WIDTH;

  // 섹션 데이터 메모이제이션
  const sectionsData = useMemo(() => groupPlantsByDate(myPlants), [myPlants]);

  // 로그인 상태 체크
  if(!isLoggedIn) return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-gray-500 text-center">로그인이 필요합니다.</Text>
    </View>
  );

  // 로딩 상태 체크
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.greenTab} />
        <Text className="text-gray-500 mt-2">데이터를 불러오는 중...</Text>
      </View>
    );
  }

  // 데이터가 없을 때
  if(!myPlants || myPlants.length === 0) {
    return (
      <SectionList
        sections={[{ title: '', data: [[]] }]}
        renderItem={() => (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-center text-lg mb-2">아직 발견한 식물이 없습니다.</Text>
            <Text className="text-gray-400 text-center">식물을 발견해보세요!</Text>
          </View>
        )}
        renderSectionHeader={() => null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.greenTab]} />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
    );
  }

  // 데이터가 있을 때
  return (
    <SectionList
      sections={sectionsData}
      keyExtractor={(item, index) => `section-${index}`}
      renderItem={({ item: plantsInDate }) => (
        <View 
          className="flex-row flex-wrap justify-start"
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            if (containerWidth === 0) {
              setContainerWidth(width);
            }
          }}
        > 
          {plantsInDate.map((plant: found_plants_columns, index: number) => {
            const isLastInRow = (index + 1) % ITEMS_PER_ROW === 0;
            const signedUrl = idToSignedUrlMap.get(plant.id as unknown as number) ?? null;
            return (
              <TouchableOpacity
                key={plant.id}
                onPress={() => navigation.navigate('Detail', { plant, image_url:signedUrl ,isPreviousScreenDictionary:false})}
                style={{
                  width: itemWidth,
                  height: itemWidth,
                  marginRight: isLastInRow ? 0 : ITEM_SPACING,
                  marginBottom: ITEM_SPACING,
                }}
              >
                <ImageItem signedUrl={signedUrl} isLoadingImages={isLoadingImages} width={itemWidth} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      renderSectionHeader={({ section: { title } }) => (
        <Text className="font-semibold py-2 my-2 rounded-md">{title}</Text>
      )}
      stickySectionHeadersEnabled={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.greenTab]} />
      }
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}
    />
  );
}; 