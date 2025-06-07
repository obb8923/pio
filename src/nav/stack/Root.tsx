import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppTab from "../tab/App";
import { PermissionScreen } from "../../screens/Permission";

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
<Stack.Screen name="PermissionScreen" component={PermissionScreen} options={{presentation:'modal'}}/>

</Stack.Navigator>  
    )
}
