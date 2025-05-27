import { View, Text, TouchableOpacity, ScrollView, Image, Animated } from "react-native";
import { Background } from "../../../components/Background";
import { useState, useRef } from "react";
import LinearGradient from 'react-native-linear-gradient';

// 예시 데이터
const SAMPLE_IMAGES = {
  pokedex: [
    { id: 1, uri: 'https://picsum.photos/200/300', date: '2024-03-20' },
    { id: 2, uri: 'https://picsum.photos/200/301', date: '2024-03-19' },
    { id: 3, uri: 'https://picsum.photos/200/302', date: '2024-03-18' },
  ],
  plant: [
    { id: 4, uri: 'https://picsum.photos/200/303', date: '2024-03-17' },
    { id: 5, uri: 'https://picsum.photos/200/304', date: '2024-03-16' },
    { id: 6, uri: 'https://picsum.photos/200/305', date: '2024-03-15' },
  ]
};

export const PiodexScreen = () => {
  const [activeTab, setActiveTab] = useState<'piodex' | 'plant'>('piodex');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleTabPress = (tab: 'piodex' | 'plant') => {
    const toValue = tab === 'piodex' ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (activeTab === 'piodex') {
      return (
        <View className="flex-row flex-wrap justify-between">
          {SAMPLE_IMAGES.pokedex.map((image) => (
            <View key={image.id} className="w-[48%] mb-4 bg-white rounded-lg overflow-hidden shadow-sm">
              <Image source={{ uri: image.uri }} className="w-full h-[200px]" resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,1)']}
                className="absolute bottom-0 left-0 right-0 h-1/2 justify-end p-2"
              >
                <Text className="text-xs text-white font-medium">
                  {image.date}
                </Text>
              </LinearGradient>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View className="flex-row flex-wrap justify-between">
        {SAMPLE_IMAGES.plant.map((image) => (
          <View key={image.id} className="w-[48%] mb-4 bg-white rounded-lg overflow-hidden shadow-sm">
            <Image source={{ uri: image.uri }} className="w-full h-[200px]" resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,1)']}
              className="absolute bottom-0 left-0 right-0 h-1/2 justify-end p-2"
            >
              <Text className="text-xs text-white font-medium">
                {image.date}
              </Text>
            </LinearGradient>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Background>
      <View className="flex-1 p-4">
        <View className="flex-row mb-4 bg-gray-100 rounded-lg p-1 relative">
          <Animated.View 
            className="absolute bg-white rounded-md shadow-sm"
            style={{
              width: '50%',
              height: '100%',
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 100]
                })
              }]
            }}
          />
          <TouchableOpacity 
            className="flex-1 py-2 items-center rounded-md z-10"
            onPress={() => handleTabPress('piodex')}
          >
            <Text className={`text-base ${activeTab === 'piodex' ? 'text-black font-semibold' : 'text-gray-600'}`}>
              도감
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-1 py-2 items-center rounded-md z-10"
            onPress={() => handleTabPress('plant')}
          >
            <Text className={`text-base ${activeTab === 'plant' ? 'text-black font-semibold' : 'text-gray-600'}`}>
              식물 사전
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {renderContent()}
        </ScrollView>
      </View>
    </Background>
  );
};

