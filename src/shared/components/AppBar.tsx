import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@constants/Colors';
import ChevronRight from '@assets/svgs/ChevronRight.svg';

export const AppBar = ({navigation,title}:{navigation:any,title?:string}) => {
  return (
    <View className='flex-row items-center justify-start w-full p-4 border-b border-gray-300'>
    <TouchableOpacity onPress={() => navigation.goBack()} className='flex-row items-center'>
        <ChevronRight style={{width:18,height:18,transform:[{rotate:'180deg'}],color:Colors.greenTab}}/>
        <Text className='text-lg text-greenTab font-bold ml-2'>뒤로가기</Text>
    </TouchableOpacity>
</View>
  )
}