import { supabase } from "../../supabase";

export const requestAccountDeletion = async (): Promise<{ success: boolean, error?: any }> => {
    console.log('Supabase 회원 탈퇴 요청 시도');
  /**
   * 회원 탈퇴를 위한 Supabase Edge Function 호출을 요청합니다.
   * 실제 삭제 로직은 'delete-user' Edge Function에서 처리됩니다.
   * @returns {Promise<{ success: boolean, error?: any }>} 요청 성공 여부와 에러 객체
   */
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