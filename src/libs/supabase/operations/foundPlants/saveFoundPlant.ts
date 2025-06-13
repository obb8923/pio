import { useAuthStore } from "../../../../store/authStore";
import { supabase } from "../../supabase";
import { saveFoundPlantType } from "./type";

export const saveFoundPlant = async (plantData: saveFoundPlantType): Promise<{ success: boolean, error?: any }> => {
  
  /**
   * found_plants 테이블에 식물 데이터를 저장합니다.
   * @param plantData 저장할 식물 데이터
   * @returns {Promise<{ success: boolean, error?: any }>} 저장 성공 여부와 에러 객체
   */
    const { userId } = useAuthStore.getState();
    if (!userId) {
      return { success: false, error: new Error('로그인되지 않았습니다.') };
    }
    try {
      const { imagePath, memo, lat, lng, description, plantName, type_code, activity_curve, activity_notes } = plantData;
      console.log('saveFoundPlant', plantData);
      const { error } = await supabase.from('found_plants').insert([
        {
          user_id: userId,
          image_path: imagePath,
          memo: memo,
          lat: lat,
          lng: lng,
          description: description,
          plant_name: plantName,
          type_code: type_code,
          activity_curve: activity_curve,
          activity_notes: activity_notes
        },
      ]);
  
      if (error) {
        console.error('Error saving found plant data:', error);
        return { success: false, error };
      }
  
      return { success: true };
    } catch (err) {
      console.error('saveFoundPlant function error:', err);
      return { success: false, error: err };
    }
  };