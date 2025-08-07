import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
// 외부 라이브러리 - Navigation
import { useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
// Navigation
import { PiodexStackParamList } from "../../../../../nav/stack/Piodex";
// libs
import { updateFoundPlant } from '../../../../../libs/supabase/operations/foundPlants/updateFoundPlant';
import { deleteFoundPlant } from '../../../../../libs/supabase/operations/foundPlants/deleteFoundPlant';
// 스토어 & 상태관리
import { useAuthStore } from '../../../../../store/authStore';
// 컴포넌트
import { Background } from '../../../../../components/Background';
import { CustomButton } from '../../../../../components/CustomButton';
import { Line } from '../../../../../components/Line';
import { MapModal } from '../../../Map/ImageProcessing/components/MapModal';
import { DescriptionModal } from '../../../Map/ImageProcessing/components//DescriptionModal';
import { MemoModal } from '../../../Map/ImageProcessing/components/MemoModal';
// 상수 & 타입
import { plantTypeImages } from '../../../Map/constants/images';
import { found_plants_columns, PlantTypeMap } from '../../../../../libs/supabase/operations/foundPlants/type';

type DetailProcessingScreenProps = NativeStackScreenProps<PiodexStackParamList,'DetailProcessing'>

export const DetailProcessingScreen = ({navigation}:DetailProcessingScreenProps) => {
  const route = useRoute();
  const {plant,image_url} = route.params as {plant:found_plants_columns,image_url:string}   
    const {id,plant_name,description:prev_description,memo:prev_memo,lat,lng,type_code,activity_curve,activity_notes} = plant

  const { userId } = useAuthStore.getState();
  const [memo, setMemo] = useState<string>(prev_memo as string);
  const [description, setDescription] = useState<string>(prev_description as string);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
  const [isMemoModalVisible, setIsMemoModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [center, setCenter] = useState({
    latitude: lat,
    longitude: lng,
    zoom: 16,
  });

  // 지도 중심이 바뀔 때마다 중심 좌표 갱신
  const handleCameraChange = (e: any) => {
    setCenter({
      latitude: e.latitude,
      longitude: e.longitude,
      zoom: e.zoom,
    });
  };

  // 선택된 위치를 사용할 수 있음
  const handleLocationSelect = () => {
    setIsMapModalVisible(false);
  };

  const goToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'AppTab', params: { screen: 'MapStack', params: { screen: 'Map' } } },
        ],
      })
    );
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const { success, error } = await updateFoundPlant(id, {
        description,
        memo,
        lat: center.latitude,
        lng: center.longitude,
      });
      if (success) {
        Alert.alert('성공', '정보가 성공적으로 수정되었습니다.', [
          { text: '확인', onPress: goToHome },
        ]);
      } else {
        Alert.alert('오류', error?.message || '정보 수정에 실패했습니다.');
      }
    } catch (err) {
      Alert.alert('오류', '정보 수정 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) {
      Alert.alert('알림', '로그인 후 이용해주세요.');
      return;
    }
    Alert.alert(
      '삭제 확인',
      '정말로 이 식물 정보를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const { success, error } = await deleteFoundPlant(id);
              if (success) {
                Alert.alert('성공', '삭제가 완료되었습니다.', [
                  { text: '확인', onPress: goToHome },
                ]);
              } else {
                Alert.alert('오류', error?.message || '삭제에 실패했습니다.');
              }
            } catch (err) {
              Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Background isStatusBarGap={false} isTabBarGap={false}>
         <View className="flex justify-center items-center z-10 absolute top-16 left-0 bg-greenTab rounded-r-full w-auto h-auto py-2 pr-2 pl-0">
         <View className="flex justify-center items-start p-4 border border-greenActive border-l-0 w-auto h-full rounded-r-full">
        <Text className="text-greenActive font-medium">식물 정보 수정하기</Text>
        </View>
        </View>
       {/* 사진 영역 */}
       <View className="absolute top-0 left-0 right-0 items-center mb-6 w-full h-80">
       
          <Image
            source={{ uri: image_url }}
            className="w-full h-full rounded-3xl"
            resizeMode="cover"
          />
        </View>
       <ScrollView
        className="flex-1 mt-4 pt-80 px-2 pb-2 rounded-lg "
        contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 400 }}
        showsVerticalScrollIndicator={false}
      >
       
        {/* 식물 정보 영역 */}
          <View className="w-full bg-white rounded-lg p-4">
            {/* 식물 이름 영역 */}
            <View className="mb-4 flex-row justify-center items-center">
              <Text
                className="rounded-lg p-3 text-center bg-white text-2xl"
              >{plant_name}
              </Text>
            </View>
            {/* 식물 종류 및 활동 곡선 영역 */}
            <View className="flex-row items-center">
              {/* 식물 종류 영역 */}
              <View className="h-[60px] justify-center items-center" style={{width: '30%'}}>
              <Image source={plantTypeImages[type_code]} className="w-[32px] h-[32px]" />
              <Text className="text-[#333] text-sm mt-2">{PlantTypeMap[type_code]}</Text>
              </View>
              {/* 구분선 */}
              <View className="h-[40px] w-0.5 bg-gray-200"/>
              {/* 활동 곡선 영역 */}
              <View className=" justify-center items-center" style={{width: '70%'}}>
              <Line data={activity_curve ?? []} width={200} height={80}  />
                </View>
            </View>
            {/* 설명 영역 */}
            <TouchableOpacity onPress={() => setIsDescriptionModalVisible(true)}>
              <Text
                className="text-gray-600 min-h-[90px] max-h-[140px] bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-y-scroll"               
              >{description===''?'식물에 대한 설명을 입력해주세요':description}</Text>
            </TouchableOpacity>
            <View className="h-0.5 rounded-full bg-svggray3 my-8"/>

            {/* 메모 영역 */}
            <TouchableOpacity onPress={() => setIsMemoModalVisible(true)}>
              <Text
                className="border border-gray-300 rounded-lg p-3 bg-white min-h-[90px] max-h-[140px] text-gray-600"
              >{memo===''?'식물에 대한 메모를 입력해주세요':memo}</Text>
            </TouchableOpacity>

            {/* 위치 선택 영역 */}
            <View className="bg-gray-100 mt-6 mb-8 pl-4 rounded-full flex-row justify-between items-center">
              {/* 텍스트 영역 */}
              <View className="h-full w-auto py-4">
                <Text className="text-greenTab text-center font-medium">
                   위치가 선택되었습니다
                </Text>
              </View>
              {/* 버튼 영역 */}
              <TouchableOpacity 
                className="p-4 bg-greenTab rounded-full justify-center items-center"
                onPress={() => {
                  if(!userId) {
                    Alert.alert("알림", "로그인 후 이용해주세요.");
                    return;
                  }
                  setIsMapModalVisible(true);
                }}
              >
                <Text className="text-greenActive text-center font-medium">
                   수정하기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        
      </ScrollView>

      {/* 버튼 영역 */}
      <View className="absolute bottom-10 left-0 right-0 flex-row justify-evenly items-center mt-4">
        <CustomButton text="취소" size={60} onPress={() => navigation.goBack()}/>
        <CustomButton text="삭제" size={60} onPress={handleDelete} isProcessing={isProcessing}/>
        <CustomButton text="저장" size={70} onPress={handleSave} isProcessing={isProcessing}/>    
      </View>

      {/* 지도 모달 */}
      <MapModal
        isVisible={isMapModalVisible}
        onClose={() => setIsMapModalVisible(false)}
        onComplete={handleLocationSelect}
        center={center}
        onCameraChange={handleCameraChange}
        plantTypeImageCode={type_code ?? 0}
      />

      {/* 설명 모달 */}
      <DescriptionModal
        isVisible={isDescriptionModalVisible}
        onClose={() => setIsDescriptionModalVisible(false)}
        description={description}
        onDescriptionChange={setDescription}
      />

      {/* 메모 모달 */}
      <MemoModal
        isVisible={isMemoModalVisible}
        onClose={() => setIsMemoModalVisible(false)}
        memo={memo}
        onMemoChange={setMemo}
      />
    </Background>
  );
};
