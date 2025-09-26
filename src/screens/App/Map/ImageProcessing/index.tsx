import { useState, useEffect, lazy, Suspense, memo, useCallback, useMemo } from 'react';
import { View,Text,Image,TouchableOpacity,TextInput,ActivityIndicator,Animated,Alert,Platform,ScrollView} from 'react-native';
// 외부 라이브러리 
import { useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// Navigation
import { MapStackParamList } from "../../../../nav/stack/Map";
// libs
import { saveFoundPlant } from '../../../../libs/supabase/operations/foundPlants/saveFoundPlant';
import { uploadImageAndGetPath } from '../../../../libs/supabase/operations/image/uploadImage';
import { getAIResponseWithImage } from '../../../../libs/utils/AI';
import { useReview } from '../../../../libs/hooks/useReview';
import { useAds } from '../../../../libs/hooks/useAds';
// 스토어 & 상태관리
import { useAuthStore } from '../../../../store/authStore';
import { useModalBackgroundStore } from '../../../../store/modalBackgroundStore';
// 컴포넌트
import { Background } from '../../../../components/Background';
import { CustomButton } from '../../../../components/CustomButton';
import { Line } from '../../../../components/Line';

// 지연 로딩을 위한 모달 컴포넌트들
const MapModal = lazy(() => import('./components/MapModal').then(module => ({ default: module.MapModal })));
const DescriptionModal = lazy(() => import('./components/DescriptionModal').then(module => ({ default: module.DescriptionModal })));
const MemoModal = lazy(() => import('./components/MemoModal').then(module => ({ default: module.MemoModal })));
const ReviewRequestModal = lazy(() => import('./components/ReviewRequestModal').then(module => ({ default: module.ReviewRequestModal })));
// 상수 & 타입
import { Colors } from '../../../../constants/Colors';
import { BUCKET_NAME } from '../../../../constants/normal';
import { plantTypeImages } from '../constants/images';
import { PlantType, PlantTypeCode } from '../../../../libs/supabase/operations/foundPlants/type';

type ImageProcessingScreenProps= NativeStackScreenProps <MapStackParamList,'ImageProcessing'>

// 이미지 섹션 컴포넌트
const ImageSection = memo(({ imageUri }: { imageUri: string }) => (
  <View className="absolute top-0 left-0 right-0 items-center mb-6 w-full h-80">
    <Image
      source={{ uri: imageUri }}
      className="w-full h-full rounded-3xl"
      resizeMode="cover"
    />
  </View>
));

// 로딩 섹션 컴포넌트
const AILoadingSection = memo(() => (
  <View className="w-full h-96 bg-white rounded-lg p-4 justify-center items-center">
    <ActivityIndicator size="large" color={Colors.greenTab} />
    <Text className="mt-4 text-lg text-gray-600">식물을 분석 중입니다...</Text>
  </View>
));

// 에러 섹션 컴포넌트
const ErrorSection = memo(({ error }: { error: string }) => (
  <View className="w-full h-96 bg-white rounded-lg p-4 justify-center items-center">
    <Text className="text-red-500 text-lg text-center">{error}</Text>
  </View>
));

// 버튼 섹션 컴포넌트
const ButtonSection = memo(({ 
  onCancel, 
  onSave, 
  isProcessing, 
  isAiLoading, 
  aiResponse 
}: {
  onCancel: () => void;
  onSave: () => void;
  isProcessing: boolean;
  isAiLoading: boolean;
  aiResponse: AiResponseType | null;
}) => (
  <View className="absolute bottom-10 left-0 right-0 flex-row justify-evenly items-center mt-4">
    <CustomButton text="취소" size={60} onPress={onCancel}/>
    {!isAiLoading && aiResponse?.code === "success" && (
      <>
        <View className="w-20"/>
        <CustomButton 
          text="저장" 
          size={70} 
          onPress={onSave} 
          isProcessing={isProcessing}
        />
      </>
    )}
  </View>
));

// AI 응답 객체 타입 정의
interface AiResponseType {
  code: "success" | "error" | "not_plant" | "low_confidence";
  name?: string;
  type?: PlantType;
  type_code?: PlantTypeCode;
  description?: string;
  activity_curve?: number[];
  activity_notes?: string;
  error?: string;
}
const ImageProcessingScreenComponent = ({navigation}:ImageProcessingScreenProps) => {
  const route = useRoute();
  const { userId } = useAuthStore.getState();
  const { forceCloseModalBackground } = useModalBackgroundStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [plantName, setPlantName] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [openedModalType, setOpenedModalType] = useState<'map' | 'description' | 'memo' | 'reviewRequest' | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [center, setCenter] = useState({
    latitude: 37.5666102,
    longitude: 126.9783881,
    zoom: 16,
  });
  const [fadeAnim] = useState(new Animated.Value(1));
  
  const { imageUri } = route.params as {
    imageUri: string;
  };
  const {isReviewedInYear,setReviewedInYear,isLoading,lastReviewDate} = useReview();
  const { isLoaded, isClosed, show } = useAds();
  const [aiResponse, setAiResponse] = useState<AiResponseType | null>({
    code: "success",
    name: "달맞이꽃",
    type: "꽃",
    type_code: 1,
    description: "달맞이꽃은 해질 무렵 노란 꽃이 피는 초본식물입니다.",
    activity_curve: [0.0, 0.0, 0.2, 0.5, 0.8, 1.0, 0.9, 0.6, 0.3, 0.1, 0.0, 0.0],
    activity_notes: "달맞이꽃은 해질 무렵 노란 꽃이 피는 초본식물입니다.",
  });


  // 초기 위치에서 변경되었는지 확인하는 함수
  const isLocationSelected = useMemo(() => 
    center.latitude !== 37.5666102 || center.longitude !== 126.9783881,
    [center.latitude, center.longitude]
  );

  // 모달 열기 함수들
  const openDescriptionModal = useCallback(() => {
    setOpenedModalType('description');
  }, []);

  const openMemoModal = useCallback(() => {
    setOpenedModalType('memo');
  }, []);

  const openMapModal = useCallback(() => {
    if (!userId) {
      Alert.alert("알림", "로그인 후 이용해주세요.");
      return;
    }
    setOpenedModalType('map');
  }, [userId]);

  // 지도 중심이 바뀔 때마다 중심 좌표 갱신
  const handleCameraChange = useCallback((e: any) => {
    setCenter({
      latitude: e.latitude,
      longitude: e.longitude,
      zoom: e.zoom,
    });
  }, []);

  // 선택된 위치를 사용할 수 있음
  const handleLocationSelect = useCallback(() => {
    setOpenedModalType(null);
    // 모달 배경도 확실히 닫기
    setTimeout(() => {
      forceCloseModalBackground();
    }, 100);
  }, [forceCloseModalBackground]);

  // 모달 닫기 공통 함수
  const closeModal = useCallback(() => {
    setOpenedModalType(null);
    // 모달 배경도 확실히 닫기
    setTimeout(() => {
      forceCloseModalBackground();
    }, 100);
  }, [forceCloseModalBackground]);

  const handleSave = useCallback(async () => {
    if(!userId) {
      Alert.alert("알림", "로그인 후 이용해주세요.");
      return;
    }
    if (!plantName) {
      Alert.alert("알림", "식물 이름을 입력해주세요.");
      return;
    }
    if (!isLocationSelected) {
      Alert.alert("알림", "발견한 곳을 선택해주세요.");
      return;
    }

    setIsProcessing(true);
    try {
      if (!userId) {
        console.error('사용자 ID를 가져올 수 없습니다.');
        // 사용자에게 오류 메시지를 표시하거나 로그인 화면으로 리디렉션할 수 있습니다.
        setIsProcessing(false);
        return;
      }

      const imagePath = await uploadImageAndGetPath(imageUri, BUCKET_NAME);
      if (!imagePath) {
        console.error('이미지 업로드 또는 URL 가져오기 실패');
        // 사용자에게 오류 메시지를 표시할 수 있습니다.
        setIsProcessing(false);
        return;
      }

      const plantData = {
        userId,
        imagePath,
        memo: memo || null,
        lat: center.latitude,
        lng: center.longitude,
        description: description || null,
        plantName: plantName,
        type_code: aiResponse?.type_code ?? 0,
        activity_curve: aiResponse?.activity_curve ?? [],
        activity_notes: aiResponse?.activity_notes ?? '',
      };

      const { success, error } = await saveFoundPlant(plantData);

      if (success) {
        // console.log('식물 정보 저장 성공');
        if(!isReviewedInYear){
          setOpenedModalType('reviewRequest');
        }else if(isLoaded && !isClosed){
          show();
          navigation.goBack();
        }else{
          navigation.goBack();
        }
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
  }, [userId, plantName, memo, description, center, aiResponse, isLocationSelected, isReviewedInYear, isLoaded, isClosed, show, navigation, setReviewedInYear]);

  const fetchAIResponse = useCallback(async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await getAIResponseWithImage(imageUri);
      if (response) {
        // response의 code가 유효한 값인지 확인
        if (response.code === "success" || response.code === "error" || response.code === "not_plant" || response.code === "low_confidence") {
          setAiResponse(response as AiResponseType);
          if (response.code === "error") {
            setAiError(response.error || "AI 처리 중 오류가 발생했습니다.");
          } else if (response.code === "not_plant") {
            setAiError("식물이 아닌 것으로 판단되었습니다.");
          } else if (response.code === "low_confidence") {
            setAiError("식물을 정확하게 인식하지 못했습니다. 다시 시도해주세요.");
          }
        } else {
          setAiError("예상치 못한 응답 형식입니다. 다시 시도해주세요.");
          setAiResponse(null);
        }
      } else {
        setAiError("AI 응답을 받지 못했습니다. 다시 시도해주세요.");
        setAiResponse(null);
      }
    } catch (error) {
      console.error("AI 응답 요청 중 오류:", error);
      setAiError("AI 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      setAiResponse(null);
    } finally {
      setIsAiLoading(false);
      // AI 로딩 완료 후 애니메이션 시작
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [imageUri, fadeAnim]);

  useEffect(() => {
    fetchAIResponse();
  }, [imageUri]);

  // aiResponse 상태가 변경되면 plantName과 description 업데이트
  useEffect(() => {
    if (aiResponse && aiResponse.code === "success") {
      setPlantName(aiResponse.name || '');
      setDescription(aiResponse.description || '');
    } else {
      setPlantName('');
      setDescription('');
    }
  }, [aiResponse]);

  return (
    <Background isStatusBarGap={false} isTabBarGap={false}>
       {/* 사진 영역 */}
       <ImageSection imageUri={imageUri} />
       <ScrollView
        className="flex-1 mt-4 pt-80 px-2 pb-2 rounded-lg "
        contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 400 }}
        showsVerticalScrollIndicator={false}
      >
       
        {/* 식물 정보 영역 */}
        {isAiLoading ? (
          <AILoadingSection />
        ) : aiError ? (
          <ErrorSection error={aiError} />
        ) : (
          <Animated.View style={{ opacity: fadeAnim }} className="w-full bg-white rounded-lg p-4">
            {/* 식물 이름 영역 */}
            <View className="mb-4 flex-row justify-center items-center">
              <TextInput
                className="rounded-lg p-3 text-center bg-white text-2xl"
                placeholder="식물 이름을 입력하세요"
                value={plantName ?? ''}
                onChangeText={setPlantName}
              />
            </View>
            {/* 식물 종류 및 활동 곡선 영역 */}
            <View className="flex-row items-center">
              {/* 식물 종류 영역 */}
              <View className="h-[60px] justify-center items-center" style={{width: '30%'}}>
              <Image source={plantTypeImages[aiResponse?.type_code ?? 0]} className="w-[32px] h-[32px]" />
              <Text className="text-[#333] text-sm mt-2">{aiResponse?.type}</Text>
              </View>
              {/* 구분선 */}
              <View className="h-[40px] w-0.5 bg-gray-200"/>
              {/* 활동 곡선 영역 */}
              <View className=" justify-center items-center" style={{width: '70%'}}>
              <Line data={aiResponse?.activity_curve ?? []} width={200} height={80}  />
                </View>
            </View>
            {/* 설명 영역 */}
            <TouchableOpacity onPress={openDescriptionModal}>
              <Text
                className="text-gray-600 min-h-[90px] max-h-[140px] bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-y-scroll"               
              >{description===''?'식물에 대한 설명을 입력해주세요':description}</Text>
            </TouchableOpacity>
            <View className="h-0.5 rounded-full bg-svggray3 my-8"/>

            {/* 메모 영역 */}
            <TouchableOpacity onPress={openMemoModal}>
              <Text
                className="border border-gray-300 rounded-lg p-3 bg-white min-h-[90px] max-h-[140px] text-gray-600"
              >{memo===''?'식물에 대한 메모를 입력해주세요':memo}</Text>
            </TouchableOpacity>

            {/* 위치 선택 영역 */}
            <View className="bg-gray-100 mt-6 mb-8 pl-4 rounded-full flex-row justify-between items-center">
              {/* 텍스트 영역 */}
              <View className="h-full w-auto py-4">
                <Text className="text-greenTab text-center font-medium">
                  {isLocationSelected ? "위치가 선택되었습니다" : "발견한 곳을 선택해 주세요"}
                </Text>
              </View>
              {/* 버튼 영역 */}
              <TouchableOpacity 
                className="p-4 bg-greenTab rounded-full justify-center items-center"
                onPress={openMapModal}
              >
                <Text className="text-greenActive text-center font-medium">
                  {isLocationSelected ? "수정하기" : "선택하기"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* 버튼 영역 */}
      <ButtonSection 
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
        isProcessing={isProcessing}
        isAiLoading={isAiLoading}
        aiResponse={aiResponse}
      />

      {/* 지연 로딩된 모달들 */}
      {openedModalType === 'map' && (
        <Suspense fallback={<View />}>
          <MapModal
            isVisible={openedModalType === 'map'}
            onClose={closeModal}
            onComplete={handleLocationSelect}
            center={center}
            onCameraChange={handleCameraChange}
            plantTypeImageCode={aiResponse?.type_code ?? 0}
          />
        </Suspense>
      )}

      {openedModalType === 'description' && (
        <Suspense fallback={<View />}>
          <DescriptionModal
            isVisible={openedModalType === 'description'}
            onClose={closeModal}
            description={description}
            onDescriptionChange={setDescription}
          />
        </Suspense>
      )}

      {openedModalType === 'memo' && (
        <Suspense fallback={<View />}>
          <MemoModal
            isVisible={openedModalType === 'memo'}
            onClose={closeModal}
            memo={memo}
            onMemoChange={setMemo}
          />
        </Suspense>
      )}

      {openedModalType === 'reviewRequest' && (
        <Suspense fallback={<View />}>
          <ReviewRequestModal
            isVisible={openedModalType === 'reviewRequest'}
            onClose={() => {
              closeModal();
              // 상태가 반영된 후 navigation.goBack 실행
              // 상태 변경이 비동기이므로 약간의 delay를 줄 수도 있음
              setTimeout(() => {
                navigation.goBack();
              }, 200);
            }}
            setReviewedInYear={setReviewedInYear}
          />
        </Suspense>
      )}
    </Background>
  );
};

export const ImageProcessingScreen = memo(ImageProcessingScreenComponent);
