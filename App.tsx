import { NavigationContainer } from "@react-navigation/native";
import RootStack from "./src/nav/stack/Root";
import "./global.css"
import { SafeAreaView} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';


function App(): React.JSX.Element {

  return (
    <GestureHandlerRootView style={{flex:1}}>
      <SafeAreaView style={{flex:1}}>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" translucent={true} />
          <RootStack />
        </NavigationContainer>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default App;
