import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";
import AppTab from "../tab/App";
import AuthStack, { AuthStackParamList } from "./Auth";

const Stack = createNativeStackNavigator<RootStackParamList>();
export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>,
  AppTab:undefined,
};

const RootStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name="AppTab" component={AppTab} />
        <Stack.Screen name="AuthStack" component={AuthStack} />
    </Stack.Navigator>
  );
};

export default RootStack;
