import { View, Text, Modal, Image, ScrollView, Animated } from 'react-native';
import { CustomButton } from '../../../../components/CustomButton';
import { Skeleton } from '../../../../components/Skeleton';
import React, { useEffect, useState, useRef } from 'react';
import { getSignedUrls } from '../../../../libs/supabase/operations/image/getSignedUrls';
import { found_plants_columns } from '../../../../libs/supabase/operations/foundPlants/type';
import { DEVICE_WIDTH_HALF, DEVICE_HEIGHT_HALF, MODAL_ANIMATION_DURATION_CLOSE, MODAL_ANIMATION_DURATION_OPEN_LONG } from '../../../../constants/normal';
import { useModalBackground } from '../../../../libs/hooks/useModalBackground';
interface PlantDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedPlant: found_plants_columns | null;
  markerPositionAtScreen: { x: number; y: number };
}

export const PlantDetailModal = ({
  isVisible,
  onClose,
  selectedPlant,
  markerPositionAtScreen,
}: PlantDetailModalProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { closeModalBackground } = useModalBackground(isVisible);
  // 애니메이션 값들
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  // 닫기 애니메이션 함수
  const handleCloseWithAnimation = () => {
      // 모달 배경 먼저 닫기 (애니메이션 동시 시작)
      closeModalBackground();

      // 마커 위치에서 중앙까지의 거리 계산
      const translateX = markerPositionAtScreen.x - DEVICE_WIDTH_HALF;
      const translateY = markerPositionAtScreen.y - DEVICE_HEIGHT_HALF;

      // 닫기 애니메이션 실행
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: MODAL_ANIMATION_DURATION_CLOSE,
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnim, {
          toValue: translateX,
          duration: MODAL_ANIMATION_DURATION_CLOSE,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: translateY,
          duration: MODAL_ANIMATION_DURATION_CLOSE,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 애니메이션 완료 후 모달 닫기
        onClose();
      });
  };

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!selectedPlant) {
        setSignedUrl(null);
        return;
      }

      setIsLoading(true);
      try {
        const url = await getSignedUrls(selectedPlant.image_path);
        setSignedUrl(Array.isArray(url) ? url[0] : url);
      } catch (err) {
        console.error('Error fetching signed URL:', err);
        setSignedUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrl();
  }, [selectedPlant]);

  // 모달이 표시될 때 애니메이션 시작
  useEffect(() => {
    if (isVisible && markerPositionAtScreen) {
      // 마커 위치에서 중앙까지의 거리 계산
      const translateX = markerPositionAtScreen.x - DEVICE_WIDTH_HALF;
      const translateY = markerPositionAtScreen.y - DEVICE_HEIGHT_HALF;

      // 초기 위치 설정
      translateXAnim.setValue(translateX);
      translateYAnim.setValue(translateY);
      scaleAnim.setValue(0);

      // 애니메이션 실행
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: MODAL_ANIMATION_DURATION_OPEN_LONG,
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnim, {
          toValue: 0,
          duration: MODAL_ANIMATION_DURATION_OPEN_LONG,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: MODAL_ANIMATION_DURATION_OPEN_LONG,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, markerPositionAtScreen]);

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleCloseWithAnimation}
    >
      <View className="flex-1 justify-center items-center">    
        <Animated.View 
          className="bg-white rounded-3xl max-h-[90%] min-h-[50%] w-[90%]"
          style={{
            transform: [
              { translateX: translateXAnim },
              { translateY: translateYAnim },
              { scale: scaleAnim },
            ],
          }}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 100}}
          >  
            <View className="w-full h-[300px] rounded-t-xl mb-1 bg-gray-100">
              {isLoading ? (
                <Skeleton 
                  width="100%" 
                  height={300} 
                  borderRadius={12}
                  className="rounded-t-xl"
                />
              ) : signedUrl ? (
                <Image
                  source={{ uri: signedUrl }}
                  className="w-full h-full rounded-t-xl"
                  resizeMode="cover"
                  onError={() => {
                    console.log('이미지 로드 실패', signedUrl);
                  }}
                />
              ) : null}
            </View>
            
            <View className="mb-4 p-4">
            <View className="flex-row justify-start items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                {selectedPlant?.plant_name || '이름 없는 식물'}
              </Text>
            </View>
              <Text className="text-gray-600 mb-2">
                {selectedPlant?.description || '설명이 없습니다.'}
              </Text>
              <Text className="text-gray-500">
                {selectedPlant?.memo || ''}
              </Text>
            </View>
          </ScrollView>
          <View className="absolute bottom-6 left-0 right-0 justify-center items-center">
            <CustomButton
              text="닫기"
              size={60}
              onPress={handleCloseWithAnimation}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}; 