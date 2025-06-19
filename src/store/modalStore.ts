import { create } from "zustand";

interface ModalBackgroundStoreState {
  isOpenModalBackground: boolean;
  openModalBackground: () => void;
  closeModalBackground: () => void;
}

export const useModalBackgroundStore = create<ModalBackgroundStoreState>((set) => ({
  isOpenModalBackground: false,
  openModalBackground: () => set({ isOpenModalBackground: true }),
  closeModalBackground: () => set({ isOpenModalBackground: false }),
}));