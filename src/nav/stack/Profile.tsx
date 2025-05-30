
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileScreen } from "../../screens/App/Profile";
import { UserInfoScreen } from "../../screens/App/Profile/UserInfo";
import { TermsOfServiceScreen } from "../../screens/App/Profile/TermsOfService";
import { PrivacyPolicyScreen } from "../../screens/App/Profile/PrivacyPolicy";

const Stack = createNativeStackNavigator<ProfileStackParamList>();
export type ProfileStackParamList = {
  Profile:undefined,
  UserInfo:undefined,
  TermsOfService:undefined,
  PrivacyPolicy:undefined,
}

export const ProfileStack = () => {
  return (
    <Stack.Navigator >
            <Stack.Screen name="Profile" component={ProfileScreen} options={{headerShown:false}}/>
            <Stack.Screen name="UserInfo" component={UserInfoScreen} options={{title:'회원 정보'}}/>
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{title:'이용약관'}}/>
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{title:'개인정보처리방침'}}/>
           </Stack.Navigator>
  );
};