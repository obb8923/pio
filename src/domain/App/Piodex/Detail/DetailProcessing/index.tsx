import { useCallback, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
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
// 컴포넌트
import { Background } from '@components/Background';
import { CustomButton } from '@components/CustomButton';
import { Line } from '@components/Line';
import { MapModal } from '@domain/App/Map/ImageProcessing/components/MapModal.tsx';
import { DescriptionModal } from '@domain/App/Map/ImageProcessing/components/DescriptionModal.tsx';
import { MemoModal } from '@domain/App/Map/ImageProcessing/components/MemoModal.tsx';
import { PlantDetail } from '@/shared/components/PlantDetail';
// 상수 & 타입
import { plantTypeImages } from '@domain/App/Map/constants/images.ts';
import { found_plants_columns, PlantTypeMap } from '@libs/supabase/operations/foundPlants/type';
import { Flag } from '@/domain/App/Piodex/Detail/DetailProcessing/components/Flag';
import { useModalBackgroundStore } from '@/shared/store/modalBackgroundStore';
type DetailProcessingScreenProps = NativeStackScreenProps<PiodexStackParamList,'DetailProcessing'>

export const DetailProcessingScreen = ({navigation}:DetailProcessingScreenProps) => {
  const route = useRoute();
  const {plant,image_url} = route.params as {plant:found_plants_columns,image_url:string}   
    const {id,plant_name,description:prev_description,memo:prev_memo,lat,lng,type_code,activity_curve,activity_notes} = plant
    const { forceCloseModalBackground } = useModalBackgroundStore();

  const { userId } = useAuthStore.getState();
  const [memo, setMemo] = useState<string>(prev_memo as string);
  const [description, setDescription] = useState<string>(prev_description as string);
 
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
       <Flag />
       <PlantDetail
        type="imageProcessing"
        image_url={image_url}
        plant_name={plant_name as string}
        type_code={type_code}
        description={description}
        activity_curve={activity_curve}
        memo={memo}
        lat={lat}
        lng={lng}
        onOpenModal={(modalType: 'map' | 'memo' | 'reviewRequest') => setOpenedModalType(modalType)}
        isLocationSelected={true}
       />
    

      {/* 버튼 영역 */}
      <View className="absolute bottom-10 left-0 right-0 flex-row justify-evenly items-center mt-4">
        <CustomButton text="취소" size={60} onPress={() => navigation.goBack()}/>
        <CustomButton text="삭제" size={60} onPress={handleDelete} isProcessing={isProcessing}/>
        <CustomButton text="저장" size={70} onPress={handleSave} isProcessing={isProcessing}/>    
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
