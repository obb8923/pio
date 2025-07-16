import { View,Text,Modal,TouchableOpacity,ActivityIndicator, TextInput, Animated, Easing } from "react-native"
import GoogleLogo from "../../../../../assets/svgs/GoogleLogo.svg"
import AppleLogo from "../../../../../assets/svgs/AppleLogo.svg"
import MailLogo from "../../../../../assets/svgs/Mail.svg"
import {Colors} from "../../../../constants/Colors"
import { useModalBackgroundStore } from "../../../../store/modalStore";
import { useAuthStore } from "../../../../store/authStore";
import { useEffect, useState, useRef } from "react";
type AuthButtonProps = { type: 'Google' | 'Apple' | 'Email' };
export const AuthButton = ({ type }: AuthButtonProps) => {
  const { handleGoogleLogin,handleAppleLogin, handleEmailLogin,isLoading } = useAuthStore();
  const {openModalBackground,closeModalBackground} = useModalBackgroundStore();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const submitAnim = useRef(new Animated.Value(0)).current;

  //submit버튼 애니메이션
  useEffect(() => {
    const shouldShow = email.length > 0 && password.length > 0;
    setShowSubmit(shouldShow);
    Animated.timing(submitAnim, {
      toValue: shouldShow ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [email, password]);

  const handlePress = ()=>{
    if(type==='Google'){
      handleGoogleLogin()
    }
    if(type==='Apple'){
      handleAppleLogin()
    }
    if(type==='Email'){
      openModalBackground();
      setIsEmailModalOpen(true);
    }
  }

  return (<>
    <TouchableOpacity 
      className={`p-4 rounded-full flex-row items-center justify-center border ${type==='Apple'?'border-black bg-white':'border-[#777b7a] bg-[#fffffe]'}`}
      onPress={handlePress}
      disabled={isLoading}
    >
      {!isLoading && type === 'Google' && <GoogleLogo width= '20' height= '20' />}
      {!isLoading && type === 'Apple' && <AppleLogo width='20' height= '20' fill='#000'/>}
      {!isLoading && type === 'Email' && <MailLogo width= '20' height= '20' color='#000'/>}

      {isLoading && <ActivityIndicator size="small" color={Colors.greenTab} />}
    </TouchableOpacity>
    {/* Email Modal */}
    <Modal
        visible={isEmailModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEmailModalOpen(false)}
      >
        <View className="flex-1 justify-center items-center mb-32">
          {/* container (background) */}
          <View className="w-4/5 h-[215] bg-greenTab p-2 rounded-xl items-center justify-center">
          {/* close button (absolute) */}
          <TouchableOpacity
          className="w-14 h-14 absolute top-0 items-center justify-center z-10 bg-greenTab rounded-full p-1" 
          style={{right:-18}}
          onPress={()=>{setIsEmailModalOpen(false); closeModalBackground();}}>
            <View className="items-center justify-center w-full h-full  rounded-full bg-black/50">
              <View className="bg-greenActive" style={{ width: 20, height: 4, position: 'absolute', transform: [{ rotate: '45deg' }] , borderRadius: 2}} />
              <View className="bg-greenActive" style={{ width: 20, height: 4, position: 'absolute', transform: [{ rotate: '-45deg' }], borderRadius: 2 }} />
            </View>
          </TouchableOpacity>
            {/* inner container (border) */}
            <View className="w-full h-full rounded-2xl pl-6 pr-10 flex-col justify-evenly">
              <Text className="text-greenActive">이메일로 로그인 하기</Text>
              <TextInput
                className="w-full p-4 border border-greenActive rounded-xl text-greenActive bg-white/30"
                placeholder="이메일을 입력하세요"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                className="w-full mt-2 p-4 border border-greenActive rounded-xl text-greenActive bg-white/30"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            {/* submit button (absolute) */}
          {/* Animated Submit Button */}
          <Animated.View
            style={{
              opacity: submitAnim,
              transform: [
                {
                  translateY: submitAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0], // 아래에서 위로 슬라이드
                  }),
                },
              ],
              position: "absolute",
              bottom: 0,
              right: -18,
            }}
            pointerEvents={showSubmit ? "auto" : "none"}
          >
            <TouchableOpacity
            className="w-14 h-14 items-center justify-center z-10 bg-greenTab rounded-full p-1"
            onPress={async()=>{
              const success = await handleEmailLogin(email,password);
              if(success){
                setIsEmailModalOpen(false);
                closeModalBackground();
              }
            }}
            >
              <View className="items-center justify-center w-full h-full rounded-full bg-black/50">
                {/* 화살표 몸통 */}
                <View className="bg-greenActive" style={{ width: 20, height: 4, borderRadius: 2 }} />
                {/* 화살촉 위쪽 */}
                <View className="bg-greenActive" style={{ width: 10, height: 4, borderRadius: 2, position: 'absolute', right: 10, top: 16, transform: [{ rotate: '45deg' }] }} />
                {/* 화살촉 아래쪽 */}
                <View className="bg-greenActive" style={{ width: 10, height: 4, borderRadius: 2, position: 'absolute', right: 10, bottom: 16, transform: [{ rotate: '-45deg' }] }} />
              </View>
            </TouchableOpacity>
          </Animated.View>
          </View>
        </View>
      </Modal>    
      </>
  );
};