import { create } from "zustand";

interface ModalBackgroundStoreState {
  isOpenModalBackground: boolean;
  openModalBackground: () => void;
  closeModalBackground: () => void;
  forceCloseModalBackground: () => void; // 강제로 모달 배경 닫기
}

export const useModalBackgroundStore = create<ModalBackgroundStoreState>((set) => ({
  isOpenModalBackground: false,
  openModalBackground: () => set({ isOpenModalBackground: true }),
  closeModalBackground: () => set({ isOpenModalBackground: false }),
  forceCloseModalBackground: () => set({ isOpenModalBackground: false }),
}));