import 'react-native-url-polyfill/auto'; // URL polyfill 필요
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';


if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL 또는 Anon Key가 설정되지 않았습니다.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage, // 세션 유지용 세션 데이터를 저장할 저장소 지정, React Native 환경에서는 AsyncStorage 사용
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,// React Native에서는 일반적으로 false로 설정합니다.
  },
}); 

// 선택 사항: 연결 상태 확인 (개발 중 유용)
// supabase.auth.getSession().then(({ data: { session } }) => {
//   if (session) {
//     console.log('Supabase 세션이 성공적으로 연결되었습니다.');
//   } else {
//     console.log('Supabase 세션 연결에 실패했거나 기존 세션이 없습니다.');
//   }
// }).catch(error => {
//   console.error('Supabase 세션 확인 중 오류 발생:', error);
// });