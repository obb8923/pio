import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Linking, Platform, Alert } from 'react-native';
import { usePermissionStore } from '../../store/permissionStore';
import { usePermissions } from '../../libs/hooks/usePermissions';
import { useLocationStore } from '../../store/locationStore';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withSpring, withTiming, useSharedValue } from 'react-native-reanimated';
import { Background } from '../../components/Background';
import { Colors } from '../../constants/Colors';
import { RectangleButton } from '../../components/RectangleButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../nav/stack/Root';
const PermissionItem = ({ 
  title, 
  description, 
  isGranted 
}: { 
  title: string, 
  description: string,
  isGranted: boolean 
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isGranted) {
      scale.value = withSpring(1.2, {}, () => {
        scale.value = withSpring(1);
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withSpring(0.8);
      opacity.value = withTiming(0.5, { duration: 300 });
    }
  }, [isGranted]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(isGranted ? Colors.greenTab : '#c0c0c09a', { duration: 300 }),
      transform: [{ scale: scale.value }],
      opacity: opacity.value
    };
  });

  return (
    <Animated.View 
      entering={FadeInDown.delay(300).springify()} 
      className="flex-row items-center rounded-xl py-4 mb-2"
    >
      <View className="flex-1 pl-2">
        <Text className="text-base font-semibold text-greenTab mb-1">{title}</Text>
        <Text className="text-sm text-greenTab leading-5">{description}</Text>
      </View>
      <Animated.View 
        style={animatedStyle}
        className="w-6 h-6 rounded-full items-center justify-center"
      >
        {isGranted && (
          <Animated.Text 
            entering={FadeInUp.springify()}
            className="text-white text-xs font-bold"
          >
            ✓
          </Animated.Text>
        )}
      </Animated.View>
    </Animated.View>
  );
};

type PermissionScreenProps = NativeStackScreenProps<RootStackParamList,'PermissionScreen'>
export const PermissionScreen = ({navigation}:PermissionScreenProps) => {
  const { requestAllPermissions, isInitialized } = usePermissionStore();
  const {cameraPermission,photoLibraryPermission,locationPermission} = usePermissions();
  const { fetchLocation } = useLocationStore();
  const [isRequesting, setIsRequesting] = useState(false);
  useEffect(() => {
    if (isInitialized && cameraPermission && photoLibraryPermission && locationPermission) {
      navigation.goBack();
    }
  }, [isInitialized, cameraPermission, photoLibraryPermission, locationPermission, navigation]);
  // const [DEBUG, setDEBUG] = useState(false);
  const openSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      if(__DEV__) console.error('[PermissionScreen] Error opening settings:', error);
    }
  };

  const handlePermissionRequest = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      const allGranted = await requestAllPermissions();
      if (allGranted) {
        await fetchLocation();
      } else {
        // 거부된 권한 목록 생성
        const deniedPermissions = [];
        if (!locationPermission) deniedPermissions.push('위치');
        if (!cameraPermission) deniedPermissions.push('카메라');
        if (!photoLibraryPermission) deniedPermissions.push('갤러리');

        Alert.alert(
          '권한 설정 필요',
          `${deniedPermissions.join(', ')} 권한이 거부되었습니다.\n설정에서 권한을 허용해주세요.`,
          [
            {
              text: '취소',
              style: 'cancel'
            },
            {
              text: '설정으로 이동',
              onPress: openSettings
            }
          ]
        );
      }
    } catch (error) {
      if(__DEV__) console.error('[PermissionScreen] Error requesting permissions:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Background type="white" isStatusBarGap={true} isTabBarGap={false}>
    <View className="flex-1">
      <ScrollView className="flex-1 px-6">
        <Animated.Text 
          entering={FadeInUp.delay(200).springify()}
          className="text-2xl font-bold text-greenTab mt-5"
        >
          앱 권한 설정
        </Animated.Text>
        <Animated.Text 
          entering={FadeInUp.delay(400).springify()}
          className="text-base text-greenTab mt-2 mb-8"
        >
          더 나은 서비스 제공을 위해{'\n'}다음 권한들이 필요해요
        </Animated.Text>
          <PermissionItem
            title="카메라"
            description="사진 촬영 및 이미지 업로드를 위해 필요해요"
            isGranted={cameraPermission}
          />
          <PermissionItem
            title="갤러리"
            description="이미지 선택 및 업로드를 위해 필요해요"
            isGranted={photoLibraryPermission}
          />
           <PermissionItem
            title="위치 정보"
            description="주변 정보를 확인하고 현재 위치 기반 서비스를 제공하기 위해 필요해요"
            isGranted={locationPermission}
          />
          {/* <PermissionItem
            title="DEBUG"
            description="DEBUG"
            isGranted={DEBUG}
          /> */}
      </ScrollView>
      {/* <TouchableOpacity
      className='bg-red-500 w-full h-10'
        onPress={() => {
         setDEBUG(!DEBUG);
        }}
      ><Text>DEBUG</Text></TouchableOpacity> */}
      <Animated.View 
        entering={FadeInUp.delay(600).springify()}
        className="absolute bottom-0 left-0 right-0 w-full flex-row items-center p-6 mb-10"
      >
        <RectangleButton
          text="다음에"
          onPress={() => {
            navigation.navigate('AppTab');
          }}
          className="mr-4"
          style={{width:'35%'}}
          type="gray"
        />
        <RectangleButton
          text="권한 설정하기"
          onPress={handlePermissionRequest}
          isLoading={isRequesting}
          LoadingText="요청중..."
          disabled={isRequesting}
          className="flex-1"
        />
      </Animated.View>
    </View>
    </Background>
  );
};