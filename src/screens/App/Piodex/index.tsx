import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PiodexStackParamList } from "../../../nav/stack/Piodex";
import { Background } from "../../../components/Background";
import { PiodexTab } from "./components/PiodexTab";
import { DictionaryTab } from "./components/DictionaryTab/DictionaryTab";
import { DEVICE_WIDTH } from "../../../constants/normal";
import { AdmobBanner } from "../../../components/ads/AdmobBanner";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_BAR_HEIGHT } from "../../../constants/TabNavOptions";
type PiodexScreenProps = NativeStackScreenProps<PiodexStackParamList,'Piodex'>

export const PiodexScreen = ({navigation}:PiodexScreenProps) => {
  const [activeTab, setActiveTab] = useState<'piodex' | 'plant'>('piodex');
  const slideAnim = useState(new Animated.Value(0))[0];
  const insets = useSafeAreaInsets();

  const handleTabChange = (tab: 'piodex' | 'plant') => {
    if (activeTab === tab) return;
    const toValue = tab === 'piodex' ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();
    setActiveTab(tab);
  };

  return (
    <Background type="white" isStatusBarGap={true}> 
      <View className="flex-1 px-4">
        {/* 탭바 */}
        <View className="flex-row justify-between items-center py-6 relative">
          {/* 탭바 애니메이션 움직이는 뷰*/}
          <Animated.View 
            className="absolute bottom-0 left-0 h-full justify-center items-center"
            style={{
              width: '50%',
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, (DEVICE_WIDTH - 32) / 2]
                })
              }]
            }}
          >
            <View className={`${activeTab!=='piodex'&&'ml-1'} flex-row items-center justify-center w-full`}>
            <View className="h-1.5 bg-greenTab rounded-full w-1/12"/>
            </View>
          </Animated.View>
          <TouchableOpacity 
            onPress={() => handleTabChange('piodex')}
            className={`px-6 py-2 h-10 w-1/2 justify-center items-center`}
          >
            <Text className={`text-base ${activeTab === 'piodex' ? 'text-greenTab font-semibold' : 'text-greenInactive'}`}>
              도감
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleTabChange('plant')}
            className={`px-6 py-2 h-10 w-1/2 justify-center items-center`}
          >
            <Text className={`text-center ${activeTab === 'plant' ? 'text-greenTab font-semibold' : 'text-greenInactive'}`}>
              식물 사전
            </Text>
          </TouchableOpacity>
        </View>
        <View className="w-full h-0.5 bg-greenTab rounded-full"/>
        
        {/* 콘텐츠 영역 */}
        <View className="flex-1">
         {
          activeTab === 'piodex' ? <PiodexTab navigation={navigation} /> : <DictionaryTab />
         }
        </View>
      </View>
      <View style={{position:'absolute',bottom:TAB_BAR_HEIGHT,left: 0,right: 0}}>
      <AdmobBanner />
      </View>
    </Background>
  );
};

