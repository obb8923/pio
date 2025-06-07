import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileScreen } from "../../screens/App/Profile";
import { UserInfoScreen } from "../../screens/App/Profile/UserInfo";
import { TermsOfServiceScreen } from "../../screens/App/Profile/TermsOfService";
import { PrivacyPolicyScreen } from "../../screens/App/Profile/PrivacyPolicy";
import { WebViewScreen } from "../../screens/App/Profile/WebViewScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();
export type ProfileStackParamList = {
  Profile: undefined;
  UserInfo: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  WebView: {
    url: string;
  };
};

export const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="UserInfo" component={UserInfoScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="WebView" component={WebViewScreen} />
    </Stack.Navigator>
  );
};