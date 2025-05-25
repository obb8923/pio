import { supabase } from './supabase';

/**
 * 현재 로그인된 Supabase 사용자의 ID를 가져옵니다.
 * @returns {Promise<string | null>} 사용자 ID 또는 null (로그인되지 않았거나 오류 발생 시)
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.log('Supabase 사용자 정보 가져오기 오류:', error);
      return null; // 오류 발생 시 null 반환
    }

    if (!user) {
      console.log('로그인된 사용자가 없습니다.');
      return null; // 사용자 정보가 없으면 null 반환
    }

    return user.id; // 사용자 ID 반환

  } catch (err) {
    console.error('getCurrentUserId 함수 오류:', err);
    return null; // 예외 발생 시 null 반환
  }
};

/**
 * 회원 탈퇴를 위한 Supabase Edge Function 호출을 요청합니다.
 * 실제 삭제 로직은 'delete-user' Edge Function에서 처리됩니다.
 * @returns {Promise<{ success: boolean, error?: any }>} 요청 성공 여부와 에러 객체
 */
export const requestAccountDeletion = async (): Promise<{ success: boolean, error?: any }> => {
  console.log('Supabase 회원 탈퇴 요청 시도');

  try {
    // 'delete-user'는 실제 구현된 Edge Function의 이름이어야 합니다.
    const { error } = await supabase.functions.invoke('delete-user');

    if (error) {
      console.error('회원 탈퇴 Edge Function 호출 오류:', error);
      // Edge Function에서 반환한 구체적인 오류 메시지를 포함할 수 있습니다.
      return { success: false, error: new Error(error.message || '회원 탈퇴 처리 중 서버 오류가 발생했습니다.') };
    }

    console.log('회원 탈퇴 요청 성공');
    return { success: true };

  } catch (err: any) { // catch 블록에서 err 타입을 명시적으로 any 또는 Error로 지정
    console.error('requestAccountDeletion 함수 처리 중 예외 발생:', err);
    // 네트워크 오류 등 invoke 자체의 실패일 수 있습니다.
    // err 객체가 message 속성을 가지고 있는지 확인
    const errorMessage = err?.message || '회원 탈퇴 요청 중 알 수 없는 오류가 발생했습니다.';
    return { success: false, error: new Error(errorMessage) };
  }
};

/**
 * 현재 로그인된 사용자의 닉네임을 가져옵니다.
 * @returns {Promise<string | null>} 사용자의 닉네임 또는 null (로그인되지 않았거나 오류 발생 시)
 */
export const getUserNickname = async (): Promise<string | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error fetching user or user not logged in:', userError);
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('nickname')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user nickname:', error);
      return null;
    }

    return data?.nickname || null;
  } catch (err) {
    console.error('getUserNickname function error:', err);
    return null;
  }
};

/**
 * 사용자의 닉네임 변경 가능 여부를 확인합니다.
 * @returns {Promise<{ canUpdate: boolean, message?: string }>} 변경 가능 여부와 메시지
 */
export const checkNicknameUpdateAvailability = async (): Promise<{ canUpdate: boolean, message?: string }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { canUpdate: false, message: '사용자 인증에 실패했습니다.' };
    }

    const { data, error } = await supabase
      .from('users')
      .select('last_profile_update_at')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error checking nickname update availability:', error);
      return { canUpdate: false, message: '닉네임 변경 가능 여부를 확인하는 중 오류가 발생했습니다.' };
    }

    // last_profile_update_at이 null이면 변경 가능
    if (!data.last_profile_update_at) {
      return { canUpdate: true };
    }

    // 마지막 업데이트로부터 한 달이 지났는지 확인
    const lastUpdate = new Date(data.last_profile_update_at);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (lastUpdate < oneMonthAgo) {
      return { canUpdate: true };
    }

    // 다음 변경 가능 날짜 계산
    const nextUpdateDate = new Date(lastUpdate);
    nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 1);
    
    return { 
      canUpdate: false, 
      message: `다음 닉네임 변경은 ${nextUpdateDate.toLocaleDateString()}부터 가능합니다.` 
    };
  } catch (err) {
    console.error('checkNicknameUpdateAvailability function error:', err);
    return { canUpdate: false, message: '닉네임 변경 가능 여부를 확인하는 중 오류가 발생했습니다.' };
  }
};

/**
 * 사용자의 닉네임을 업데이트합니다.
 * @param newNickname 새로운 닉네임
 * @returns {Promise<{ success: boolean, error?: any }>} 업데이트 성공 여부와 에러 객체
 */
export const updateUserNickname = async (newNickname: string): Promise<{ success: boolean, error?: any }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: new Error('사용자 인증에 실패했습니다.') };
    }

    const { error } = await supabase
      .from('users')
      .update({ 
        nickname: newNickname,
        last_profile_update_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating nickname:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('updateUserNickname function error:', err);
    return { success: false, error: err };
  }
};