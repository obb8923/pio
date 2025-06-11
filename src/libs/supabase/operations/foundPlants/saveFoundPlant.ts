import { useAuthStore } from "../../../../store/authStore";
import { supabase } from "../../supabase";

export const saveFoundPlant = async (plantData: {
    userId: string;
    imagePath: string;
    memo: string | null;
    lat: number;
    lng: number;
    description: string | null; // plantName은 description으로 우선 사용합니다. 필요시 컬럼 추가.
    plantName: string | null; 
  }): Promise<{ success: boolean, error?: any }> => {
  
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
      const { imagePath, memo, lat, lng, description, plantName } = plantData;
      console.log('saveFoundPlant', plantData);
      const { error } = await supabase.from('found_plants').insert([
        {
          user_id: userId,
          image_path: imagePath,
          memo: memo,
          lat: lat,
          lng: lng,
          // description 필드에 plantName을 우선 사용하고, AI 분석 결과를 추후 업데이트 할 수 있도록 합니다.
          // 또는 description 필드를 AI 분석 결과용으로 남겨두고, plant_name 필드를 추가하는 것을 고려해야 합니다.
          // 현재는 plantName 값을 description으로 저장합니다.
          description: description || plantName, 
          plant_name: plantName // plant_name 필드가 테이블에 존재한다고 가정합니다. 없다면 마이그레이션 필요.
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