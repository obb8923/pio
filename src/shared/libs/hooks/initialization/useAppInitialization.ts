import { useState, useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { SUPABASE_WEB_CLIENT_KEY, SUPABASE_IOS_CLIENT_KEY } from "@env";
import { useAuthStore } from "@store/authStore.ts";
import { usePermissionStore } from "@store/permissionStore.ts";
import { useOnboarding } from "@libs/hooks/useOnboarding.ts";
import { useDictionaryStore } from "@store/dictionaryStore.ts";
import { useFoundPlantsStore } from "@store/foundPlantsStore.ts";
import { type MaintenanceResponse, checkMaintenance } from "@libs/supabase/operations/normal/checkMaintenance.ts";
import { loadSavedLanguage } from "@libs/i18n";
import { useLanguageStore } from "@store/languageStore.ts";

/**
 * 앱 초기화 로직을 관리하는 훅 (권한 요청 제외)
 * - Google Sign-In 설정
 * - 권한 상태 초기화 (요청은 하지 않음)
 * - 유지보수 상태 확인
 * - 로그인 상태 확인
 * - 온보딩 상태 확인
 * 
 * 참고: 권한 요청은 각 화면(예: Map)에서 필요할 때 수행
 */
export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceResponse | null>(null);
  
  const { checkLoginStatus } = useAuthStore();
  const { initPermissions, isInitialized: isPermissionsInitialized } = usePermissionStore();
  const { isOnboardingCompleted } = useOnboarding();
  const { changeLanguage } = useLanguageStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 0. 언어 설정 로드
        try {
          const savedLanguage = await loadSavedLanguage();
          await changeLanguage(savedLanguage as any);
          if (__DEV__) console.log('[useAppInitialization] Language loaded:', savedLanguage);
        } catch (error) {
          if (__DEV__) console.error('[useAppInitialization] Error loading language:', error);
        }

        // 1. Google Sign-In 설정
        try {
          GoogleSignin.configure({
            webClientId: SUPABASE_WEB_CLIENT_KEY,
            iosClientId: SUPABASE_IOS_CLIENT_KEY,
            scopes: ['profile', 'email'],
          });
          if (__DEV__) console.log('[useAppInitialization] Google Sign-In configured');
        } catch (error) {
          if (__DEV__) console.error('[useAppInitialization] Google Sign-In configuration error:', error);
        }

        // 2. 권한 상태 초기화 (체크만, 요청은 하지 않음)
        if (!isPermissionsInitialized) {
          await initPermissions();
          if (__DEV__) console.log('[useAppInitialization] Permissions initialized');
        }
        
        // 3. 유지보수 상태 확인
        try {
          const maintenanceData = await checkMaintenance();
          if (maintenanceData) {
            setMaintenanceData(maintenanceData);
            if (__DEV__) console.log('[useAppInitialization] Maintenance data:', maintenanceData);
          }
        } catch (error) {
          if (__DEV__) console.error('[useAppInitialization] Error checking maintenance:', error);
        }
        
        // 4. 로그인 상태 확인
        await checkLoginStatus();
        if (__DEV__) console.log('[useAppInitialization] Login status checked');
        
        // 5. Dictionary 데이터 사전 로딩 (비동기, 블로킹하지 않음)
        try {
          const { dictionary, fetchDictionary } = useDictionaryStore.getState();
          if (!dictionary) {
            fetchDictionary(); // Promise를 await하지 않아도 됨 (백그라운드 로딩)
            if (__DEV__) console.log('[useAppInitialization] Dictionary data loading started');
          }
        } catch (error) {
          if (__DEV__) console.error('[useAppInitialization] Error loading dictionary:', error);
        }
        
        // 5-1. AllPlants 데이터 사전 로딩 (비동기, 블로킹하지 않음)
        try {
          const { fetchAllPlants } = useFoundPlantsStore.getState();
          fetchAllPlants(); // Promise를 await하지 않아도 됨 (백그라운드 로딩)
          if (__DEV__) console.log('[useAppInitialization] AllPlants data loading started');
        } catch (error) {
          if (__DEV__) console.error('[useAppInitialization] Error loading allPlants:', error);
        }
        
        // 6. MyPlants 데이터 사전 로딩 (로그인된 경우만)
        try {
          const { userId } = useAuthStore.getState();
          if (userId) {
            const { fetchMyPlants } = useFoundPlantsStore.getState();
            fetchMyPlants(); // Promise를 await하지 않아도 됨 (백그라운드 로딩)
            if (__DEV__) console.log('[useAppInitialization] MyPlants data loading started');
          }
        } catch (error) {
          if (__DEV__) console.error('[useAppInitialization] Error loading myPlants:', error);
        }
        
        setIsInitialized(true);
      } catch (error) {
        if (__DEV__) console.error('[useAppInitialization] Initialization error:', error);
        // 에러가 발생해도 초기화는 완료된 것으로 간주
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  return {
    isInitialized,
    maintenanceData,
    isOnboardingCompleted,
  };
};

