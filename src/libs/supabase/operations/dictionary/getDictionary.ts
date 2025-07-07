import { supabase } from '../../supabase';
import { DictionaryColumns } from './type';

/**
 * dictionary 테이블의 모든 데이터를 가져옵니다.
 * @returns {Promise<DictionaryColumns[] | null>} dictionary 데이터 배열 또는 null (오류 발생 시)
 */
export const getDictionary = async (): Promise<DictionaryColumns[] | null> => {
  try {
    const { data, error } = await supabase
      .from('dictionary')
      .select('*');
    if (error) {
      console.error('Error fetching dictionary:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('getDictionary function error:', err);
    return null;
  }
};
