import { View, Text, Modal, Image, ScrollView } from 'react-native';
import { CustomButton } from '../../../../components/CustomButton';
import { Skeleton } from '../../../../components/Skeleton';
import React, { useEffect, useState } from 'react';
import { Colors } from '../../../../constants/Colors';
import { getSignedUrls } from '../../../../libs/supabase/operations/image/getSignedUrls';
import { found_plants_columns } from '../../../../libs/supabase/operations/foundPlants/type';

interface PlantDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedPlant: found_plants_columns | null;
}

export const PlantDetailModal = ({
  isVisible,
  onClose,
  selectedPlant,
}: PlantDetailModalProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%] min-h-[50%]">
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
                메모: {selectedPlant?.memo || '메모가 없습니다.'}
              </Text>
            </View>
          </ScrollView>
          <View className="absolute bottom-6 left-0 right-0 justify-center items-center">
            <CustomButton
              text="닫기"
              size={60}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}; 