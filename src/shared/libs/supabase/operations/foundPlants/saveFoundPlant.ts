import { useAuthStore } from "@store/authStore.ts";
import { supabase } from "@libs/supabase/supabase.ts";
import { saveFoundPlantType, found_plants_columns } from "@libs/supabase/operations/foundPlants/type.ts";

  /**
   * found_plants 테이블에 식물 데이터를 저장합니다.
   * @param plantData 저장할 식물 데이터
   * @returns {Promise<{ success: boolean, data?: found_plants_columns, error?: any }>} 저장 성공 여부, 새로 생성된 데이터, 에러 객체
   */
export const saveFoundPlant = async (plantData: saveFoundPlantType): Promise<{ success: boolean, data?: found_plants_columns, error?: any }> => {
    const { userId } = useAuthStore.getState();
    if (!userId) {
      return { success: false, error: new Error('로그인되지 않았습니다.') };
    }
    try {
      const { imagePath, memo, lat, lng, description, plantName, type_code, activity_curve } = plantData;
      console.log('saveFoundPlant', plantData);
      const { data, error } = await supabase.from('found_plants').insert([
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
        },
      ]).select().single();
  
      if (error) {
        console.error('Error saving found plant data:', error);
        return { success: false, error };
      }
  
      return { success: true, data: data as found_plants_columns };
    } catch (err) {
      console.error('saveFoundPlant function error:', err);
      return { success: false, error: err };
    }
  };