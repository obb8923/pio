import { create } from 'zustand';
import { DictionaryColumns } from '../libs/supabase/operations/dictionary/type';
import { getDictionary } from '../libs/supabase/operations/dictionary/getDictionary';

interface DictionaryStore {
  dictionary: DictionaryColumns[] | null;
  loading: boolean;
  fetchDictionary: () => Promise<void>;
  setDictionary: (data: DictionaryColumns[] | null) => void;
}

export const useDictionaryStore = create<DictionaryStore>((set) => ({
  dictionary: null,
  loading: false,
  fetchDictionary: async () => {
    set({ loading: true });
    const data = await getDictionary();
    set({ dictionary: data, loading: false });
  },
  setDictionary: (data) => set({ dictionary: data }),
})); 