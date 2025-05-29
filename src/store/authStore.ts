import { create } from 'zustand';
import { supabase } from '../libs/supabase/supabase'; // supabase 클라이언트 경로 확인 필요
import { GoogleSignin, User } from '@react-native-google-signin/google-signin';
import { Alert } from 'react-native';

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean; // 로딩 상태 추가
  checkLoginStatus: () => Promise<void>;
  login: () => void; // 이 함수는 Google 로그인 성공 후 호출되거나, 다른 로그인 방식에 사용될 수 있습니다.
  logout: () => Promise<void>;
  handleGoogleLogin: () => Promise<void>; // Google 로그인 함수 추가
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  isLoading: false, // 초기 로딩 상태 false로 변경 (checkLoginStatus에서 관리)
  checkLoginStatus: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({ isLoggedIn: true });
      } else {
        set({ isLoggedIn: false });
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      set({ isLoggedIn: false }); // 오류 발생 시 로그아웃
    } finally {
      set({ isLoading: false });
    }
  },
  login: () => set({ isLoggedIn: true, isLoading: false }), // 로그인 시 로딩 false
  logout: async () => {
    set({ isLoading: true }); // 로그아웃 시작 시 로딩 true
    try {
      await supabase.auth.signOut();
      set({ isLoggedIn: false });
    } catch (error) {
      console.error('Error logging out:', error);
      set({ isLoggedIn: false }); // 오류 발생 시에도 로그아웃
    } finally {
      set({ isLoading: false }); // 로그아웃 완료 시 로딩 false
    }
  },
  handleGoogleLogin: async () => {
    set({ isLoading: true });
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo: any = await GoogleSignin.signIn();
      console.log('Google UserInfo:', JSON.stringify(userInfo, null, 2));

      if (userInfo && userInfo.data && userInfo.data.idToken) {
        const idToken = userInfo.data.idToken;
        console.log('ID Token received:', idToken.substring(0, 10) + '...');

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) {
          console.error('Supabase 로그인 에러 상세:', {
            message: error.message,
            status: error.status,
            name: error.name,
            details: error
          });
          let errorMessage = '로그인 중 오류가 발생했습니다.';
          if (error.status === 400) {
            errorMessage = '인증 정보가 올바르지 않습니다.';
          } else if (error.status === 500) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          }
          Alert.alert('Google 로그인 오류', errorMessage);
          set({ isLoggedIn: false }); // 로그인 실패
        } else if (data.session) {
          console.log('구글 로그인 성공, 현재 사용자 정보:', data.user);
          
          set({ isLoggedIn: true }); // 로그인 성공 상태로 변경
        }
      } else {
        console.error('Google ID 토큰을 받지 못했습니다:', userInfo);
        Alert.alert('Google 로그인 오류', 'Google 인증 정보를 받지 못했습니다.');
        set({ isLoggedIn: false }); // 로그인 실패
      }
    } catch (error: any) {
      if (error.code) {
        console.log('Google Sign-In error code:', error.code, error.message);
        // 사용자가 로그인을 취소한 경우 (12501)는 특별한 알림 없이 처리
        if (String(error.code) !== '12501' && String(error.code) !== 'SIGN_IN_CANCELLED') {
          Alert.alert('Google 로그인 오류', `오류 코드: ${error.code} - ${error.message}`);
        }
      } else {
        console.log('Google Sign-In unexpected error:', error);
        Alert.alert('Google 로그인 오류', '알 수 없는 오류가 발생했습니다.');
      }
      set({ isLoggedIn: false }); // 모든 예외 발생 시 로그인 실패 및 로딩 종료
    } finally {
      set({ isLoading: false });
    }
  },
}));
