import { View, Text, TouchableOpacity, ScrollView, Image, Animated, Dimensions } from "react-native";
import { Background } from "../../../components/Background";
import { useState, useRef, useEffect } from "react";
import LinearGradient from 'react-native-linear-gradient';
import { getCurrentUserFoundPlants, getPlantList } from "../../../libs/supabase/supabaseOperations";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PiodexStackParamList } from "../../../nav/stack/Piodex";
import { useAuthStore } from "../../../store/authStore";
import { TAB_BAR_HEIGHT } from "../../../constants/TabNavOptions";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PiodexScreenProps = NativeStackScreenProps<PiodexStackParamList,'Piodex'>

// 식물 데이터 타입 정의
export interface FoundPlant {
  id: string;
  created_at: string;
  image_url: string;
  plant_name: string;
  description: string;
  memo: string;
  lat: number;
  lng: number;
  signed_url?: string;
}

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
  const [foundPlants, setFoundPlants] = useState<FoundPlant[]>([]);
  const [plantList, setPlantList] = useState<PlantListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [plantListLoading, setPlantListLoading] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];
  const { isLoggedIn } = useAuthStore();
  const insets = useSafeAreaInsets();
  
  // 화면 너비 가져오기
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = (screenWidth - 32) / 2; // 전체 너비에서 좌우 패딩(32) 제외 후 2로 나눔

  // 발견된 식물 데이터 로드
  useEffect(() => {
    if(isLoggedIn) loadFoundPlants();
  }, [isLoggedIn]);

  const loadFoundPlants = async () => {
    if(!isLoggedIn) return;
    try {
      setLoading(true);
      const plants = await getCurrentUserFoundPlants();
      if (plants) {
        setFoundPlants(plants);
      }
    } catch (error) {
      console.error('Error loading found plants:', error);
    } finally {
      setLoading(false);
    }
  };

  // const loadPlantList = async () => {
  //   try {
  //     setPlantListLoading(true);
  //     const plants = await getPlantList();
  //     if (plants) {
  //       setPlantList(plants);
  //     }
  //   } catch (error) {
  //     console.error('Error loading plant list:', error);
  //   } finally {
  //     setPlantListLoading(false);
  //   }
  // };

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

  const renderContent = () => {
    if(!isLoggedIn) return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500 text-center">로그인이 필요합니다.</Text>
      </View>
    );
    // 로딩 상태 체크 (or로 묶기)
    if (loading || plantListLoading) {
      const loadingText = activeTab === 'piodex' ? '로딩 중...' : '식물 사전 로딩 중...';
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">{loadingText}</Text>
        </View>
      );
    }

    // 데이터가 없을 때
    const currentData = activeTab === 'piodex' ? foundPlants : plantList;
    if (currentData.length === 0) {
      const emptyText = activeTab === 'piodex' 
        ? "아직 발견한 식물이 없습니다.\n식물을 발견해보세요!"
        : "식물 사전 기능은 준비중입니다\n조금만 기다려주세요!";
      
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-center">{emptyText}</Text>
        </View>
      );
    }

    // 데이터가 있을 때 (현재는 piodex만 구현)
    if (activeTab === 'piodex') {
      return (
        <View className="flex-row flex-wrap justify-between">
          {foundPlants.map((plant) => (
            <TouchableOpacity 
            key={plant.id} 
            onPress={()=>navigation.navigate('Detail',plant)} 
            className="w-[48%] mb-4 bg-white rounded-lg overflow-hidden shadow-sm">
              <Image 
                source={{ uri: plant.signed_url || plant.image_url }} 
                className="w-full h-[200px]" 
                resizeMode="cover"
                defaultSource={require('../../../../assets/pngs/flowers/flower1.png')}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                className="absolute bottom-0 left-0 right-0 h-1/2 justify-end p-2"
              >
                <Text className="text-xs text-white font-medium mb-1">
                  {plant.plant_name || '알 수 없는 식물'}
                </Text>
                <Text className="text-xs text-white opacity-80">
                  {formatDate(plant.created_at)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // 식물 사전 탭 (현재는 준비중 메시지만 표시)
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-greenActive text-center">식물 사전 기능은 준비중입니다\n조금만 기다려주세요!</Text>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{paddingTop: insets.top}}>
      <Image source={require('../../../../assets/pngs/BackgroundGreen.png')} className="w-full h-full absolute top-0 left-0 right-0 bottom-0"/>
      <View className="flex-1 mx-2 absolute top-0 left-0 right-0 bottom-0 bg-white opacity-90"/>

      <View className="flex-1 px-4" style={{paddingBottom: TAB_BAR_HEIGHT+16}}>
        
      {/* 탭바 */}
        <View className="flex-row justify-between items-center py-6 relative ">
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
            <View className="h-1.5 bg-greenTab rounded-full w-10"/>
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
            <Text className={`text-base ${activeTab === 'plant' ? 'text-greenTab font-semibold' : 'text-greenInactive'}`}>
              식물 사전
            </Text>
          </TouchableOpacity>
        </View>
            <View className="w-full h-0.5 bg-greenTab rounded-full"/>
        {/* 콘텐츠 */}
        <ScrollView className="flex-1 mt-4 px-4">
          {renderContent()}
        </ScrollView>
        </View>
    </View>
  );
};

