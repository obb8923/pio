import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated, Alert, Linking } from 'react-native';
import { useCameraPermissions } from '../../../../libs/hooks/useCameraPermissions';

export const useFab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { checkAndRequestPermissions } = useCameraPermissions();

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
  const toggle = useCallback(async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const { hasAllPermissions } = await checkAndRequestPermissions();
    
    if (hasAllPermissions) {
      setIsOpen(true);
    } else {
      Alert.alert(
        "권한 필요",
        "식물 추가 기능을 사용하려면 카메라 및 앨범 접근 권한이 모두 필요합니다. 설정에서 권한을 허용해주세요.",
        [
          { text: "취소", style: "cancel" },
          { text: "설정으로 이동", onPress: () => Linking.openSettings() }
        ]
      );
    }
  }, [isOpen, checkAndRequestPermissions]);

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