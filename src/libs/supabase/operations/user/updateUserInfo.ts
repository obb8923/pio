import { useAuthStore } from "../../../../store/authStore";
import { supabase } from "../../supabase";

export const updateUserInfo = async (userData: {
    nickname: string;
    gender: boolean | null;
    birthDate: string | null;
  }): Promise<{ success: boolean; error?: any }> => {
    /**
     * 사용자 정보를 업데이트합니다.
     * @param userData 업데이트할 사용자 정보
     * @returns {Promise<{ success: boolean; error?: any }>} 업데이트 성공 여부와 에러 객체
     */
    const { userId } = useAuthStore.getState();
    if (!userId) {
      return { success: false, error: new Error('로그인되지 않았습니다.') };
    }
    try {
      const { error } = await supabase
        .from('users')
        .update({
          nickname: userData.nickname,
          gender: userData.gender,
          birthdate: userData.birthDate
        })
        .eq('id', userId);
  
      if (error) {
        console.error('Error updating user info:', error);
        return { success: false, error };
      }
  
      return { success: true };
    } catch (err) {
      console.error('updateUserInfo function error:', err);
      return { success: false, error: err };
    }
  };