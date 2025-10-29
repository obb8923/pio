import { TouchableOpacity, View, Text, StyleProp, ViewStyle } from "react-native"

// 버튼 스타일 매핑 객체 - 복잡한 조건문을 단순화
const BUTTON_STYLES = {
  main: 'bg-greenTab',
  sub: 'bg-white border border-greenTab',
  gray: 'bg-gray-400',
  error: 'bg-red-500',
} as const;

const TEXT_STYLES = {
  main: 'text-white',
  sub: 'text-greenTab',
  gray: 'text-white',
  error: 'text-white',
} as const;

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
  return (
    <TouchableOpacity
          className={`w-full p-4 rounded-xl items-center ${BUTTON_STYLES[type]} ${props.className}`}
          style={props.style}
          onPress={onPress}
          disabled={disabled}
        >
          <Text className={`${TEXT_STYLES[type]} font-semibold text-base`}>
            {isLoading ? LoadingText : text}
          </Text>
        </TouchableOpacity>
  )
}