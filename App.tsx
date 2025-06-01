import { NavigationContainer } from "@react-navigation/native";
import "./global.css"
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, Platform } from 'react-native'; 
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from './src/store/authStore';
import AppTab from './src/nav/tab/App'; 
import SplashScreen from "react-native-splash-screen";
import { requestMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { usePermissionStore } from './src/store/permissionStore';
import { useLocationStore } from './src/store/locationStore'; 
import { GoogleSignin } from '@react-native-google-signin/google-signin';

function App(): React.JSX.Element {
  const { isLoading: authLoading, checkLoginStatus } = useAuthStore();
  const {
    location: locationPermission, // from usePermissionStore
    setCameraPermission,
    setPhotoLibraryPermission,
    setLocationPermission
  } = usePermissionStore();
  const { 
    fetchLocation, 
    isLoading: locationFetching, // from useLocationStore
  } = useLocationStore();

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
        webClientId: '957741045904-3p8mgb02fbrb80br6o2j38fnc2g4kadd.apps.googleusercontent.com',
        iosClientId:'957741045904-kn7aqdbfef5k0jtgsedvjqamjkegb6s1.apps.googleusercontent.com',
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

    // 2. 모든 권한 요청 시작
    const requestAllRequiredPermissions = async () => {
      let locationGranted = false;
      try {
        const permissionsToRequest = Platform.select({
          ios: [
            PERMISSIONS.IOS.CAMERA,
            PERMISSIONS.IOS.PHOTO_LIBRARY,
            PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          ],
          android: [
            PERMISSIONS.ANDROID.CAMERA,
            PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ],
          default: [], // 혹시 모를 플랫폼 대비
        });

        if (permissionsToRequest.length === 0) {
          setAllPermissionsRequested(true); // 요청할 권한이 없어도 완료 처리
          return;
        }

        const statuses = await requestMultiple(permissionsToRequest);

        // 각 권한 상태 업데이트 (permissionStore)
        if (Platform.OS === 'ios') {
          setCameraPermission(statuses[PERMISSIONS.IOS.CAMERA] === RESULTS.GRANTED);
          setPhotoLibraryPermission(statuses[PERMISSIONS.IOS.PHOTO_LIBRARY] === RESULTS.GRANTED);
          const iosLocationStatus = statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE];
          setLocationPermission(iosLocationStatus === RESULTS.GRANTED);
          if (iosLocationStatus === RESULTS.GRANTED) locationGranted = true;
        } else if (Platform.OS === 'android') {
          setCameraPermission(statuses[PERMISSIONS.ANDROID.CAMERA] === RESULTS.GRANTED);
          setPhotoLibraryPermission(statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === RESULTS.GRANTED);
          const androidLocationStatus = statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
          setLocationPermission(androidLocationStatus === RESULTS.GRANTED);
          if (androidLocationStatus === RESULTS.GRANTED) locationGranted = true;
        }
      } catch (error) {
        // console.error("[App.tsx] Error during permission request: ", error); // 필요시 에러 로깅은 남겨둘 수 있음
      } finally {
        setAllPermissionsRequested(true);

        // 3. 위치 권한이 획득되었으면 위치 가져오기 시작
        if (locationGranted) {
          fetchLocation();
        }
      }
    };

    requestAllRequiredPermissions();

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
    };
  }, [fetchLocation, setCameraPermission, setLocationPermission, setPhotoLibraryPermission]); // 초기 1회 실행

  // 스플래시 화면 숨김 조건 확인 Effect
  useEffect(() => {
    if (!splashHidden && allPermissionsRequested && splashTimerExpired) {
      SplashScreen.hide();
      setSplashHidden(true);
    }
  }, [allPermissionsRequested, splashTimerExpired, splashHidden]);

  // 로그인 상태 확인 로직 (현재 비활성화, 필요시 주석 해제)
  // useEffect(() => {
  //   checkLoginStatus();
  // }, [checkLoginStatus]);

  // UI 렌더링 (인증 로딩은 스플래시와 별개로 처리될 수 있음)
  // 스플래시가 앱 최상단을 덮으므로, 이 부분의 로딩 UI는 스플래시가 사라진 후 보이게 됨.
  // if (authLoading) { // 또는 다른 초기 로딩 조건
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex:1}}>
        <SafeAreaView style={{flex:1}} edges={[ 'left', 'right']} >
          <NavigationContainer>
            <StatusBar barStyle="dark-content" translucent={true}/>
            {/* {isLoggedIn ? <AppTab /> : <AuthStack />} */}
            <AppTab />
            {/* <View style={{flex:1, backgroundColor:'gray'}}></View> */}
          </NavigationContainer>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;
