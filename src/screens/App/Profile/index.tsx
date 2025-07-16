import { View, Text, TouchableOpacity, Alert, ScrollView, Linking } from "react-native";
import { useAuthStore } from "../../../store/authStore";
import { Colors } from "../../../constants/Colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../../nav/stack/Profile";
import ChevronRight from "../../../../assets/svgs/ChevronRight.svg";
import { Background } from "../../../components/Background";
import { FEEDBACK_FORM_URL, MAIL_ADDRESS,GOOGLE_PLAY_URL } from "../../../constants/normal";
import ArrowUpRight from "../../../../assets/svgs/ArrowUpRight.svg";
import Mail from "../../../../assets/svgs/Mail.svg";
import { ProfileHeader } from "./components/ProfileHeader";
// import { VersionItem } from "./components/VersionItem";

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
  const { isLoggedIn } = useAuthStore();

  return (
    <Background type="white" isStatusBarGap={true} className="pt-4">
      <Text className="text-2xl font-bold text-greenTab ml-9 mb-4">프로필</Text>
      
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 프로필 헤더 - 로그인 또는 이름*/}
        <ProfileHeader />
        
        <View className="h-8" />

        {/* 회원 정보 */}
        <ProfileItem title="회원 정보" onPress={() => {
          if(isLoggedIn){
            navigation.navigate('UserInfo');
          }else{
            Alert.alert("로그인이 필요합니다.")
          }
        }}/>
        <View className="h-8" />
        <ProfileItem title="문의하기" onPress={()=>{
          Linking.openURL(`mailto:${MAIL_ADDRESS}`);
        }} type="mail"/>
        <ProfileItem title="건의하기" onPress={() => navigation.navigate('WebView', {
          url: FEEDBACK_FORM_URL,
        })} type="link"/>   

       <View className="h-8" />
        {/* 약관 및 정책 */}
        {/* <ProfileItem title="평점 남기기" onPress={() => Linking.openURL(GOOGLE_PLAY_URL)} type="link"/>           */}
        <ProfileItem title="이용약관" onPress={() => navigation.navigate('TermsOfService')}/>          
        <ProfileItem title="개인정보처리방침" onPress={() => navigation.navigate('PrivacyPolicy')}/>
        {/* <VersionItem /> */}
      </ScrollView>
    </Background>
  );
};

