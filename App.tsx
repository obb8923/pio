// 외부 라이브러리
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SplashScreen from "react-native-splash-screen";

// 글로벌 스타일
import "./global.css";

// i18n 초기화
import '@libs/i18n';

// 내부 네비게이션/컴포넌트
import { RootStack } from "@nav/stack/Root";
import { OnboardingStack } from "@nav/stack/Onboarding";
import { ModalBackground } from "@components/ModalBackground";
import { MaintenanceScreen } from "@domain/normal/Maintenance";
// 내부 훅
import { useAppInitialization } from "@libs/hooks/initialization/useAppInitialization";

function App() {
  const { isInitialized, maintenanceData, isOnboardingCompleted } = useAppInitialization();

  // 스플래시 스크린 숨기기
  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hide();
    }
  }, [isInitialized]);
  
  // 초기화가 완료되기 전까지는 스플래시 스크린을 유지
  if (!isInitialized) {
    return null;
  }

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
