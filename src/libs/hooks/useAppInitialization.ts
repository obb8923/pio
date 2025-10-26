import { useState, useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { SUPABASE_WEB_CLIENT_KEY, SUPABASE_IOS_CLIENT_KEY } from "@env";
import { useAuthStore } from "../../store/authStore";
import { usePermissionStore } from "../../store/permissionStore";
import { useTrackingStore } from "../../store/trackingStore";
import { useOnboarding } from "./useOnboarding";
import { type MaintenanceResponse, checkMaintenance } from "../../libs/supabase/operations/normal/checkMaintenance";

/**
 * 앱 초기화 로직을 관리하는 훅
 * - Google Sign-In 설정
 * - 권한 초기화
 * - 추적 권한 요청
 * - 유지보수 상태 확인
 * - 로그인 상태 확인
 * - 온보딩 상태 확인
 */
export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceResponse | null>(null);
  
  const { checkLoginStatus } = useAuthStore();
  const { initPermissions, isInitialized: isPermissionsInitialized } = usePermissionStore();
  const { requestTrackingPermission: requestTracking } = useTrackingStore();
  const { isOnboardingCompleted } = useOnboarding();

  useEffect(() => {
    const initializeApp = async () => {
      try {
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

        // 2. 권한 초기화
        if (!isPermissionsInitialized) {
          await initPermissions();
          if (__DEV__) console.log('[useAppInitialization] Permissions initialized');
        }
        
        // 3. 추적 권한 요청
        try {
          const trackingStatus = await requestTracking();
          if (__DEV__) console.log('[useAppInitialization] Tracking permission status:', trackingStatus);
        } catch (error) {
          if (__DEV__) console.error('[useAppInitialization] Error requesting tracking permission:', error);
        }
        
        // 4. 유지보수 상태 확인
        try {
          const maintenanceData = await checkMaintenance();
          if (maintenanceData) {
            setMaintenanceData(maintenanceData);
            if (__DEV__) console.log('[useAppInitialization] Maintenance data:', maintenanceData);
          }
        } catch (error) {
          if (__DEV__) console.error('[useAppInitialization] Error checking maintenance:', error);
        }
        
        // 5. 로그인 상태 확인
        await checkLoginStatus();
        if (__DEV__) console.log('[useAppInitialization] Login status checked');
        
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

