import { NavigationContainer } from "@react-navigation/native";
// import RootStack from "./src/nav/stack/Root"; // RootStack import 제거
import "./global.css"
import { SafeAreaView} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar,ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';
import { useAuthStore } from './src/store/authStore';
import AuthStack from './src/nav/stack/Auth'; // AuthStack import 추가
import AppTab from './src/nav/tab/App'; // AppTab import 추가

function App(): React.JSX.Element {
  const { isLoggedIn, isLoading, checkLoginStatus } = useAuthStore();

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{flex:1}}>
      <SafeAreaView style={{flex:1}} >
        <NavigationContainer>
          <StatusBar barStyle="dark-content" translucent={true} />
          {isLoggedIn ? <AppTab /> : <AuthStack />}
        </NavigationContainer>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default App;
