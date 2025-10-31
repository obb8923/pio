import { View, Text, TextInput, TouchableOpacity } from "react-native"

export const Memo = ({content,type,onChangeText,onClose}: {content: string|null,type:'button'|'textInput',onChangeText?: (text: string) => void,onClose?: () => void}) => {
  return (
    <View className="bg-[#FFDEA2] rounded-lg p-4 w-full">
      {/* 메모 헤더 */}
      <View className="w-full flex-row justify-between items-center mb-2">
      <Text className="text-[#9D691D] text-sm font-bold">메모</Text>
      {onClose && (
        <TouchableOpacity onPress={onClose}>
          <Text className="text-[#9D691D] text-sm font-bold">닫기</Text>
        </TouchableOpacity>
      )}  
      </View>
      {/* 메모 내용 */}
      {type === 'button' ? (
      <Text
        className="min-h-[90px] max-h-[140px] text-[#A2690F]"
        >
          {content ? content : '메모가 없습니다.'}
          </Text>
          ) : (
            <TextInput
            className="text-[#9D691D] min-h-[90px] max-h-[240px]"
            multiline
            value={content??''}
            onChangeText={onChangeText}
            placeholder="식물에 대한 메모를 입력해주세요"
            autoFocus
          />
          )}
         </View>
  )
}