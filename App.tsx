import { NavigationContainer } from "@react-navigation/native";
import "./global.css"
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native'; 
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from './src/store/authStore';
import AppTab from './src/nav/tab/App'; 
import SplashScreen from "react-native-splash-screen";
import { usePermissionStore } from './src/store/permissionStore';
import { useLocationStore } from './src/store/locationStore'; 
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SUPABASE_WEB_CLIENT_KEY, SUPABASE_IOS_CLIENT_KEY } from '@env';

function App(): React.JSX.Element {
  const { isLoggedIn,isLoading: authLoading, checkLoginStatus } = useAuthStore();
  console.log("isLoggedIn App.tsx",isLoggedIn)
  const { requestAllPermissions} = usePermissionStore();
  const { fetchLocation } = useLocationStore();

  // 상태 변수들
  const [allPermissionsRequested, setAllPermissionsRequested] = useState(false);
  const [splashTimerExpired, setSplashTimerExpired] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);

  // 타이머 ID를 저장하기 위한 ref (컴포넌트 리렌더링 시에도 유지)
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Google Sign-In 설정
    try {
      GoogleSignin.configure({
        webClientId: SUPABASE_WEB_CLIENT_KEY,
        iosClientId: SUPABASE_IOS_CLIENT_KEY,
        scopes: ['profile', 'email'],
      });
    } catch (error) {
      console.error('[App.tsx] Google Sign-In configuration error:', error);
    }
  }, []); 

  useEffect(() => {
    // 앱 시작 시 로그인 상태 체크
    checkLoginStatus();
  }, [checkLoginStatus]);

  useEffect(() => {
    // 1. 1.5초 타이머 시작
    timerIdRef.current = setTimeout(() => {
      setSplashTimerExpired(true);
    }, 1500);

    // 백업 타이머 - 3초 후 강제로 스플래시 숨김
    const backupTimer = setTimeout(() => {
      setAllPermissionsRequested(true);
      setSplashTimerExpired(true);
    }, 3000);

    // 2. 모든 권한 요청 시작
    const requestPermissions = async () => {
      try {
        const allGranted = await requestAllPermissions();
        if (allGranted) {
          fetchLocation();
        }
      } catch (error) {
        console.error("[App.tsx] Error during permission request: ", error);
      } finally {
        setAllPermissionsRequested(true);
      }
    };

    requestPermissions();

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      clearTimeout(backupTimer);
    };
  }, [fetchLocation, requestAllPermissions]);

  // 스플래시 화면 숨김 조건 확인 Effect
  useEffect(() => {
    if (!splashHidden && allPermissionsRequested && splashTimerExpired) {
      try {
        SplashScreen.hide();
        setSplashHidden(true);
      } catch (error) {
        console.error('[App.tsx] Error hiding splash screen:', error);
        // 에러가 발생해도 상태는 업데이트하여 무한 대기 방지
        setSplashHidden(true);
      }
    }
  }, [allPermissionsRequested, splashTimerExpired, splashHidden]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex:1}}>
        <SafeAreaView style={{flex:1}} edges={[ 'left', 'right']} >
          <NavigationContainer>
            <StatusBar barStyle="dark-content" translucent={true}/>
            <AppTab />
          </NavigationContainer>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;
