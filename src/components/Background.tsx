import { View, ViewStyle } from "react-native"
import { TAB_BAR_HEIGHT } from "../constants/TabNavOptions"

type BackgroundProps = {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle | ViewStyle[];
}
export const Background = ({children,...props}: BackgroundProps) => {
  
  return (
    <View 
    className={`flex-1 bg-background ${props.className}`} 
    style={[{paddingBottom: TAB_BAR_HEIGHT}, props.style]}>
      {children}
    </View>
  )
}
