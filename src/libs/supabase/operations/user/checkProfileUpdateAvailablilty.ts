import { supabase } from "../../supabase";
import { useAuthStore } from "../../../../store/authStore";

export const checkProfileUpdateAvailability = async (): Promise<{ canUpdate: boolean; nextUpdateDate?: Date }> => {
    /**
     * 사용자 정보 수정 가능 여부를 확인합니다.
     * @returns {Promise<{ canUpdate: boolean; nextUpdateDate?: Date }>} 수정 가능 여부와 다음 수정 가능 날짜
     */
    const { userId } = useAuthStore.getState();
    if (!userId) return { canUpdate: false };
    try {
      const { data, error } = await supabase
        .from('users')
        .select('updated_at')
        .eq('id', userId)
        .single();
  
      if (error) {
        console.error('Error checking profile update availability:', error);
        return { canUpdate: false };
      }
  
      // updated_at이 null이면 수정 가능
      if (!data.updated_at) {
        return { canUpdate: true };
      }
  
      // 마지막 업데이트로부터 한 달이 지났는지 확인
      const lastUpdate = new Date(data.updated_at);
      const oneMonthInFuture = new Date(lastUpdate);
      oneMonthInFuture.setMonth(oneMonthInFuture.getMonth() + 1);
      const today = new Date();
  
      if (today < oneMonthInFuture) { // 한달 내에 수정했으면 (즉, 다음 수정 가능일이 오늘보다 미래면)
        // 다음 수정 가능 날짜 계산
        const nextUpdateDate = new Date(lastUpdate);
        nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 1);
        return { 
          canUpdate: false, 
          nextUpdateDate 
        };
      }
      
      // 한달이 지났거나 오늘이 수정 가능일인 경우
      return { canUpdate: true };
  
    } catch (err) {
      console.error('checkProfileUpdateAvailability function error:', err);
      return { canUpdate: false };
    }
  };