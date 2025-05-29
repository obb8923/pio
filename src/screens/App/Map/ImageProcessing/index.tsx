import { View, Text, Image, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Modal } from 'react-native';
import { Background } from '../../../../components/Background';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Colors } from '../../../../constants/Colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {MapStackParamList} from "../../../../nav/stack/Map"
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import { getCurrentUserId, uploadImageAndGetUrl, saveFoundPlant } from '../../../../libs/supabase/supabaseOperations';

type ImageProcessingScreenProps =NativeStackScreenProps <MapStackParamList,'ImageProcessing'>

export const ImageProcessingScreen = ({navigation}:ImageProcessingScreenProps) => {
  const route = useRoute();
  const [isProcessing, setIsProcessing] = useState(false);
  const [plantName, setPlantName] = useState('');
  const [memo, setMemo] = useState('');
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [center, setCenter] = useState({
    latitude: 37.5666102,
    longitude: 126.9783881,
    zoom: 16,
  });
  
  const { imageUri } = route.params as {
    imageUri: string;
  };

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
        description: null, // AI 분석 결과가 없으므로 우선 null로 설정
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

  return (
    <Background>
      <ScrollView className="flex-1 p-4">
        {/* 사진 영역 - 중앙정렬, 정사각형, 둥근 모서리 */}
        <View className="items-center mb-6">
          <Image
            source={{ uri: imageUri }}
            className="w-64 h-64 rounded-2xl"
            resizeMode="cover"
          />
        </View>
        
        {/* 식물 이름 영역 */}
        <View className="mb-4">
          <Text className="text-center text-xl font-bold text-gray-800 mb-2">
            식물 이름
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-center bg-white"
            placeholder="식물 이름을 입력하세요"
            value={plantName}
            onChangeText={setPlantName}
          />
        </View>

        {/* 설명 영역 */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            식물 설명
          </Text>
          <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Text className="text-gray-600 leading-5">
              이 식물에 대한 자세한 정보가 여기에 표시됩니다. 
              AI 분석을 통해 식물의 종류, 특징, 관리 방법 등을 
              제공할 예정입니다.
            </Text>
          </View>
        </View>

        {/* 메모 영역 */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            메모
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white min-h-20"
            placeholder="이 식물에 대한 메모를 작성하세요"
            value={memo}
            onChangeText={setMemo}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* 위치 선택 영역 */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            발견한 위치
          </Text>
          <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Text className="text-gray-600 mb-2">
              {center.latitude.toFixed(6)}, {center.longitude.toFixed(6)}
            </Text>
            <TouchableOpacity 
              className="bg-blue-500 py-2 rounded-md"
              onPress={() => setIsMapModalVisible(true)}
            >
              <Text className="text-white text-center font-medium">발견한 곳 선택하기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 지도 모달 */}
        <Modal
          visible={isMapModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View className="flex-1 bg-black/50">
            <View className="flex-1 mt-20 bg-white rounded-t-3xl">
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-center">발견한 위치 선택</Text>
              </View>
              
              <View className="flex-1 relative">
                <NaverMapView
                  style={{ width: '100%', height: '100%' }}
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
              </View>

              <View className="p-4 border-t border-gray-200">
                <Text className="text-sm text-gray-600 mb-2 text-center">
                  현재 선택 위치: {center.latitude.toFixed(6)}, {center.longitude.toFixed(6)}
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity 
                    className="flex-1 py-3 rounded-md border border-gray-300"
                    onPress={() => setIsMapModalVisible(false)}
                  >
                    <Text className="text-center text-gray-700">취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-1 py-3 rounded-md bg-blue-500"
                    onPress={handleLocationSelect}
                  >
                    <Text className="text-center text-white">선택 완료</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* 버튼 영역 */}
        <View className="flex-row justify-between mt-4">
          <TouchableOpacity
            className="flex-1 py-4 rounded-md items-center justify-center border border-gray-300 mr-2"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-gray-700 font-medium">취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-4 rounded-md items-center justify-center bg-blue-500 ml-2"
            onPress={handleSave}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-medium">저장</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Background>
  );
};
