import { TouchableOpacity, View, Text, StyleProp, ViewStyle } from "react-native"

export const RectangleButton = ({
  isLoading=false,
  LoadingText="",
  onPress,
  text,
  type='main',
  disabled=false,
  ...props
}: {
  isLoading?: boolean,
  LoadingText?: string,
  onPress: () => void,
  text: string,
  type?: 'main' | 'sub' | 'gray' | 'error',
  disabled?: boolean,
  className?: string,
  style?: StyleProp<ViewStyle>
}) => {
    const getButtonStyle = () => {
        switch(type){
            case 'main':
                return 'bg-greenTab'
            case 'sub':
                return 'bg-white border border-greenTab'
            case 'gray':
                return 'bg-gray-400'
            case 'error':
                return 'bg-red-500'
        }
    }
    const getTextStyle = () => {
        switch(type){
            case 'sub':
                return 'text-greenTab'
            case 'main':
                return 'text-white'
            case 'gray':
                return 'text-white'
            case 'error':
                return 'text-white'
        }
    }
  return (
    <TouchableOpacity
          className={`w-full p-4 rounded-xl items-center ${getButtonStyle()} ${props.className}`}
          style={props.style}
          onPress={onPress}
          disabled={disabled}
        >
          <Text className={`${getTextStyle()} font-semibold text-base`}>
            {isLoading ? LoadingText : text}
          </Text>
        </TouchableOpacity>
  )
}