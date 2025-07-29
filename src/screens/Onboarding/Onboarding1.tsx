import {Background} from '../../components/Background'
import {View,TouchableOpacity} from 'react-native'
export const Onboarding1Screen = ()=>{
    return (
        <Background isStatusBarGap={true} isTabBarGap={false}>
        <View className="flex-1 p-4 justify-end items-center">
            {/* ui animation section */}
           <View className="w-full h-5/6 bg-black"></View>
           {/* button section */}
           <View className="w-full h-1/6 flex-row justify-between items-center">
            <TouchableOpacity className="border border-black w-12 h-8"></TouchableOpacity>
            <TouchableOpacity className="border border-black w-12 h-8"></TouchableOpacity>
           </View>
        </View>
    </Background>
   
    )
}