import { useModalBackgroundStore } from "../../store/modalStore";
import { useEffect } from "react";
export const useModalBackground = (isVisible:boolean) => {
  const { isOpenModalBackground, openModalBackground, closeModalBackground } = useModalBackgroundStore();
  useEffect(()=>{
    if(isVisible){
      openModalBackground();
    }else{
      closeModalBackground();
    }
  },[isVisible])
  return { isOpenModalBackground, closeModalBackground };
};