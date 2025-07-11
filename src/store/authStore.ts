import { create } from 'zustand';
import { supabase } from '../libs/supabase/supabase'; // supabase 클라이언트 경로 확인 필요
import { GoogleSignin, User } from '@react-native-google-signin/google-signin';
import { Alert } from 'react-native';
import { appleAuth } from "@invertase/react-native-apple-authentication";
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { sha256 } from 'js-sha256';

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  userId: string | null;
  checkLoginStatus: () => Promise<void>;
  login: () => void;
  logout: () => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  handleAppleLogin: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  isLoading: false,
  userId: null,
  checkLoginStatus: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({ 
          isLoggedIn: true,
          userId: session.user.id
        });
        if (__DEV__) {
          console.log('[AuthStore] isLoggedIn set to true in checkLoginStatus()');
        }
      } else {
        set({ 
          isLoggedIn: false,
          userId: null 
        });
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      set({ 
        isLoggedIn: false,
        userId: null 
      });
    } finally {
      set({ isLoading: false });
    }
  },
  login: () => {
    set({ isLoggedIn: true, isLoading: false });
    if (__DEV__) {
      console.log('[AuthStore] isLoggedIn set to true in login()');
    }
  },
  logout: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
      set({ 
        isLoggedIn: false,
        userId: null 
      });
    } catch (error) {
      console.error('Error logging out:', error);
      set({ 
        isLoggedIn: false,
        userId: null 
      });
    } finally {
      set({ isLoading: false });
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
          options: {
            queryParams: {
              prompt: 'select_account'
            }
          }as any
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
          set({ isLoggedIn: false });
        } else if (data.session) {
          console.log('구글 로그인 성공, 현재 사용자 정보:', data.user);
          
          set({ 
            isLoggedIn: true,
            userId: data.user.id 
          });
          if (__DEV__) {
            console.log('[AuthStore] isLoggedIn set to true in handleGoogleLogin()');
          }
        }
      } else {
        console.error('Google ID 토큰을 받지 못했습니다:', userInfo);
        Alert.alert('Google 로그인 오류', 'Google 인증 정보를 받지 못했습니다.');
        set({ isLoggedIn: false });
      }
    } catch (error: any) {
      if (error.code) {
        console.log('Google Sign-In error code:', error.code, error.message);
        if (String(error.code) !== '12501' && String(error.code) !== 'SIGN_IN_CANCELLED') {
          Alert.alert('Google 로그인 오류', `오류 코드: ${error.code} - ${error.message}`);
        }
      } else {
        console.log('Google Sign-In unexpected error:', error);
        Alert.alert('Google 로그인 오류', '알 수 없는 오류가 발생했습니다.');
      }
      set({ isLoggedIn: false });
    } finally {
      set({ isLoading: false });
    }
  },
  handleAppleLogin: async () => {
    set({ isLoading: true });
    try {
      // base64url 인코딩 함수 (React Native 호환)
      function base64urlEncode(bytes: number[]) {
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        // @ts-ignore
        return btoa(binary)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
      }
      // 1. nonce 생성 및 해시
      const rawNonce = uuidv4();
      const hashedNonce = sha256(rawNonce); // hex string

      console.log('rawNonce:', rawNonce);
      console.log('hashedNonce:', hashedNonce);
      // 2. Apple 인증 요청 (base64url 인코딩된 nonce 포함)
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        nonce: hashedNonce,
      });
      console.log('Apple identityToken:', appleAuthRequestResponse.identityToken);
      // 3. identityToken 획득 후 Supabase로 전달 (rawNonce 포함)
      if (appleAuthRequestResponse.identityToken) {
        // @ts-ignore
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: appleAuthRequestResponse.identityToken,
          options: { nonce: rawNonce },
        });
        if (error) {
          // 로그인 실패 처리
          console.error('Apple 로그인 에러:', error);
          Alert.alert('Apple 로그인 오류', error.message);
          set({ isLoggedIn: false });
        } else if (data.session) {
          // 로그인 성공 처리
          set({
            isLoggedIn: true,
            userId: data.user.id,
          });
          if (__DEV__) {
            console.log('[AuthStore] isLoggedIn set to true in handleAppleLogin()');
          }
        }
      } else {
        // 인증 토큰이 없는 경우
        const errMsg = 'Apple 인증 토큰이 없습니다.';
        console.error(errMsg);
        Alert.alert('Apple 로그인 오류', errMsg);
        set({ isLoggedIn: false });
      }
    } catch (e: any) {
      // 예외 처리
      console.error('Apple 로그인 예외:', e);
      Alert.alert('Apple 로그인 오류', e instanceof Error ? e.message : String(e));
      set({ isLoggedIn: false });
    } finally {
      // 로딩 상태 해제
      set({ isLoading: false });
    }
  },
}));
