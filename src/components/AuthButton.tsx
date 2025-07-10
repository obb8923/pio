import { TouchableOpacity,ActivityIndicator } from "react-native"
import { useAuthStore } from "../store/authStore";
import GoogleLogo from "../../assets/svgs/GoogleLogo.svg"
import AppleLogo from "../../assets/svgs/AppleLogo.svg"
import {Colors} from "../constants/Colors"

type AuthButtonProps = { type: 'Google' | 'Apple' };
export const AuthButton = ({ type }: AuthButtonProps) => {
  const { isLoggedIn, handleGoogleLogin,handleAppleLogin, isLoading } = useAuthStore();
  const handlePress = ()=>{
    if(type==='Google'){
      handleGoogleLogin()
    }
    if(type==='Apple'){
      handleAppleLogin()
    }
  }
  return (
    <TouchableOpacity 
      className={`p-4 rounded-full flex-row items-center justify-center border ${type==='Apple'?'border-black bg-white':'border-[#777b7a] bg-[#fffffe]'}`}
      onPress={handlePress}
      disabled={isLoading}
    >
      {!isLoading && type === 'Google' && <GoogleLogo width= '20' height= '20' />}
      {!isLoading && type === 'Apple' && <AppleLogo width='20' height= '20'/>}
      {isLoading && <ActivityIndicator size="small" color={Colors.greenTab} />}
    </TouchableOpacity>
  );
};