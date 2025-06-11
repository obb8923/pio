import { useAuthStore } from "../../../../store/authStore";
import { supabase } from "../../supabase";

    export const getUserInfo = async (): Promise<{
    name: string | null;
    nickname: string | null;
    email: string | null;
    gender: boolean | null;
    birthDate: string | null;
  } | null> => {
    /**
     * 현재 로그인된 사용자의 정보를 가져옵니다.
     * @returns {Promise<{ name: string | null, nickname: string | null, email: string | null, gender: boolean | null, birthDate: string | null } | null>} 
     * 사용자 정보 또는 null (로그인되지 않았거나 오류 발생 시)
     */
    const { userId } = useAuthStore.getState();
    if (!userId) return null;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
  
      if (userError || !user) {
        console.error('Error fetching user or user not logged in:', userError);
        return null;
      }
  
      const { data, error } = await supabase
        .from('users')
        .select('name, nickname, email, gender, birthdate')
        .eq('id', user.id)
        .single();
  
      if (error) {
        console.error('Error fetching user info:', error);
        return null;
      }
  
      if (__DEV__) {
        console.log('supabase: getUserInfo', data);
      }
  
      return {
        name: data?.name || null,
        nickname: data?.nickname || null,
        email: data?.email || user.email || null,
        gender: data?.gender,
        birthDate: data?.birthdate || null
      };
    } catch (err) {
      console.error('getUserInfo function error:', err);
      return null;
    }
  };