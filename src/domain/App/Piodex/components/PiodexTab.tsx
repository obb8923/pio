import { View, Text, TouchableOpacity, Image,RefreshControl, SectionList, ActivityIndicator } from "react-native";
import { useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PiodexStackParamList } from "@nav/stack/Piodex";
import { useAuthStore } from "@store/authStore.ts";
import { Colors } from "@constants/Colors.ts";
import { useFoundPlants } from "@libs/hooks/useFoundPlants";
import { found_plants_columns } from "@libs/supabase/operations/foundPlants/type";
import { useSignedUrls } from "@libs/hooks/useSignedUrls";
import { Skeleton } from "@components/Skeleton";

// Define the navigation prop type directly
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

  // 앱 초기화에서 이미 데이터를 로드하므로 useEffect/useFocusEffect 제거
  // 수동 새로고침(RefreshControl)으로만 최신 데이터 가져오기

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
      sections={groupPlantsByDate(myPlants)}
      keyExtractor={(item, index) => `section-${index}`}
      renderItem={({ item: plantsInDate }) => (
        <View 
          className="flex-row flex-wrap justify-start px-1"
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            if (containerWidth === 0) {
              setContainerWidth(width);
            }
          }}
        > 
          {plantsInDate.map((plant: found_plants_columns) => {
            const itemWidth = containerWidth > 0 ? (containerWidth - 8) / 4 : 125;
            const signedUrl = signedUrls[myPlants.findIndex((p: found_plants_columns) => p.id === plant.id)];
            return (
              <TouchableOpacity
                key={plant.id}
                onPress={() => navigation.navigate('Detail', { plant, image_url:signedUrl ,isPreviousScreenDictionary:false})}
                className="p-1 mb-1"
                style={{ width: itemWidth, height: itemWidth + 30 }}
              >
                <View className="w-full h-full rounded-sm overflow-hidden bg-gray-100">
                  {isLoadingImages || !signedUrl ? (
                    <Skeleton width={itemWidth} height={itemWidth + 30} />
                  ) : (
                    <Image
                      source={{ uri: signedUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      renderSectionHeader={({ section: { title } }) => (
        <Text className="font-semibold py-2 my-2 rounded-md">{title}</Text>
      )}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.greenTab]} />
      }
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}
    />
  );
}; 