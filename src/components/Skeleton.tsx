import { View } from "react-native";
import { useEffect, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import type { DimensionValue, StyleProp, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton = ({ 
  width = "100%", 
  height = 20, 
  borderRadius = 4,
  ...props
}: SkeletonProps) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmerValue.value, [0, 0.5, 1], [0.3, 0.7, 0.3]);
    return {
      opacity,
    };
  });

  return (
    <View 
      className={`bg-gray-50 ${props.className}`}
      style={[props.style,{
        width,
        height,
        borderRadius,
      }]}
    >
      <Animated.View
        className="w-full h-full bg-gray-300"
        style={[
          {
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};