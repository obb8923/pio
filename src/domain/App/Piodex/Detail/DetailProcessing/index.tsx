import { useCallback, useState } from 'react';
import { View, Alert } from 'react-native';
// 외부 라이브러리 - Navigation
import { useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
// Navigation
import { PiodexStackParamList } from "@nav/stack/Piodex";
// libs
import { updateFoundPlant } from '@libs/supabase/operations/foundPlants/updateFoundPlant';
import { deleteFoundPlant } from '@libs/supabase/operations/foundPlants/deleteFoundPlant';
// 스토어 & 상태관리
import { useAuthStore } from '@store/authStore.ts';
import { useFoundPlantsStore } from '@store/foundPlantsStore.ts';
// 컴포넌트
import { Background } from '@components/Background';
import { CustomButton } from '@components/CustomButton';
import { MapModal } from '@domain/App/Map/ImageProcessing/components/MapModal.tsx';
import { MemoModal } from '@domain/App/Map/ImageProcessing/components/MemoModal.tsx';
import { PlantDetail } from '@/shared/components/PlantDetail';
// 상수 & 타입
import { found_plants_columns } from '@libs/supabase/operations/foundPlants/type';
import { Flag } from '@/domain/App/Piodex/Detail/DetailProcessing/components/Flag';
import { useModalBackgroundStore } from '@/shared/store/modalBackgroundStore';
import { useTranslation } from 'react-i18next';
type DetailProcessingScreenProps = NativeStackScreenProps<PiodexStackParamList,'DetailProcessing'>

export const DetailProcessingScreen = ({navigation}:DetailProcessingScreenProps) => {
  const route = useRoute();
  const {plant,image_url} = route.params as {plant:found_plants_columns,image_url:string}   
    const {id,plant_name,description,memo:prev_memo,lat,lng,type_code,activity_curve} = plant
    const { forceCloseModalBackground } = useModalBackgroundStore();
  const { t } = useTranslation(['domain', 'common']);

  const { userId } = useAuthStore.getState();
  const [memo, setMemo] = useState<string>(prev_memo as string);
 
  const [openedModalType, setOpenedModalType] = useState<'map' | 'memo' | 'reviewRequest' | null>(null);
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
    setOpenedModalType(null);
  };
  // 모달 닫기 공통 함수
  const closeModal = useCallback(() => {
    setOpenedModalType(null);
    // 모달 배경도 확실히 닫기
    setTimeout(() => {
      forceCloseModalBackground();
    }, 100);
  }, [forceCloseModalBackground]);
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
        // 스토어 업데이트
        useFoundPlantsStore.getState().updatePlant(id, {
          description,
          memo,
          lat: center.latitude,
          lng: center.longitude,
        });
        
        Alert.alert(
          t('piodex.detailProcessing.updateSuccessTitle'),
          t('piodex.detailProcessing.updateSuccessMessage'),
          [{ text: t('common:components.button.confirm'), onPress: goToHome }]
        );
      } else {
        Alert.alert(
          t('piodex.detailProcessing.updateErrorTitle'),
          error?.message || t('piodex.detailProcessing.updateErrorMessage')
        );
      }
    } catch (err) {
      Alert.alert(
        t('piodex.detailProcessing.updateErrorTitle'),
        t('piodex.detailProcessing.updateErrorDefault')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) {
      Alert.alert(
        t('piodex.detailProcessing.loginRequiredTitle'),
        t('piodex.detailProcessing.loginRequiredMessage')
      );
      return;
    }
    Alert.alert(
      t('piodex.detailProcessing.deleteConfirmTitle'),
      t('piodex.detailProcessing.deleteConfirmMessage'),
      [
        { text: t('common:components.button.cancel'), style: 'cancel' as const },
        {
          text: t('common:components.button.delete'),
          style: 'destructive' as const,
          onPress: async () => {
            setIsProcessing(true);
            try {
              const { success, error } = await deleteFoundPlant(id);
              if (success) {
                // 스토어에서 제거
                useFoundPlantsStore.getState().removePlant(id);
                
                Alert.alert(
                  t('piodex.detailProcessing.deleteSuccessTitle'),
                  t('piodex.detailProcessing.deleteSuccessMessage'),
                  [{ text: t('common:components.button.confirm'), onPress: goToHome }]
                );
              } else {
                Alert.alert(
                  t('piodex.detailProcessing.deleteErrorTitle'),
                  error?.message || t('piodex.detailProcessing.deleteErrorMessage')
                );
              }
            } catch (err) {
              Alert.alert(
                t('piodex.detailProcessing.deleteErrorTitle'),
                t('piodex.detailProcessing.deleteErrorDefault')
              );
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
       <Flag />
       <PlantDetail
        type="imageProcessing"
        image_url={image_url}
        plant_name={plant_name as string}
        type_code={type_code}
        description={description as string}
        activity_curve={activity_curve}
        memo={memo}
        lat={lat}
        lng={lng}
        onOpenModal={(modalType: 'map' | 'memo' | 'reviewRequest') => setOpenedModalType(modalType)}
        isLocationSelected={true}
       />
    

      {/* 버튼 영역 */}
      <View className="absolute bottom-10 left-0 right-0 flex-row justify-evenly items-center mt-4">
        <CustomButton text={t('common:components.button.cancel')} size={60} onPress={() => navigation.goBack()}/>
        <CustomButton text={t('common:components.button.delete')} size={60} onPress={handleDelete} isProcessing={isProcessing}/>
        <CustomButton text={t('common:components.button.save')} size={70} onPress={handleSave} isProcessing={isProcessing}/>    
      </View>

      {/* 지도 모달 */}
      <MapModal
        isVisible={openedModalType === 'map'}
        onClose={closeModal}
        onComplete={handleLocationSelect}
        center={center}
        onCameraChange={handleCameraChange}
        plantTypeImageCode={type_code ?? 0}
      />

      {/* 메모 모달 */}
      <MemoModal
        isVisible={openedModalType === 'memo'}
        onClose={closeModal}
        memo={memo}
        onMemoChange={setMemo}
      />
    </Background>
  );
};
