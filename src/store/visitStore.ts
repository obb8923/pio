import { create } from 'zustand';

interface VisitState {
  isFirstVisit: boolean;
  setFirstVisit: (value: boolean) => void;
}

export const useVisitStore = create<VisitState>((set) => ({
  isFirstVisit: true,
  setFirstVisit: (value) => set({ isFirstVisit: value }),
})); 