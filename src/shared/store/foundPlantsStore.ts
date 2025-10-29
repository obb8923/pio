import { create } from 'zustand';
import { found_plants_columns } from '@libs/supabase/operations/foundPlants/type.ts';

interface FoundPlantsState {
  myPlants: found_plants_columns[];
  allPlants: found_plants_columns[];
  setMyPlants: (plants: found_plants_columns[]) => void;
  setAllPlants: (plants: found_plants_columns[]) => void;
}

export const useFoundPlantsStore = create<FoundPlantsState>((set) => ({
  myPlants: [],
  allPlants: [],
  setMyPlants: (plants) => set({ myPlants: plants }),
  setAllPlants: (plants) => set({ allPlants: plants }),
})); 