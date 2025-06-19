import { NavigationContainer} from "@react-navigation/native";
import "./global.css"
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native'; 
import { useEffect, useState } from 'react';
import { useAuthStore } from './src/store/authStore';
import SplashScreen from "react-native-splash-screen";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SUPABASE_WEB_CLIENT_KEY, SUPABASE_IOS_CLIENT_KEY } from '@env';
import { RootStack } from "./src/nav/stack/Root";
import { usePermissionStore } from "./src/store/permissionStore";
import { type MaintenanceResponse, checkMaintenance } from "./src/libs/supabase/operations/normal/checkMaintenance";
import { MaintenanceScreen } from "./src/screens/normal/Maintenance";
import { useNotifee } from './src/libs/hooks/useNotifee';
import { ModalBackground} from './src/components/ModalBackground';

function App(): React.JSX.Element {
  const { checkLoginStatus } = useAuthStore();
  const { initPermissions, isInitialized } = usePermissionStore();
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceResponse | null>(null);

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

  //점검 중일 때 유지보수 화면 표시
  if(maintenanceData && maintenanceData.is_maintenance) {
    return (
      <SafeAreaProvider>
          <SafeAreaView style={{flex:1}} edges={[ 'left', 'right']} >
            <MaintenanceScreen maintenanceData={maintenanceData}/>
          </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex:1}}>
        <SafeAreaView style={{flex:1}} edges={[ 'left', 'right']} >
            <NavigationContainer>
              <StatusBar barStyle="dark-content" translucent={true}/>
              <RootStack/>             
            </NavigationContainer>
            <ModalBackground/>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;
