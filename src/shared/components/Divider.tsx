import { View, ViewStyle } from "react-native"

export const Divider = (props: {className?: string,style?: ViewStyle}) => {
  return (
    <View className={`w-full h-[0.5] bg-gray-300 ${props.className}`} style={props.style} />
  )
}