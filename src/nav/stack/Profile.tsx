
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileScreen } from "../../screens/App/Profile";

const Stack = createNativeStackNavigator<ProfileStackParamList>();
export type ProfileStackParamList = {
  Profile:undefined,
}

export const ProfileStack = () => {
  return (
    <Stack.Navigator >
            <Stack.Screen name="Profile" component={ProfileScreen} options={{headerShown:false}}/>
           </Stack.Navigator>
  );
};