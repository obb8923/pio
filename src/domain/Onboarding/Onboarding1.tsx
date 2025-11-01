import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Background } from '@components/Background';
import { CustomButton } from '@components/CustomButton';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {OnboardingStackParamList} from "@nav/stack/Onboarding"
import {PlantDetail} from "@components/PlantDetail"
type Onboarding1ScreenProps = NativeStackScreenProps<OnboardingStackParamList,'Onboarding1'>

export const Onboarding1Screen = ({navigation}:Onboarding1ScreenProps) => {
  const { t } = useTranslation('domain');
  const [step, setStep] = useState(1);

  // 애니메이션 값들
  const textTranslateY = useSharedValue(-30);
  const textOpacity = useSharedValue(1); // 텍스트 페이드아웃용 추가
  const contentTranslateY = useSharedValue(100);
  const buttonOpacity = useSharedValue(0);

  // 텍스트 애니메이션 스타일 (opacity 추가)
  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: textTranslateY.value }
      ],
      opacity: textOpacity.value, // opacity 추가
    };
  });

  // 컨텐츠 슬라이드 애니메이션 스타일
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: contentTranslateY.value }],
    };
  });

  // 버튼 페이드인 애니메이션 스타일
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
    };
  });

  // 텍스트 애니메이션 실행 함수
  const animateText = () => {
    textTranslateY.value = -10;
    textTranslateY.value = withSpring(0, { 
      damping: 50, 
      stiffness: 80,
      mass: 1
    });
  };

  // 다음 버튼 클릭 시 애니메이션 + 화면 이동
const handleNextPress = () => {
  // 화면 이동 함수를 별도로 정의
  const navigateToNext = () => {
    navigation.navigate('Onboarding2');
  };
  navigateToNext();
  // // 텍스트 페이드아웃
  // textOpacity.value = withTiming(0, { duration: 400 });
  
  // // 이미지와 컨텐츠를 아래로 슬라이드 아웃
  // imageTranslateY.value = withTiming(300, { duration: 500 });
  // contentTranslateY.value = withTiming(300, { 
  //   duration: 500 
  // }, (finished) => {
  //   // 애니메이션이 완료되면 다음 화면으로 이동
  //   if (finished) {
  //     runOnJS(navigateToNext)();
  //   }
  // });
  
  // // 버튼도 함께 페이드아웃
  // buttonOpacity.value = withTiming(0, { duration: 300 });
};


  // step 변경 시 애니메이션 트리거
  useEffect(() => {
    const timers: any = [];
    
    // 텍스트 애니메이션은 모든 step에서 실행
    animateText();
    
    // step 2: PlantDetail 슬라이드 인 + 버튼 페이드 인
    if (step === 2) {
      contentTranslateY.value = 100;
      contentTranslateY.value = withSpring(0, {
        damping: 100,
        stiffness: 100,
      });
   
      // 컨텐츠 애니메이션이 끝난 후 버튼 페이드인
      setTimeout(() => {
        buttonOpacity.value = withTiming(1, {
          duration: 500,
        });
      }, 300);
    }
    
    // step 2까지 자동 진행 
    if (step < 2) {
      const timer = setTimeout(() => {
        setStep(step + 1);
      }, 1500);
      timers.push(timer);
    }
    
    return () => timers.forEach((t: any) => clearTimeout(t));
  }, [step]);

  return (
    <Background isStatusBarGap={true} isTabBarGap={false}>
      <View className="flex-1 p-4 justify-end items-center">
        {/* message section */}
        <View className="w-full h-1/12 justify-center items-center">
          <Animated.View style={textAnimatedStyle}>
            {step === 1 && <Text className="text-greenTab900 font-bold text-3xl">{t('onboarding.screen1.question')}</Text>}
            {step >= 2 && <Text className="text-greenTab900 font-bold text-3xl">{t('onboarding.screen1.action')}</Text>}
          </Animated.View>
        </View>

        <View className="flex-1 justify-center">
          {/* step 2부터 PlantDetail 표시 */}
          {step >= 2 && (
            <Animated.View style={[contentAnimatedStyle]} className="mt-4 w-full h-full">
              <PlantDetail
                type="detail"
                image_url={require('../../../assets/webps/rose.webp')}
                plant_name={t('onboarding.example.plantName')}
                type_code={1}
                description={t('onboarding.example.description')}
                activity_curve={[0, 0.1, 0.3, 0.6, 0.9, 1, 0.8, 0.6, 0.3, 0.1, 0, 0]}
                isPreviousScreenDictionary={true}
              />
             </Animated.View>
          )}
        </View>

        {/* step 2에서 다음 버튼 표시 */}
        <View className="w-full h-1/6 flex-row justify-end items-center px-4">
          {step >= 2 && (
            <Animated.View style={buttonAnimatedStyle}>
              <CustomButton text={t('common:components.button.next')} size={60} onPress={handleNextPress}/>
            </Animated.View>
          )}
        </View>
      </View>
    </Background>
  );
};
