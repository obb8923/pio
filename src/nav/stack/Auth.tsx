import {LoginScreen} from "../../screens/Auth/LogIn"
import {SignUpScreen} from "../../screens/Auth/SignUp";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<AuthStackParamList>();
export type AuthStackParamList = {
  LogIn: undefined,
  SignUp: undefined,
}

const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="LogIn" 
        component={LoginScreen} 
        options={{headerShown:false}}
      />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{title:'회원가입'}}/> 
    </Stack.Navigator>
  );
};

export default AuthStack;