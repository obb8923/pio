import { View, TextInput, Modal, Text, Platform} from "react-native";
import { useTranslation } from 'react-i18next';
import { CustomButton } from "@components/CustomButton";
import { useModalBackground } from "@libs/hooks/useModalBackground";
import { DEVICE_HEIGHT } from "@constants/normal.ts";
interface DescriptionModalProps {
  isVisible: boolean;
  onClose: () => void;
  description: string;
  onDescriptionChange: (text: string) => void;
}

export const DescriptionModal = ({ 
  isVisible, 
  onClose, 
  description, 
  onDescriptionChange 
}: DescriptionModalProps) => {
  const { t } = useTranslation('domain');
  useModalBackground(isVisible);

    const containerStyle = Platform.select({
      ios: {
        height: DEVICE_HEIGHT / 2,
      },
      android: {
        flex: 1,
      },
    });

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
    >
        {/* 내부 영역*/}
        <View 
        className=" relative mx-4 mt-20 mb-16 pt-4 pb-2 border border-greenTab900 rounded-3xl bg-greenTab"
        style={containerStyle}
        >
            {/* 타이틀 */}
          <View className="items-start justify-end px-4 py-2" style={{height: DEVICE_HEIGHT/18}}>
            <Text className="text-center text-lg text-greenActive">{t('map.descriptionModal.title')}</Text>
          </View>
          {/* 텍스트 인풋 */}
          <TextInput
            className="flex-1 text-gray-700 p-4 rounded-lg bg-gray-50"
            multiline
            value={description}
            onChangeText={onDescriptionChange}
            placeholder={t('map.descriptionModal.placeholder')}
            autoFocus
          />
          {/* 버튼 */}
          <View className="flex-row justify-end items-center px-4" style={{height: DEVICE_HEIGHT/13}}>
            <CustomButton text={t('common:components.button.done')} size={DEVICE_HEIGHT/15} onPress={onClose}/>
          </View>
        </View>
    </Modal>
  );
}; 