// 외부 라이브러리
import { useState,useEffect } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SplashScreen from "react-native-splash-screen";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { requestTrackingPermission } from 'react-native-tracking-transparency';

// 글로벌 스타일
import "./global.css";
// 환경 변수
import { SUPABASE_WEB_CLIENT_KEY, SUPABASE_IOS_CLIENT_KEY } from "@env";

// 내부 네비게이션/컴포넌트
import { RootStack } from "./src/nav/stack/Root";
import { OnboardingStack } from "./src/nav/stack/Onboarding";
import { ModalBackground } from "./src/components/ModalBackground";
import { MaintenanceScreen } from "./src/screens/normal/Maintenance";
// 내부 스토어/훅/유틸
import { useAuthStore } from "./src/store/authStore";
import { usePermissionStore } from "./src/store/permissionStore";
import { useTrackingStore } from "./src/store/trackingStore";
import { useOnboarding } from "./src/libs/hooks/useOnboarding";
import { type MaintenanceResponse, checkMaintenance } from "./src/libs/supabase/operations/normal/checkMaintenance";

function App() {
  const { checkLoginStatus } = useAuthStore();
  const { initPermissions, isInitialized } = usePermissionStore();
  const { requestTrackingPermission: requestTracking } = useTrackingStore();
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceResponse | null>(null);
  const { isOnboardingCompleted } = useOnboarding();
 
  useEffect(() => {
    // Google Sign-In 설정
    try {
      GoogleSignin.configure({
        webClientId: SUPABASE_WEB_CLIENT_KEY,
        iosClientId: SUPABASE_IOS_CLIENT_KEY,
        scopes: ['profile', 'email'],
      });
    } catch (error) {
      if(__DEV__) console.error('[App.tsx] Google Sign-In configuration error:', error);
    }
  }, []); 
  
  useEffect(() => {
    // 권한 초기화
    if (!isInitialized) {
      initPermissions();
    }
    
    // 추적 권한 요청 및 상태 관리
    const initializeTracking = async () => {
      try {
        const trackingStatus = await requestTracking();
        console.log('[App.tsx] Tracking permission status:', trackingStatus);
      } catch (error) {
        console.error('[App.tsx] Error requesting tracking permission:', error);
      }
    };
    
    initializeTracking();
  }, []);

  useEffect(() => {
    const maintenance = async () => {
      const maintenanceData: MaintenanceResponse | null = await checkMaintenance();
      if(maintenanceData) setMaintenanceData(maintenanceData);
      console.log('maintenanceData', maintenanceData);
    }
    maintenance();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkLoginStatus();
      } catch (e) {
        if(__DEV__) console.error('[App.tsx] Initialization error:', e);
      } finally {
        SplashScreen.hide();
      }
    }
    initializeApp();
  }, [checkLoginStatus]);
  
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex:1}}>
        <SafeAreaView style={{flex:1}} edges={[ 'left', 'right']} >
          <NavigationContainer>
            <StatusBar barStyle="dark-content" translucent={true}/>
            {maintenanceData?.is_maintenance ? (
              <MaintenanceScreen maintenanceData={maintenanceData}/>
            ) : !isOnboardingCompleted ? (
              <OnboardingStack/>
            ) : (
              <RootStack/>
            )}
          </NavigationContainer>
          <ModalBackground/>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
  
}

export default App;
