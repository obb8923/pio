import { View, Text, TouchableOpacity, Image, Animated, Dimensions, RefreshControl, SectionList, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { getPlantList } from "../../../libs/supabase/operations/foundPlants/getPlantList";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PiodexStackParamList } from "../../../nav/stack/Piodex";
import { useAuthStore } from "../../../store/authStore";
import { Background } from "../../../components/Background";
import { Colors } from "../../../constants/Colors";
import { useFoundPlants } from "../../../libs/hooks/useFoundPlants";
import { found_plants_columns } from "../../../libs/supabase/operations/foundPlants/type";
import { useSignedUrls } from "../../../libs/hooks/useSignedUrls";
import { Skeleton } from "../../../components/Skeleton";
type PiodexScreenProps = NativeStackScreenProps<PiodexStackParamList,'Piodex'>

// 식물 사전 데이터 타입 정의
interface PlantListItem {
  id: number;
  updated_at: string;
  image_url: string;
  plant_name: string;
  description: string;
}

export const PiodexScreen = ({navigation}:PiodexScreenProps) => {
  const [activeTab, setActiveTab] = useState<'piodex' | 'plant'>('piodex');
  const [plantList, setPlantList] = useState<PlantListItem[]>([]);
  const [plantListLoading, setPlantListLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];
  const { isLoggedIn } = useAuthStore();
  const [containerWidth, setContainerWidth] = useState(0);
  const { foundPlants, isLoading: loading, fetchPlants } = useFoundPlants(true);
  const { signedUrls, isLoading: isLoadingImages } = useSignedUrls(foundPlants);
  
  // 화면 너비 가져오기
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = (screenWidth - 32) / 2; // 전체 너비에서 좌우 패딩(32) 제외 후 2로 나눔

  // 화면이 마운트될 때 데이터 로드
  useEffect(() => {
    if(isLoggedIn) fetchPlants();
  }, [isLoggedIn]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlants().finally(() => setRefreshing(false));
  };

  const handleTabChange = (tab: 'piodex' | 'plant') => {
    if (activeTab === tab) return;

    const toValue = tab === 'piodex' ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();

    setActiveTab(tab);

    // 식물 사전 탭으로 변경할 때 데이터 로드
    if (tab === 'plant' && plantList.length === 0) {
      // loadPlantList();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 날짜별로 식물을 그룹화하는 함수 (flex-wrap 렌더링용)
  const groupPlantsByDate = (plants: found_plants_columns[]) => {
    if (!plants || plants.length === 0) {
      return [];
    }
    // 날짜별로 그룹화
    const groupedByDate: { [key: string]: found_plants_columns[] } = plants.reduce((acc, plant) => {
      const date = formatDate(plant.created_at);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(plant);
      return acc;
    }, {} as { [key: string]: found_plants_columns[] });

    // 각 날짜의 전체 식물 배열을 하나의 데이터 아이템으로 만들기
    const sections = Object.keys(groupedByDate).map(date => ({
      title: date,
      data: [groupedByDate[date]] // 해당 날짜의 모든 식물을 하나의 배열로 감싸기
    })).sort((a, b) => new Date(b.title).getTime() - new Date(a.title).getTime()); // 최신 날짜부터 정렬

    return sections;
  };

  const renderContent = () => {
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

    // 도감 탭
    if(activeTab === 'piodex') {
      // 데이터가 없을 때
      if(!foundPlants || foundPlants.length === 0) {
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
          sections={groupPlantsByDate(foundPlants)}
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
              {plantsInDate.map((plant) => {
                const itemWidth = containerWidth > 0 ? (containerWidth - 8) / 4 : 125;
                const signedUrl = signedUrls[foundPlants.findIndex(p => p.id === plant.id)];
                return (
                  <TouchableOpacity
                    key={plant.id}
                    onPress={() => navigation.navigate('Detail', { plant, signedUrl })}
                    className="p-1 mb-1"
                    style={{ width: itemWidth, height: itemWidth + 30 }}
                  >
                    <View className="w-full h-full rounded-sm overflow-hidden bg-gray-100">
                      {isLoadingImages && !signedUrl ? (
                        <Skeleton width={itemWidth} height={itemWidth + 30} />
                      ) : (
                        <Image
                          source={{ uri: signedUrl || plant.image_path }}
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
    }

    // 식물 사전 탭
    if(activeTab === 'plant') {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-center">{`식물 사전은 준비중 입니다. \n 조금만 기다려주세요! `}</Text>
        </View>
      );
    }
    // 기본 반환
    return null;
  };

  return (
    <Background type="white" isStatusBarGap={true}> 
      <View className="flex-1 px-4">
        {/* 탭바 */}
        <View className="flex-row justify-between items-center py-6 relative">
          {/* 탭바 애니메이션 움직이는 뷰*/}
          <Animated.View 
            className="absolute bottom-0 left-0 h-full justify-center items-center"
            style={{
              width: '50%',
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, tabWidth]
                })
              }]
            }}
          >
            <View className={`${activeTab!=='piodex'&&'ml-1'} flex-row items-center justify-center w-full`}>
            <View className="h-1.5 bg-greenTab rounded-full w-1/12"/>
            </View>
          </Animated.View>
          <TouchableOpacity 
            onPress={() => handleTabChange('piodex')}
            className={`px-6 py-2 h-10 w-1/2 justify-center items-center`}
          >
            <Text className={`text-base ${activeTab === 'piodex' ? 'text-greenTab font-semibold' : 'text-greenInactive'}`}>
              도감
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleTabChange('plant')}
            className={`px-6 py-2 h-10 w-1/2 justify-center items-center`}
          >
            <Text className={`text-center ${activeTab === 'plant' ? 'text-greenTab font-semibold' : 'text-greenInactive'}`}>
              식물 사전
            </Text>
          </TouchableOpacity>
        </View>
        <View className="w-full h-0.5 bg-greenTab rounded-full"/>
        
        {/* 콘텐츠 영역 */}
        <View className="flex-1">
          {renderContent()}
        </View>
      </View>
    </Background>
  );
};

