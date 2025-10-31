import { create } from 'zustand';
import { DictionaryColumns } from '@libs/supabase/operations/dictionary/type.ts';
import { getDictionary } from '@libs/supabase/operations/dictionary/getDictionary.ts';

interface DictionaryStore {
  dictionary: DictionaryColumns[] | null;
  loading: boolean;
  isFetched: boolean; // 한 번이라도 가져왔는지 여부
  fetchDictionary: () => Promise<void>;
  setDictionary: (data: DictionaryColumns[] | null) => void;
}

export const useDictionaryStore = create<DictionaryStore>((set, get) => ({
  dictionary: null,
  loading: false,
  isFetched: false,
  fetchDictionary: async () => {
    // 이미 데이터가 있고 로딩이 완료되었다면 다시 가져오지 않음
    if (get().dictionary && get().isFetched) {
      return;
    }
    
    // 이미 로딩 중이면 중복 호출 방지
    if (get().loading) {
      return;
    }
    
    set({ loading: true });
    const data = await getDictionary();
    set({ dictionary: data, loading: false, isFetched: true });
  },
  setDictionary: (data) => set({ dictionary: data }),
})); 