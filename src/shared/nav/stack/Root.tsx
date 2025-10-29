import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppTab from "@nav/tab/App.tsx";

const Stack = createNativeStackNavigator<RootStackParamList>();
export type RootStackParamList = {
 AppTab:undefined,
 PermissionScreen:undefined,
};
export const RootStack = () => {
    return (
        <Stack.Navigator 
        screenOptions={{headerShown:false}}
        initialRouteName="AppTab">
<Stack.Screen name="AppTab" component={AppTab} />

</Stack.Navigator>  
    )
}
