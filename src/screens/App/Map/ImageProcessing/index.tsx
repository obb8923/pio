import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {MapStackParamList} from "../../../../nav/stack/Map"
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import { getCurrentUserId, uploadImageAndGetUrl, saveFoundPlant } from '../../../../libs/supabase/supabaseOperations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pencil from "../../../../../assets/svgs/Pencil.svg"
import { Colors } from '../../../../constants/Colors';
import { CustomButton } from '../../../../components/CustomButton';
import { getAIResponseWithImage } from '../../../../libs/utils/AI';
type ImageProcessingScreenProps =NativeStackScreenProps <MapStackParamList,'ImageProcessing'>

export const ImageProcessingScreen = ({navigation}:ImageProcessingScreenProps) => {
  const route = useRoute();
  const [isProcessing, setIsProcessing] = useState(false);
  const [plantName, setPlantName] = useState('');
  const [memo, setMemo] = useState('');
  const [description, setDescription] = useState('');
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const [center, setCenter] = useState({
    latitude: 37.5666102,
    longitude: 126.9783881,
    zoom: 16,
  });
  
  const { imageUri } = route.params as {
    imageUri: string;
  };
  const [aiResponse, setAiResponse] = useState('');
  // 초기 위치에서 변경되었는지 확인하는 함수
  const isLocationSelected = center.latitude !== 37.5666102 || center.longitude !== 126.9783881;

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

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.error('사용자 ID를 가져올 수 없습니다.');
        // 사용자에게 오류 메시지를 표시하거나 로그인 화면으로 리디렉션할 수 있습니다.
        setIsProcessing(false);
        return;
      }

      const imageUrl = await uploadImageAndGetUrl(imageUri, 'found-plants');
      if (!imageUrl) {
        console.error('이미지 업로드 또는 URL 가져오기 실패');
        // 사용자에게 오류 메시지를 표시할 수 있습니다.
        setIsProcessing(false);
        return;
      }

      const plantData = {
        userId,
        imageUrl,
        memo: memo || null,
        lat: center.latitude,
        lng: center.longitude,
        description: description || null,
        plantName: plantName || null,
      };

      const { success, error } = await saveFoundPlant(plantData);

      if (success) {
        console.log('식물 정보 저장 성공');
        navigation.goBack();
      } else {
        console.error('식물 정보 저장 실패:', error);
        // 사용자에게 오류 메시지를 표시할 수 있습니다.
      }
    } catch (error) {
      console.error('이미지 처리 중 오류 발생:', error);
      // 사용자에게 오류 메시지를 표시할 수 있습니다.
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const fetchAIResponse = async () => {
      const response = await getAIResponseWithImage(imageUri);
      if(response) setAiResponse(response);
    };
    fetchAIResponse();
  }, []);
  useEffect(() => {
    console.log("aiResponse", aiResponse);
  }, [aiResponse]);
  return (
    <View className="flex-1">
    <Image source={require('../../../../../assets/pngs/BackgroundGreen.png')} className="w-full h-full absolute top-0 left-0 right-0 bottom-0"/>
      <ScrollView 
      className="flex-1 p-2 rounded-lg" 
      style={{paddingTop: insets.top}}
      contentContainerStyle={{ paddingBottom: 400 }}>
        {/* 사진 영역 */}
        <View className="items-center my-6 w-full h-72">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
          />
        </View>
        {/* 식물 정보 영역 */}
        <View className="w-full h-full bg-white rounded-lg p-4">
        {/* 식물 이름 영역 */}
        <View className="mb-4 flex-row justify-center items-center">
          <TextInput
            className="rounded-lg p-3 text-center bg-white text-2xl"
            placeholder="식물 이름을 입력하세요"
            value={plantName}
            onChangeText={setPlantName}
          />
          <Pencil style={{width: 24, height: 24,color: Colors.svggray3}} />

        </View>

        {/* 설명 영역 */}
          <View className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <TextInput
              className="text-gray-600 min-h-20"
              placeholder={`이 식물에 대한 정보를 입력해 주세요. \n 예시) 이 꽃은 지치과의 속이다. 물망초를 비롯한 유럽의 꽃이 '나를 잊지 마오'라는 꽃말을 가져 물망초로도 불린다. `}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>
        <View className="h-0.5 rounded-full bg-svggray3 my-8"/>
        {/* 메모 영역 */}
        <View className="mb-4">
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white min-h-20"
            placeholder={`이 식물에 대한 메모를 작성할 수 있어요 \n 예시) 아파트 단지에서 발견한 귀여운 친구, 잘 자랐으면 좋겠다.`}
            value={memo}
            onChangeText={setMemo}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* 위치 선택 영역 */}
         
          <View className="bg-gray-100 pl-4 rounded-full flex-row justify-between items-center">
            {/* 텍스트 영역 */}
            <View className="h-full w-auto py-4">
              <Text className="text-greenTab text-center font-medium">
                {isLocationSelected ? "위치가 선택되었습니다" : "발견한 곳을 선택해 주세요"}
              </Text>
            </View>
            {/* 버튼 영역 */}
            <TouchableOpacity 
              className="p-4 bg-greenTab rounded-full justify-center items-center"
              onPress={() => setIsMapModalVisible(true)}
            >
              <Text className="text-greenActive text-center font-medium">
                {isLocationSelected ? "수정하기" : "선택하기"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
       
        
      </ScrollView>
     
        {/* 버튼 영역 */}
        <View className="absolute bottom-10 left-0 right-0 flex-row justify-evenly items-center mt-4">
        <CustomButton text="취소" size={60} onPress={() => navigation.goBack()}/>
          <View className="w-20"/>
          <CustomButton text="저장" size={70} onPress={handleSave} isProcessing={isProcessing}/>
        </View>
          {/* 지도 모달 */}
       <Modal
          visible={isMapModalVisible}
          animationType="slide"
          transparent={true}
        >
          {/* 배경 검은색 오버레이 */}
          <View className="flex-1 bg-black/50">
          {/* 내부 영역*/}
              <View className="flex-1 relative mx-4 my-20 pt-20 pb-20  border border-greenTab900 rounded-3xl bg-greenTab">
                <View className=" absolute top-0 left-0 right-0 h-20 items-start justify-end px-4 py-2">
                <Text className=" text-center text-lg text-greenActive">핀을 이동시켜 발견한 위치를 선택해 주세요</Text>
                </View>
                <NaverMapView
                  style={{ width: '100%', height: '100%'}}
                  initialCamera={{
                    latitude: center.latitude,
                    longitude: center.longitude,
                    zoom: center.zoom,
                  }}
                  onCameraChanged={handleCameraChange}
                />
                {/* 지도 중앙에 고정된 마커 오버레이 */}
                <View className="absolute left-1/2 top-1/2 -ml-3 -mt-6 z-10 pointer-events-none">
                  <View className="w-6 h-6 items-center justify-center">
                    <Text className="text-2xl">📍</Text>
                  </View>
                </View>
                  {/* modal button section */}
              <View className=" h-20 flex-row justify-between items-center gap-4 px-4 ">
                  <CustomButton text="취소" size={60} onPress={() => setIsMapModalVisible(false)}/>
                  <CustomButton text="완료" size={70} onPress={handleLocationSelect}/>
                </View>
              </View>

            
            </View>
        </Modal>
      </View>
    );
};
