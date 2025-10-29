import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { DictionaryColumns } from '@libs/supabase/operations/dictionary/type';

interface PlantCardProps {
  plant: DictionaryColumns;
  imageUrl: string;
  itemWidth: number;
  onPress: () => void;
}

export const PlantCard = React.memo<PlantCardProps>(({ 
  plant, 
  imageUrl, 
  itemWidth, 
  onPress 
}) => {
  return (
    <TouchableOpacity
      className="p-1 mb-1"
      style={{ width: itemWidth, height: itemWidth + 30 }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="w-full h-full rounded-sm overflow-hidden bg-gray-100 items-center">
        <Image
          source={{ uri: imageUrl }}
          className="w-full"
          style={{ height: itemWidth, borderRadius: 6 }}
          resizeMode="cover"
          onError={() => {}}
        />
        <Text
          className="text-center mt-1"
          numberOfLines={1}
          style={{ fontSize: 13, fontWeight: "bold" }}
        >
          {plant.plant_name ?? "이름 없음"}
        </Text>
      </View>
    </TouchableOpacity>
  );
});
