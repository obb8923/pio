import { useModalBackgroundStore } from "@store/modalBackgroundStore.ts";
import { useEffect, useRef } from "react";

export const useModalBackground = (isVisible: boolean) => {
  const { isOpenModalBackground, openModalBackground, closeModalBackground } = useModalBackgroundStore();
  const isVisibleRef = useRef(isVisible);
  
  useEffect(() => {
    isVisibleRef.current = isVisible;
    
    if (isVisible) {
      openModalBackground();
    } else {
      // 모달이 닫힐 때 약간의 지연을 두어 애니메이션이 완료된 후 배경을 닫음
      const timer = setTimeout(() => {
        if (!isVisibleRef.current) {
          closeModalBackground();
        }
      }, 300); // 모달 애니메이션 시간과 맞춤
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, openModalBackground, closeModalBackground]);
  
  return { isOpenModalBackground, openModalBackground, closeModalBackground };
};