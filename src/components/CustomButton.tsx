import { ActivityIndicator, Text, View } from "react-native";
import { Colors } from "../constants/Colors";
import { TouchableOpacity } from "react-native";

export const CustomButton = ({text,size, onPress, disabled=false, isProcessing=false}: {text: string,size:number, onPress: () => void, disabled?: boolean, isProcessing?: boolean}) => {
  return (
      <TouchableOpacity
      style={{width: size, height: size}}
      className={`rounded-full bg-greenTab items-center justify-center`}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={{width: size-10, height: size-10}} className={`rounded-full border border-greenActive items-center justify-center`}>
        {isProcessing ? (
          <ActivityIndicator color={Colors.greenActive} size="small" />
        ) : (
          <Text className="text-greenActive font-medium">{text}</Text>
        )}
      </View>
    </TouchableOpacity>
    );
  };