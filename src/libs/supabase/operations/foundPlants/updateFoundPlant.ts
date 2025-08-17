import { useAuthStore } from "../../../../store/authStore";
import { supabase } from "../../supabase";
import { found_plants_columns } from "./type";

/**
 * found_plants 테이블의 식물 정보를 수정합니다.
 * @param id 수정할 식물 row의 id
 * @param updateData 수정할 데이터 (found_plants_columns의 부분집합)
 * @returns {Promise<{ success: boolean, error?: any }>} 수정 성공 여부와 에러 객체
 */
export const updateFoundPlant = async (
  id: string,
  updateData: Partial<Omit<found_plants_columns, 'id' | 'created_at'>>
): Promise<{ success: boolean; error?: any }> => {
  const { userId } = useAuthStore.getState();
  if (!userId) {
    return { success: false, error: new Error('로그인되지 않았습니다.') };
  }
  try {
    const { error } = await supabase
      .from('found_plants')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      console.error('Error updating found plant data:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error('updateFoundPlant function error:', err);
    return { success: false, error: err };
  }
};




