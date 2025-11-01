import { useState, useEffect, lazy, Suspense, memo, useCallback, useMemo } from 'react';
import { View,Animated,Alert } from 'react-native';
// 외부 라이브러리 
import { useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
// Navigation
import { MapStackParamList } from "@nav/stack/Map";
// libs
import { saveFoundPlant } from '@libs/supabase/operations/foundPlants/saveFoundPlant';
import { uploadImageAndGetPath } from '@libs/supabase/operations/image/uploadImage';
import { getAIResponseWithImage } from '@libs/utils/AI';
import { useReview } from '@libs/hooks/useReview';
import { useAds } from '@libs/hooks/useAds';
// 스토어 & 상태관리
import { useAuthStore } from '@store/authStore.ts';
import { useModalBackgroundStore } from '@store/modalBackgroundStore.ts';
import { useLocationStore } from '@store/locationStore.ts';
import { useFoundPlantsStore } from '@store/foundPlantsStore.ts';
// 컴포넌트
import { Background } from '@components/Background';
import { CustomButton } from '@components/CustomButton';
import { MapModal } from '@domain/App/Map/ImageProcessing/components/MapModal.tsx';
import { PlantDetail } from '@shared/components/PlantDetail';
// 지연 로딩을 위한 모달 컴포넌트들
const MemoModal = lazy(() => import('./components/MemoModal').then(module => ({ default: module.MemoModal })));
const ReviewRequestModal = lazy(() => import('./components/ReviewRequestModal').then(module => ({ default: module.ReviewRequestModal })));
// 상수 & 타입
import { BUCKET_NAME } from '@constants/normal.ts';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE, DEFAULT_ZOOM } from '@constants/normal.ts';
import { type AIResponseType ,type ResponseCode} from '@libs/utils/AI';
type ImageProcessingScreenProps= NativeStackScreenProps <MapStackParamList,'ImageProcessing'>

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
  aiResponse: AIResponseType | null;
}) => {
  const { t } = useTranslation(['domain', 'common']);
  return (
    <View className="absolute bottom-10 left-0 right-0 flex-row justify-evenly items-center mt-4">
      <CustomButton text={t('common:components.button.cancel')} size={60} onPress={onCancel}/>
      {!isAiLoading && aiResponse?.response_code === "success" && (
        <>
          <View className="w-20"/>
          <CustomButton 
            text={t('common:components.button.save')} 
            size={70} 
            onPress={onSave} 
            isProcessing={isProcessing}
          />
        </>
      )}
    </View>
  );
});


