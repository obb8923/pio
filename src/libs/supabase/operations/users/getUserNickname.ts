import { supabase } from '../../supabase';
import { useAuthStore } from '../../../../store/authStore';

export const getUserNickname = async (): Promise<string | null> => {
    /**
   * 현재 로그인된 사용자의 닉네임을 가져옵니다.
   * @returns {Promise<string | null>} 사용자의 닉네임 또는 null (로그인되지 않았거나 오류 발생 시)
   */
    const { userId } = useAuthStore.getState();
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('nickname')
        .eq('id', userId)
        .single();
  
      if (error) {
        console.error('Error fetching user nickname:', error);
        return null;
      }
  
      if (__DEV__) {
        console.log('supabase: getUserNickname', data);
      }
  
      return data?.nickname || null;
    } catch (err) {
      console.error('getUserNickname function error:', err);
      return null;
    }
  };