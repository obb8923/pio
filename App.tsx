// 외부 라이브러리
import { useState,useEffect } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SplashScreen from "react-native-splash-screen";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

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
import { useNotifee } from "./src/libs/hooks/useNotifee";
import { useOnboarding } from "./src/libs/hooks/useOnboarding";
import { type MaintenanceResponse, checkMaintenance } from "./src/libs/supabase/operations/normal/checkMaintenance";

function App() {
  const { checkLoginStatus } = useAuthStore();
  const { initPermissions, isInitialized } = usePermissionStore();
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceResponse | null>(null);
  const { isOnboardingCompleted } = useOnboarding();
 
  // useNotifee 훅을 호출하여 알림 자동 설정 (반환값은 사용하지 않음)
  useNotifee();

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
