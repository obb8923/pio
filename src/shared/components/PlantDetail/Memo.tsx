import { View, Text, TextInput, TouchableOpacity } from "react-native"
import { useTranslation } from 'react-i18next';

export const Memo = ({content,type,onChangeText,onClose}: {content: string|null,type:'button'|'textInput',onChangeText?: (text: string) => void,onClose?: () => void}) => {
  const { t } = useTranslation('common');
  
  return (
    <View className="bg-[#FFDEA2] rounded-lg p-4 w-full">
      {/* 메모 헤더 */}
      <View className="w-full flex-row justify-between items-center mb-2">
      <Text className="text-[#9D691D] text-sm font-bold">{t('components.memo.title')}</Text>
      {onClose && (
        <TouchableOpacity onPress={onClose}>
          <Text className="text-[#9D691D] text-sm font-bold">{t('components.modal.close')}</Text>
        </TouchableOpacity>
      )}  
      </View>
      {/* 메모 내용 */}
      {type === 'button' ? (
      <Text
        className="min-h-[90px] max-h-[140px] text-[#A2690F]"
        >
          {content ? content : t('components.memo.noMemo')}
          </Text>
          ) : (
            <TextInput
            className="text-[#9D691D] min-h-[90px] max-h-[240px]"
            multiline
            value={content??''}
            onChangeText={onChangeText}
            placeholder={t('components.memo.placeholder')}
            autoFocus
          />
          )}
         </View>
  )
}