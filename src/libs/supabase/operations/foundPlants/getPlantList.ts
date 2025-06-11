import { useAuthStore } from "../../../../store/authStore";
import { supabase } from "../../supabase";

export const getPlantList = async () => {
    /**
   * plant_list 테이블에서 식물 사전 데이터를 가져옵니다.
   * @returns {Promise<Array<{
   *   id: number;
   *   updated_at: string;
   *   image_path: string;
   *   plant_name: string;
   *   description: string;
   * }> | null>} 식물 사전 데이터 배열 또는 null (오류 발생 시)
   */
    const { userId } = useAuthStore.getState();
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('plant_list')
        .select('id, updated_at, image_path, plant_name, description')
        .order('updated_at', { ascending: false });
  
      if (error) {
        console.error('Error fetching plant list:', error);
        return null;
      }
  
      return data;
    } catch (err) {
      console.error('getPlantList function error:', err);
      return null;
    }
  };