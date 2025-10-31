import { create } from 'zustand';
import { found_plants_columns } from '@libs/supabase/operations/foundPlants/type.ts';
import { getFoundPlants } from '@libs/supabase/operations/foundPlants/getFoundPlants.ts';
import { useAuthStore } from '@store/authStore.ts';

interface FoundPlantsState {
  myPlants: found_plants_columns[];
  allPlants: found_plants_columns[];
  isFetched: boolean; // myPlants가 한 번이라도 가져왔는지 여부
  loadingMy: boolean;
  loadingAll: boolean;
  fetchMyPlants: () => Promise<void>;
  fetchAllPlants: () => Promise<void>;
  addPlant: (plant: found_plants_columns) => void;
  updatePlant: (id: string, updateData: Partial<found_plants_columns>) => void;
  removePlant: (id: string) => void;
  setMyPlants: (plants: found_plants_columns[]) => void;
  setAllPlants: (plants: found_plants_columns[]) => void;
}

export const useFoundPlantsStore = create<FoundPlantsState>((set, get) => ({
  myPlants: [],
  allPlants: [],
  isFetched: false,
  loadingMy: false,
  loadingAll: false,
  
  fetchMyPlants: async () => {
    // 이미 데이터가 있고 로딩이 완료되었다면 다시 가져오지 않음
    if (get().myPlants.length > 0 && get().isFetched) {
      return;
    }
    
    // 이미 로딩 중이면 중복 호출 방지
    if (get().loadingMy) {
      return;
    }
    
    const { userId } = useAuthStore.getState();
    if (!userId) {
      return; // 로그인되지 않은 경우 스킵
    }
    
    set({ loadingMy: true });
    try {
      const plants = await getFoundPlants(userId);
      if (plants) {
        set({ myPlants: plants, isFetched: true, loadingMy: false });
      } else {
        set({ loadingMy: false });
      }
    } catch (error) {
      console.error('Error fetching my plants:', error);
      set({ loadingMy: false });
    }
  },
  
  fetchAllPlants: async () => {
    if (get().loadingAll) {
      return;
    }
    
    set({ loadingAll: true });
    try {
      const plants = await getFoundPlants();
      if (plants) {
        set({ allPlants: plants, loadingAll: false });
      } else {
        set({ loadingAll: false });
      }
    } catch (error) {
      console.error('Error fetching all plants:', error);
      set({ loadingAll: false });
    }
  },
  
  addPlant: (plant) => {
    set((state) => ({
      myPlants: [plant, ...state.myPlants], // 최신 항목을 앞에 추가
    }));
  },
  
  updatePlant: (id, updateData) => {
    set((state) => ({
      myPlants: state.myPlants.map((plant) =>
        plant.id === id ? { ...plant, ...updateData } : plant
      ),
    }));
  },
  
  removePlant: (id) => {
    set((state) => ({
      myPlants: state.myPlants.filter((plant) => plant.id !== id),
    }));
  },
  
  setMyPlants: (plants) => set({ myPlants: plants }),
  setAllPlants: (plants) => set({ allPlants: plants }),
})); 