import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileScreen } from "@domain/App/Profile";
import { UserInfoScreen } from "@domain/App/Profile/UserInfo";
import { TermsOfServiceScreen } from "@domain/App/Profile/TermsOfService";
import { PrivacyPolicyScreen } from "@domain/App/Profile/PrivacyPolicy";
import { WebViewScreen } from "@domain/App/Profile/WebViewScreen";

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