const ImageProcessingScreenComponent = ({navigation}:ImageProcessingScreenProps) => {
  const route = useRoute();
  const { userId } = useAuthStore.getState();
  const { forceCloseModalBackground } = useModalBackgroundStore();
  const { latitude: userLatitude, longitude: userLongitude } = useLocationStore();
  const { t } = useTranslation(['domain', 'common']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [memo, setMemo] = useState<string>('');
  const [ AIResponseCode, setAIResponseCode] = useState<ResponseCode | null>(null);
  const [openedModalType, setOpenedModalType] = useState<'map' | 'description' | 'memo' | 'reviewRequest' | null>(null);
  const [isLocationManuallySelected, setIsLocationManuallySelected] = useState(false);
  const [center, setCenter] = useState({
    latitude: userLatitude ?? DEFAULT_LATITUDE,
    longitude: userLongitude ?? DEFAULT_LONGITUDE,
    zoom: DEFAULT_ZOOM,
  });
  const [fadeAnim] = useState(new Animated.Value(1));
  
  const { imageUri } = route.params as {
    imageUri: string;
  };
  const {isReviewedInYear,setReviewedInYear,isLoading,lastReviewDate} = useReview();
  const { isLoaded, isClosed, show } = useAds();
  const [aiResponse, setAiResponse] = useState<AIResponseType | null>(null);


  // 사용자 위치가 로드되면 center 업데이트 (아직 수동으로 선택하지 않은 경우만)
  useEffect(() => {
    if (userLatitude !== null && userLongitude !== null && !isLocationManuallySelected) {
      setCenter(prev => ({
        ...prev,
        latitude: userLatitude,
        longitude: userLongitude,
      }));
    }
  }, [userLatitude, userLongitude, isLocationManuallySelected]);

  // 사용자가 명시적으로 위치를 선택했는지 확인
  const isLocationSelected = useMemo(() => 
    isLocationManuallySelected,
    [isLocationManuallySelected]
  );

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
    setIsLocationManuallySelected(true);
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
      Alert.alert(
        t('map.imageProcessing.loginRequiredTitle'),
        t('map.imageProcessing.loginRequiredMessage')
      );
      return;
    }
    if (!isLocationSelected) {
      Alert.alert(
        t('map.imageProcessing.locationRequiredTitle'),
        t('map.imageProcessing.locationRequiredMessage')
      );
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
        description: aiResponse?.plant_description ?? null,
        plantName: aiResponse?.plant_name ?? '',
        type_code: aiResponse?.plant_type_code ?? 0,
        activity_curve: aiResponse?.plant_activity_curve ?? [],
      };

      const { success, error, data: newPlant } = await saveFoundPlant(plantData);

      if (success) {
        // 스토어에 새 식물 추가
        if (newPlant) {
          useFoundPlantsStore.getState().addPlant(newPlant);
        }
        
        // 저장 성공 알림 표시
        Alert.alert(
          t('map.imageProcessing.saveSuccessTitle'),
          t('map.imageProcessing.saveSuccessMessage'),
          [
            {
              text: t('common:components.button.confirm'),
              onPress: () => {
                // 확인을 누르면 기존 로직 실행
                if(!isReviewedInYear){
                  setOpenedModalType('reviewRequest');
                }else if(isLoaded && !isClosed){
                  show();
                  navigation.goBack();
                }else{
                  navigation.goBack();
                }
              }
            }
          ]
        );
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
  }, [userId, aiResponse?.plant_name, memo, aiResponse?.plant_description, center, aiResponse, isLocationSelected, isReviewedInYear, isLoaded, isClosed, show, navigation, setReviewedInYear, t]);

  const fetchAIResponse = useCallback(async () => {
   
    setIsAiLoading(true);
    try {
      const response = await getAIResponseWithImage(imageUri);
      console.log("response", response);
      if (response) {
        // response의 code가 유효한 값인지 확인
        if (response.response_code === "success") {
          setAiResponse(response as AIResponseType);
          setAIResponseCode(null);
        } else if (response.response_code === "error" || response.response_code === "not_plant" || response.response_code === "low_confidence"){
          setAiResponse(null);
          setAIResponseCode(response.response_code);
        }
      } else {
        setAIResponseCode("error");
        setAiResponse(null);
      }
    } catch (error) {
      setAIResponseCode("error");
      setAiResponse(null);
    } finally {
      setIsAiLoading(false);
    }
  }, [imageUri, fadeAnim]);

  useEffect(() => {
    fetchAIResponse();
  }, [imageUri]);

  return (
    <Background isStatusBarGap={false} isTabBarGap={false}>
      <PlantDetail
        type="imageProcessing"
        image_url={imageUri}
        plant_name={aiResponse?.plant_name ?? ''}
        type_code={aiResponse?.plant_type_code ?? 0}
        description={aiResponse?.plant_description ?? ''}
        activity_curve={aiResponse?.plant_activity_curve ?? []}
        memo={memo}
        lat={center.latitude}
        lng={center.longitude}
        onOpenModal={(modalType: 'map' | 'memo' | 'reviewRequest') => setOpenedModalType(modalType)}
        isLocationSelected={isLocationSelected}
        isAILoading={isAiLoading}
        AIResponseCode={AIResponseCode}
      />
      
      {/* 버튼 영역 */}
      <ButtonSection 
        onCancel={() => navigation.goBack()}
        onSave={handleSave}
        isProcessing={isProcessing}
        isAiLoading={isAiLoading}
        aiResponse={aiResponse}
      />
    {/* 모달들 */}
      <MapModal
            isVisible={openedModalType === 'map'}
            onClose={closeModal}
            onComplete={handleLocationSelect}
            center={center}
            onCameraChange={handleCameraChange}
            plantTypeImageCode={aiResponse?.plant_type_code ?? 0}
          />
     
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
