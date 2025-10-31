import React, { useState } from 'react';
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
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <TouchableOpacity
      className="p-1 mb-1"
      style={{ width: itemWidth, height: itemWidth + 30 }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="w-full h-full rounded-sm overflow-hidden bg-gray-100 items-center">
        <View style={{ position: 'relative', width: '100%', height: itemWidth, borderRadius: 6, overflow: 'hidden' }}>
          <Image
            source={{ uri: imageUrl }}
            className="w-full"
            style={{ 
              height: itemWidth, 
              borderRadius: 6,
              backgroundColor: 'transparent',
              opacity: imageLoaded ? 1 : 0,
            }}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => {}}
          />
          {!imageLoaded && (
            <View 
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: itemWidth,
                backgroundColor: 'transparent',
              }}
            />
          )}
        </View>
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
