import { useModalBackgroundStore } from "../../store/modalBackgroundStore";
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
  return { isOpenModalBackground, openModalBackground, closeModalBackground };
};