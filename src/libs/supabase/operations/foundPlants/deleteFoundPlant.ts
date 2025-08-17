import { useAuthStore } from "../../../../store/authStore";
import { supabase } from "../../supabase";

/**
 * found_plants 테이블의 식물 정보를 삭제합니다.
 * @param id 삭제할 식물 row의 id
 * @returns {Promise<{ success: boolean, error?: any }>} 삭제 성공 여부와 에러 객체
 */
export const deleteFoundPlant = async (
  id: string
): Promise<{ success: boolean; error?: any }> => {
  const { userId } = useAuthStore.getState();
  if (!userId) {
    return { success: false, error: new Error('로그인되지 않았습니다.') };
  }
  try {
    const { error } = await supabase
      .from('found_plants')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      console.error('Error deleting found plant data:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error('deleteFoundPlant function error:', err);
    return { success: false, error: err };
  }
};




