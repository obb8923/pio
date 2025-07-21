import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';

export const useFab = () => {
  const [isOpen, setIsOpen] = useState(false);

  // 애니메이션 값
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  // 애니메이션 효과
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fabAnimation, {
        toValue: isOpen ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnimation, {
        toValue: isOpen ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  // 버튼 애니메이션 값 계산
  const animations = {
    cameraButtonTranslateY: fabAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -10],
    }),
    galleryButtonTranslateY: fabAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20],
    }),
    buttonScale: fabAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  // FAB 토글 핸들러
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // FAB 닫기 핸들러
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    toggle,
    close,
    fabAnimation,
    overlayAnimation,
    animations
  };
}; 