import { create } from 'zustand';
import { supabase } from '../libs/supabase/supabase'; // supabase 클라이언트 경로 확인 필요

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean; // 로딩 상태 추가
  checkLoginStatus: () => Promise<void>;
  login: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isLoading: true, // 초기 로딩 상태 true
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
}));
