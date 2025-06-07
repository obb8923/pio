import { NavigationContainer} from "@react-navigation/native";
import "./global.css"
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native'; 
import { useEffect } from 'react';
import { useAuthStore } from './src/store/authStore';
import SplashScreen from "react-native-splash-screen";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SUPABASE_WEB_CLIENT_KEY, SUPABASE_IOS_CLIENT_KEY } from '@env';
import { RootStack } from "./src/nav/stack/Root";
import { usePermissionStore } from "./src/store/permissionStore";
function App(): React.JSX.Element {
  const { checkLoginStatus } = useAuthStore();
  const { initPermissions, isInitialized } = usePermissionStore();
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
              <RootStack/>             
            </NavigationContainer>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;
