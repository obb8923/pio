import React, { useState, useEffect } from 'react';
import { Background } from '@components/Background';
import { CustomButton } from '@components/CustomButton';
import { View, Image, Text } from 'react-native';
import { Line } from '@components/Line';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {OnboardingStackParamList} from "@nav/stack/Onboarding"

type Onboarding1ScreenProps = NativeStackScreenProps<OnboardingStackParamList,'Onboarding1'>

export const Onboarding1Screen = ({navigation}:Onboarding1ScreenProps) => {
  const [step, setStep] = useState(1);

  // 애니메이션 값들
  const textTranslateY = useSharedValue(-30);
  const textOpacity = useSharedValue(1); // 텍스트 페이드아웃용 추가
  const imageTranslateY = useSharedValue(100);
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

  // 이미지 슬라이드 애니메이션 스타일
  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: imageTranslateY.value }],
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
    
    // step 2: 이미지 슬라이드 인
    if (step === 2) {
      imageTranslateY.value = 100;
      imageTranslateY.value = withSpring(0, {
        damping: 100,
        stiffness: 100,
      });
    }
    
    // step 3: 컨텐츠 슬라이드 인 + 버튼 페이드 인
    if (step === 3) {
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
    
    // step 3까지 자동 진행 
    if (step < 3) {
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
        <View className="w-full h-1/6 justify-center items-center">
          <Animated.View style={textAnimatedStyle}>
            {step === 1 && <Text className="text-greenTab900 font-bold text-3xl">식물이 궁금하다면?</Text>}
            {step === 2 && <Text className="text-greenTab900 font-bold text-3xl">사진을 찍어서</Text>}
            {step >= 3 && <Text className="text-greenTab900 font-bold text-3xl">확인해보세요!</Text>}
          </Animated.View>
        </View>

        <View className="w-full h-4/6 px-4">
          {/* step 2부터 이미지 표시 */}
          {step >= 2 && (
            <Animated.View style={imageAnimatedStyle}>
              <Image
                source={require('../../../assets/webps/rose.webp')}
                className="w-full h-[200] rounded-xl"
                resizeMode="cover"
              />
            </Animated.View>
          )}

          {/* step 3부터 식물 정보 영역 표시 */}
          {step >= 3 && (
            <Animated.View style={contentAnimatedStyle} className="mt-4 w-full bg-white rounded-lg p-4 pb-8">
              {/* 식물 이름 영역 */}
              <View className="mb-4 flex-row justify-center items-center">
                <Text className="rounded-lg p-3 text-center bg-white text-2xl">장미</Text>
              </View>

              {/* 식물 종류 및 활동 곡선 영역 */}
              <View className="flex-row items-center">
                <View className="h-[60px] justify-center items-center" style={{ width: '30%' }}>
                  <Image
                    source={require('../../../assets/pngs/flowers/flower1.png')}
                    className="w-[32px] h-[32px]"
                  />
                  <Text className="text-[#333] text-sm mt-2">꽃</Text>
                </View>
                <View className="h-[40px] w-0.5 bg-gray-200" />
                <View className="justify-center items-center" style={{ width: '70%' }}>
                  <Line data={[0, 0.1, 0.3, 0.6, 0.9, 1, 0.8, 0.6, 0.3, 0.1, 0, 0]} width={200} height={80} />
                </View>
              </View>

              {/* 설명 영역 */}
              <Text className="text-gray-600 min-h-[90px] max-h-[140px] bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-y-scroll">
                장미는 아름다운 꽃으로 널리 알려진 관목 식물이며, 학명은 Rosa spp., 과는 장미과(Rosaceae), 속은 Rosa, 종은 다양합니다. 전 세계적으로 다양한 품종이 있으며, 관상용으로 재배됩니다.
              </Text>
            </Animated.View>
          )}
        </View>

        {/* step 3에서 다음 버튼 표시 */}
        <View className="w-full h-1/6 flex-row justify-end items-center px-4">
          {step >= 3 && (
            <Animated.View style={buttonAnimatedStyle}>
              <CustomButton text="다음" size={60} onPress={handleNextPress}/>
            </Animated.View>
          )}
        </View>
      </View>
    </Background>
  );
};
