import { supabase } from "../../supabase";
import { useAuthStore } from "../../../../store/authStore";

export const signOut = async (): Promise<{ success: boolean, error?: any }> => {
    /**
     * Supabase에서 로그아웃을 수행합니다.
     * @returns {Promise<{ success: boolean, error?: any }>} 로그아웃 성공 여부와 에러 객체
     */
    const { userId } = useAuthStore.getState();
    if (!userId) {
      return { success: false, error: new Error('로그인되지 않았습니다.') };
    }
    try {
      const { error } = await supabase.auth.signOut();
  
      if (error) {
        console.error('로그아웃 오류:', error);
        return { success: false, error };
      }
  
      console.log('로그아웃 성공');
      return { success: true };
  
    } catch (err: any) {
      console.error('signOut 함수 처리 중 예외 발생:', err);
      const errorMessage = err?.message || '로그아웃 중 알 수 없는 오류가 발생했습니다.';
      return { success: false, error: new Error(errorMessage) };
    }
  };