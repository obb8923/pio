import { TouchableOpacity, View, Animated, Text} from "react-native";
import { useEffect, useRef} from "react";
import { Colors } from "../constants/Colors";
interface TextToggleProps {
  isActive: boolean;
  activeText: string;
  inactiveText: string;
  onToggle: () => void;
  activeColor?: string;
  inactiveColor?: string;
}
//  텍스트가 있는 토글 컴포넌트
export const TextToggle = ({
  isActive,
  activeText,
  inactiveText,
  onToggle,
  activeColor = 'bg-greenTab',
  inactiveColor = 'bg-gray-200',
}: TextToggleProps) => {
  
  // 애니메이션 값 초기화 (isActive 상태에 따라 0 또는 1)
  const animation = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const toggleSize = 20; // 토글 원의 크기
  const fixedWidth = 100; // 토글 컨테이너의 고정 너비

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // 레이아웃 관련 애니메이션이므로 false
    }).start();
  }, [isActive]);

  // 컨테이너 너비에 따라 토글 이동 거리 계산
  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [4, fixedWidth - toggleSize - 4], // 양쪽에 4px 패딩 추가
  });

  // 배경색 애니메이션
  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor.includes('bg-') ? '#e5e7eb' : inactiveColor, 
                 activeColor.includes('bg-') ? Colors.greenTab : activeColor]
  });

  // 활성화 텍스트 투명도 애니메이션
  const activeTextOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1]
  });

  // 비활성화 텍스트 투명도 애니메이션
  const inactiveTextOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0]
  });

  return (
   
    <View 
    className={``}
    style={{width: fixedWidth}}>
      <TouchableOpacity 
        onPress={onToggle}
        activeOpacity={0.8}
        className={`flex flex-row items-center h-auto space-x-2`}
        style={{
          width: fixedWidth,
        }}
      >
        {/* 토글 컨테이너 */}
        <View className="flex-row items-center w-full">
          <Animated.View 
            className="relative w-full h-8 rounded-full justify-center px-4 flex-row items-center"
            style={{ 
              backgroundColor,
            }}
          >
         
              {/* 활성화 텍스트 */}
              <Animated.View style={{ opacity: activeTextOpacity }}
              className="absolute left-0 px-2">
                <Text className={`text-white`}>
                  {activeText}
                </Text>
              </Animated.View>
              
              {/* 비활성화 텍스트 */}
              <Animated.View style={{ opacity: inactiveTextOpacity }}
              className="absolute right-0 px-2">
                <Text className={`text-gray600`}>
                  {inactiveText}
                </Text>
              </Animated.View>
            {/* 토글 핸들 */}
            <Animated.View 
              className={`absolute w-5 h-5 rounded-full flex items-center justify-center ${
                isActive 
                  ? 'bg-greenTab' 
                  : 'bg-gray-300'
              }`}
              style={{ 
                transform: [{ translateX }],
                left: 0 
              }}
            >
              {isActive && (
                <Text className="text-white text-xs font-bold">✓</Text>
              )}
            </Animated.View>
          </Animated.View>
        </View>
      </TouchableOpacity>
      </View>
  );
};

