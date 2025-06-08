import { View, Text, Modal, Image, ScrollView } from 'react-native';
import { CustomButton } from '../../../../components/CustomButton';
import React from 'react';

type FoundPlant = {
  id: string;
  lat: number;
  lng: number;
  image_url: string;
  plant_name: string;
  description: string;
  memo: string;
  signed_url?: string;
};

interface PlantDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedPlant: FoundPlant | null;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  isVisible,
  onClose,
  selectedPlant,
}) => {
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
            {(selectedPlant?.signed_url || selectedPlant?.image_url) && (
              <Image
                source={{ uri: selectedPlant?.signed_url || selectedPlant?.image_url }}
                className="w-full h-[300px] rounded-t-lg mb-1"
                resizeMode="cover"
                onError={() => {
                  console.log('이미지 로드 실패', selectedPlant?.signed_url, 'signed_url', selectedPlant?.image_url, 'image_url');
                }}
              />
            )}
            
            <View className="mb-4 p-4">
            <View className="flex-row justify-start items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                {selectedPlant?.plant_name || '이름 없는 식물'}
              </Text>
            </View>
              <Text className="text-gray-600 mb-2">
                {selectedPlant?.description || '설명 없음'}
              </Text>
              <Text className="text-gray-500">
                메모: {selectedPlant?.memo || '메모 없음'}
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