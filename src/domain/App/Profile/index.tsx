import { View, Text, TouchableOpacity, Alert, ScrollView, Linking,Platform } from "react-native";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useAuthStore } from "@store/authStore.ts";
import { Colors } from "@constants/Colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "@nav/stack/Profile";
import ChevronRight from "@assets/svgs/ChevronRight.svg";
import { Background } from "@components/Background";
import { FEEDBACK_FORM_URL, MAIL_ADDRESS,GOOGLEPLAY_URL ,APPSTORE_URL} from "@constants/normal";
import ArrowUpRight from "@assets/svgs/ArrowUpRight.svg";
import Mail from "@assets/svgs/Mail.svg";
import { AuthGate} from "@domain/App/Profile/components/AuthGate.tsx";
import { VersionItem } from "@domain/App/Profile/components/VersionItem.tsx";
import { AdmobBanner } from "@components/ads/AdmobBanner";
import { TAB_BAR_HEIGHT } from "@constants/TabNavOptions";
import { LanguageSelector } from "@domain/App/Profile/components/LanguageSelector";
type ProfileScreenProps = NativeStackScreenProps<ProfileStackParamList,'Profile'>

const ProfileItem = ({title, onPress,type='default'}: {title: string, onPress: () => void,type?: 'default' | 'link'|'mail'}) => {
  return (
    <TouchableOpacity className="flex-row justify-between items-center py-4 px-5 rounded-lg border-b border-greenTab" onPress={onPress}>
      <Text className="text-base text-greenTab">{title}</Text>
      {type === 'default' && <ChevronRight style={{width: 7, height: 12, color: Colors.greenTab}}/>}
      {type === 'link' && <ArrowUpRight style={{width: 10, height: 12, color: Colors.greenTab}}/>}
      {type === 'mail' && <Mail style={{width: 16, height: 12, color: Colors.greenTab,transform:[{translateX:2}]}}/>}
    </TouchableOpacity>
  );
};

export const ProfileScreen = ({navigation}: ProfileScreenProps) => {
  const { t } = useTranslation(['domain', 'common']);
  const { isLoggedIn } = useAuthStore();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
 const storeUrl = Platform.OS==='ios'?APPSTORE_URL:GOOGLEPLAY_URL; 
  return (
    <Background type="white" isStatusBarGap={true} className="pt-4">
      <Text className="text-2xl font-bold text-greenTab ml-9 mb-4">{t('domain:profile.title')}</Text>
      
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {!isLoggedIn && <AuthGate />}
        
        <View className="h-8" />

        {/* 회원 정보 */}
        <ProfileItem title={t('domain:profile.userInfoTitle')} onPress={() => {
          if(isLoggedIn){
            navigation.navigate('UserInfo');
          }else{
            Alert.alert(t('domain:profile.auth.loginRequired'))
          }
        }}/>
        <View className="h-8" />
        <ProfileItem title={t('domain:profile.contact')} onPress={()=>{
          Linking.openURL(`mailto:${MAIL_ADDRESS}`);
        }} type="mail"/>
        <ProfileItem title={t('domain:profile.feedback')} onPress={() => navigation.navigate('WebView', {
          url: FEEDBACK_FORM_URL,
        })} type="link"/>   
        <ProfileItem title={t('domain:profile.language')} onPress={() => setIsLanguageModalOpen(true)}/>

       <View className="h-8" />
        {/* 약관 및 정책 */}
        <ProfileItem title={t('domain:profile.rateApp')} onPress={() => Linking.openURL(storeUrl)} type="link"/>          
        <ProfileItem title={t('domain:profile.termsOfService')} onPress={() => navigation.navigate('TermsOfService')}/>          
        <ProfileItem title={t('domain:profile.privacyPolicy')} onPress={() => navigation.navigate('PrivacyPolicy')}/>
        <VersionItem />
      </ScrollView>
      {/* 광고 영역 */}
      <View style={{position:'absolute',bottom:TAB_BAR_HEIGHT,left: 0,right: 0}}>
        <AdmobBanner />
      </View>
      
      <LanguageSelector
        isVisible={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />
</Background>
  );
};

