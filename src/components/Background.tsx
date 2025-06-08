import { Image, View, ViewStyle } from "react-native"
import { TAB_BAR_HEIGHT } from "../constants/TabNavOptions"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type BackgroundProps = {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle | ViewStyle[];
  type?: 'green' | 'white' | 'background';
  isStatusBarGap?: boolean;
  isTabBarGap?: boolean;
}
export const Background = ({children,isStatusBarGap=false,type='green',isTabBarGap=true,...props}: BackgroundProps) => {
  const insets = useSafeAreaInsets();
  if(type === 'background'){
    return (
      <View className="flex-1 bg-background" style={{paddingTop: isStatusBarGap ? insets.top : 0}}>
        {children}
      </View>
    )
  }
  return (
    <View className="flex-1" style={{paddingTop: isStatusBarGap ? insets.top : 0}}>
    <Image source={require('../../assets/pngs/BackgroundGreen.png')} className="w-full h-full absolute top-0 left-0 right-0 bottom-0"/>
    {type === 'white' && <View className="flex-1 mx-2 absolute top-0 left-0 right-0 bottom-0 bg-white opacity-90"/>}
    <View 
    className={`flex-1 ${props.className}`} 
    style={[{paddingBottom: TAB_BAR_HEIGHT}, props.style]}>
      {children}
    </View>    
    </View>    
  )
}
