import { supabase } from "../../supabase";
import { useAuthStore } from "../../../../store/authStore";
import { found_plants_columns } from "./type";

export const getFoundPlants = async (userId?: string): Promise<found_plants_columns[] | null> => {
    /**
   * 발견된 식물들의 정보를 가져옵니다.
   * @param {string} [userId] - 특정 사용자의 식물만 가져오려면 사용자 ID를 전달
   * @returns {Promise<Array<{
   *   id: string;
   *   created_at: string;
   *   lat: number;
   *   lng: number;
   *   image_path: string;
   *   plant_name: string;
   *   description: string;
   *   memo: string;
   * }> | null>} 발견된 식물들의 정보 배열 또는 null (오류 발생 시)
   */
    if(__DEV__) console.log('[Function]getFoundPlants');

    // userId가 제공된 경우 인증 확인
    if (userId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if(__DEV__) console.error('No active session found');
        return null;
      }
    }

    try {
      let query = supabase
        .from('found_plants')
        .select('id, created_at, lat, lng, image_path, plant_name, description, memo, type_code, activity_curve, activity_notes')
        .order('created_at', { ascending: false });

      // userId가 제공된 경우 해당 사용자의 식물만 필터링
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
  
      if (error) {
        console.error('Error fetching found plants:', error);
        return null;
      }

      if (__DEV__) {
        console.log('supabase: getFoundPlants', data);
      }
  
      return data;
    } catch (err) {
      console.error('getFoundPlants function error:', err);
      return null;
    }
  };