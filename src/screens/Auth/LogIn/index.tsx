import React, { useEffect } from 'react';
import { View,Alert } from 'react-native';
import { supabase } from '../../../libs/supabase/supabase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { AuthStackParamList } from '../../../nav/stack/Auth';
import {AuthButton} from '../../../components/AuthButton';
import {Background} from '../../../components/Background';
import {Divider} from '../../../components/Divider';
import LogoIcon from '../../../../assets/svgs/Pio.svg';
import { Colors } from '../../../constants/Colors';
import { useAuthStore } from '../../../store/authStore';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'LogIn'>;

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [loading, setLoading] = React.useState(false);
  const { login } = useAuthStore();

  useEffect(() => {
    try {
      GoogleSignin.configure({
        webClientId: '913491434166-rptdhu0dsl1e422345ps8agflt8aovl9.apps.googleusercontent.com',
        iosClientId:'913491434166-943bpnms579toeb0n9onsq302oni0h7k.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
      });
    } catch (error) {
      console.error('Google Sign-In configuration error:', error);
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('Google UserInfo:', JSON.stringify(userInfo, null, 2));

      if (userInfo && userInfo.data && userInfo.data.idToken) {
        const idToken = userInfo.data.idToken;
        console.log('ID Token received:', idToken.substring(0, 10) + '...');

        try {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
          });

          if (error) {
            console.error('Supabase 로그인 에러 상세:', {
              message: error.message,
              status: error.status,
              name: error.name,
              details: error
            });
            
            let errorMessage = '로그인 중 오류가 발생했습니다.';
            if (error.status === 400) {
              errorMessage = '인증 정보가 올바르지 않습니다.';
            } else if (error.status === 500) {
              errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            }
            
            Alert.alert('Google 로그인 오류', errorMessage);
          } else if (data.session) {
            console.log('구글 로그인 성공, 현재 사용자 정보:', data.user);
            
            try {
              const { data: updatedUserData, error: updateUserError } = await supabase.auth.updateUser({
                data: { pio: true }
              });

              if (updateUserError) {
                console.error('메타데이터 업데이트 오류:', updateUserError);
              } else {
                console.log('메타데이터 업데이트 성공:', updatedUserData);
                const { data: currentUser } = await supabase.auth.getUser();
                console.log('업데이트된 사용자 정보:', currentUser?.user?.user_metadata);
              }
            } catch (updateError) {
              console.error('메타데이터 업데이트 중 예외 발생:', updateError);
            }
            login();
          }
        } catch (supabaseError) {
          console.error('Supabase 인증 중 예외 발생:', supabaseError);
          Alert.alert('로그인 오류', '인증 처리 중 오류가 발생했습니다.');
        }
      } else {
        console.error('Google ID 토큰을 받지 못했습니다:', userInfo);
        Alert.alert('Google 로그인 오류', 'Google 인증 정보를 받지 못했습니다.');
      }
    } catch (error: any) {
      if (error.code) {
        console.log('Google Sign-In error code:', error.code, error.message);
        if (error.code !== '12501' && error.code !== 12501 && error.code !== 'SIGN_IN_CANCELLED') {
          Alert.alert('Google 로그인 오류', `오류 코드: ${error.code} - ${error.message}`);
        }
      } else {
        console.log('Google Sign-In unexpected error:', error);
        Alert.alert('Google 로그인 오류', '알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Background>
    <View className="flex-1 flex-col justify-start items-center p-5">
      {/* 로고 이미지 */}
      <LogoIcon 
      style={{width: '100%', height: '10%',color:Colors.matcha,marginTop:30,marginBottom:40}}/>
      {/* 구분선 */}
      <Divider text="로그인/회원가입"  />
      {/*Google Login Button */}
      <View style={{width: '80%'}}>
      <AuthButton handleLogin={handleGoogleLogin} loading={loading} type="google" />
      </View>
    </View>
    </Background>
  );
}