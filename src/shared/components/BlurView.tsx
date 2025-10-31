import { View,ViewStyle ,Platform} from 'react-native';
import { BlurView as Blur } from "@react-native-community/blur";
export const BlurView = ({children,style,innerStyle}: {children?: React.ReactNode,style?:ViewStyle,innerStyle?:ViewStyle}) => {
  const isIOS = Platform.OS === 'ios';
  if(isIOS){
    return (
      <View className="overflow-hidden" style={{...style}}>
        <Blur 
        blurType="xlight" 
        blurAmount={57} 
        reducedTransparencyFallbackColor="rgba(255,255,255,0.8)"
        style={{position:'absolute',top:0,left:0,right:0,bottom:0,...innerStyle}}
        />
        {children}
      </View>
    );
  }
  return (
    <View style={{...style}} className="overflow-hidden bg-white">
      <View className="h-full bg-white justify-center items-center" style={{...innerStyle}}>
        {children}
      </View>
    </View>
  );
};