import React from 'react';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../nav/stack/Profile';
import { TouchableOpacity, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChevronRight from '../../../../assets/svgs/ChevronRight.svg';
import { Colors } from '../../../constants/Colors';
type WebViewScreenProps = NativeStackScreenProps<ProfileStackParamList, 'WebView'>;

export const WebViewScreen = ({ route, navigation }: WebViewScreenProps) => {
  const { url } = route.params;
  const insets = useSafeAreaInsets();
  return (
    <View className='flex-1 bg-[#e4f3e5]' style={{ paddingTop: insets.top }}>
      {/* 앱바 */}
        <View className='flex-row items-center justify-start w-full p-4 border-b border-gray-300'>
            <TouchableOpacity onPress={() => navigation.goBack()} className='flex-row items-center'>
                <ChevronRight style={{width:18,height:18,transform:[{rotate:'180deg'}],color:Colors.greenTab}}/>
                <Text className='text-lg text-greenTab font-bold ml-2'>뒤로가기</Text>
            </TouchableOpacity>
        </View>
      <WebView 
        source={{ uri: url }}
        style={{ flex: 1 }}
      />
      </View>
  );
}; 