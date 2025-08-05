import React, { useEffect } from 'react';
import { Background } from '../../components/Background';
import { CustomButton } from '../../components/CustomButton';
import { View, Image, Text } from 'react-native';
import { flowerImages, plantTypeImages } from '../App/Map/constants/images';
import { useOnboarding } from '../../libs/hooks/useOnboarding'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

export const Onboarding2Screen = () => {
  const { completeOnboarding } = useOnboarding();
  // 애니메이션 값들
  const textTranslateY = useSharedValue(-30);
  const buttonOpacity = useSharedValue(0);
  
  // 리플 애니메이션을 위한 값들
  const rippleScale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0.3);
  
  // 모든 이미지 결합 (필터링된 이미지들)
  const allImages = [
    ...flowerImages.filter((_, index) => ![3, 4].includes(index)),
    ...plantTypeImages.filter((_, index) => index !== 1)
  ];
  
  // 각 꽃의 애니메이션 값들
  const flowerPositions = allImages.map(() => ({
    x: useSharedValue(0),
    y: useSharedValue(0)
  }));

  // 리플 애니메이션 스타일
  const rippleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: rippleScale.value }],
      opacity: rippleOpacity.value,
    };
  });

  // 기존 애니메이션 스타일들...
  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: textTranslateY.value }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
    };
  });

  const flowerAnimatedStyles = flowerPositions.map((position) =>
    useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: position.x.value },
          { translateY: position.y.value },
        ],
      };
    })
  );

  // 리플 애니메이션 시작 함수
  const startRippleAnimation = () => {
    rippleScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1.0, { duration: 800 })
      ),
      -1, // 무한 반복
      true
    );
    
    rippleOpacity.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1, // 무한 반복
      true
    );
  };

  // 기존 애니메이션 함수들...
  const animateText = () => {
    textTranslateY.value = -10;
    textTranslateY.value = withSpring(0, {
      damping: 50,
      stiffness: 80,
      mass: 1,
    });
  };

  const animateFlowers = () => {
    const radius = 80;
    const imageCount = allImages.length;
    const angleStep = 360 / imageCount;

    flowerPositions.forEach((position, index) => {
      const angle = (angleStep * index * Math.PI) / 180;
      const targetX = Math.cos(angle) * radius;
      const targetY = Math.sin(angle) * radius;

      position.x.value = withSpring(targetX, {
        damping: 8,
        stiffness: 150,
      });
      position.y.value = withSpring(targetY, {
        damping: 8,
        stiffness: 150,
      });
    });
  };

  const animateButton = () => {
    buttonOpacity.value = withTiming(1, {
      duration: 500,
    });
  };

  const handleNextPress = () => {
    completeOnboarding();
    // console.log('다음 화면으로 이동');
  };

  // 애니메이션 시퀀스 실행
  useEffect(() => {
    // 1. 텍스트 애니메이션 (즉시)
    animateText();
    
    // 2. 꽃 애니메이션 (500ms 후)
    setTimeout(() => {
      animateFlowers();
    }, 500);
    
    // 3. 리플 애니메이션 시작 (800ms 후)
    setTimeout(() => {
      startRippleAnimation();
    }, 800);
    
    // 4. 버튼 애니메이션 (1200ms 후)
    setTimeout(() => {
      animateButton();
    }, 1200);
  }, []);

  return (
    <Background isStatusBarGap={true} isTabBarGap={false}>
      <View className="flex-1 p-4 justify-end items-center">
        {/* message section */}
        <View className="w-full h-1/6 justify-center items-center">
          <Animated.View style={textAnimatedStyle}>
            <Text className="text-greenTab900 font-bold text-3xl text-center">
              {`근처 식물을\n확인해보세요!`}
            </Text>
          </Animated.View>
        </View>

        {/* ui animation section */}
        <View className="w-full h-4/6 px-4 justify-center items-center">
          <View className="relative justify-center items-center">
            {/* 리플 효과를 위한 외부 원 */}
            <Animated.View 
              style={[
                rippleAnimatedStyle,
                {
                  position: 'absolute',
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: '#3B82F6',
                  backgroundColor: 'transparent',
                  zIndex: 5,
                }
              ]} 
            />
            
            {/* 하얀색 원 안에 파란색 점 */}
            <View className="w-8 h-8 bg-white rounded-full absolute z-10 justify-center items-center">
              <View className="w-6 h-6 bg-blue-500 rounded-full" />
            </View>
            
            {/* 꽃들과 식물들 */}
            {allImages.map((image, index) => (
              <Animated.View
                key={index}
                style={[
                  flowerAnimatedStyles[index],
                  { position: 'absolute' }
                ]}
              >
                <Image
                  className="h-8 w-8"
                  source={image}
                />
              </Animated.View>
            ))}
          </View>
        </View>

        {/* 다음 버튼 */}
        <View className="w-full h-1/6 flex-row justify-end items-center px-4">
          <Animated.View style={buttonAnimatedStyle}>
            <CustomButton text="확인" size={60} onPress={handleNextPress} />
          </Animated.View>
        </View>
      </View>
    </Background>
  );
};
