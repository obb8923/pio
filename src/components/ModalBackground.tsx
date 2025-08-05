import { Animated } from "react-native";
import { useModalBackgroundStore } from "../store/modalBackgroundStore";
import { useEffect, useRef } from "react";
import { MODAL_ANIMATION_DURATION_OPEN, MODAL_ANIMATION_DURATION_CLOSE } from "../constants/normal";

export const ModalBackground = () => {
  const { isOpenModalBackground } = useModalBackgroundStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isOpenModalBackground) {
      // 서서히 나타나기
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: MODAL_ANIMATION_DURATION_OPEN,
        useNativeDriver: true,
      }).start();
    } else {
      // 서서히 사라지기
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: MODAL_ANIMATION_DURATION_CLOSE,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpenModalBackground, fadeAnim]);
  
  return (
    <Animated.View 
      pointerEvents="none"
      className="absolute top-0 left-0 w-full h-full bg-black/50"
      style={{
        opacity: fadeAnim,
      }}
    />  
  );
};