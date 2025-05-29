import React from 'react';
import { View, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../nav/stack/Auth';
import { AuthButton } from '../../../components/AuthButton';
import { Background } from '../../../components/Background';
import { Divider } from '../../../components/Divider';
import LogoIcon from '../../../../assets/svgs/Pio.svg';
import { Colors } from '../../../constants/Colors';
import { useAuthStore } from '../../../store/authStore';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'LogIn'>;

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const { handleGoogleLogin, isLoading, login } = useAuthStore();

  return (
    <Background>
      <View className="flex-1 flex-col justify-start items-center p-5">
        <LogoIcon 
          style={{width: '100%', height: '10%',color:Colors.matcha,marginTop:30,marginBottom:40}}/>
        <Divider text="로그인/회원가입"  />
        <View style={{width: '80%'}}>
          <AuthButton handleLogin={handleGoogleLogin} loading={isLoading} type="google" />
          <AuthButton handleLogin={login} loading={isLoading} type="google" />
        </View>
      </View>
    </Background>
  );
}