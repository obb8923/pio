import { supabase } from "../../supabase";

/**
 * 유지보수 상태 정보를 위한 인터페이스
 * @property is_maintenance - 유지보수 상태 여부
 * @property text - 유지보수 관련 메시지
 * @property until - 유지보수 종료 예정 시간
 */
export type MaintenanceResponse = {
  is_maintenance: boolean;
  message: string | null;
  until: string | null;
}

/**
 * 현재 시스템의 유지보수 상태 정보를 조회하는 함수
 * normal 테이블에서 id가 0인 레코드의 유지보수 관련 정보를 조회
 * 
 * @returns {Promise<MaintenanceResponse | null>} 유지보수 상태 정보 또는 null
 */
export const checkMaintenance = async (): Promise<MaintenanceResponse | null> => {
  try {
    const { data, error } = await supabase
      .from('normal')
      .select('is_maintenance, message, until')
      .eq('id', 0)
      .single();

    if (error) throw error;
    
    return {
      is_maintenance: data.is_maintenance,
      message: data.message,
      until: data.until
    };
  } catch (error) {
    console.error('checkMaintenance function error:', error);
    return null;
  }
};