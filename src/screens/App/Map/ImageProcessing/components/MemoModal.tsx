import { View, TextInput, Modal, Text, Platform } from "react-native";
import { CustomButton } from "../../../../../components/CustomButton";
import { useModalBackground } from '../../../../../libs/hooks/useModalBackground';
import { DEVICE_HEIGHT } from "../../../../../constants/normal";

interface MemoModalProps {
  isVisible: boolean;
  onClose: () => void;
  memo: string;
  onMemoChange: (text: string) => void;
}

export const MemoModal = ({ 
  isVisible, 
  onClose, 
  memo, 
  onMemoChange 
}: MemoModalProps) => {

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
        style={containerStyle}>
          {/* 타이틀 */}
          <View className="items-start justify-end px-4 py-2" style={{height: DEVICE_HEIGHT/18}}>
            <Text className="text-center text-lg text-greenActive">식물에 대한 메모를 입력해주세요</Text>
          </View>
          {/* 텍스트 인풋 */}
          <TextInput
            className="flex-1 text-gray-700 p-4 rounded-lg bg-gray-50"
            multiline
            value={memo}
            onChangeText={onMemoChange}
            placeholder="식물에 대한 메모를 입력해주세요"
            autoFocus
          />
          {/* 버튼 */}
          <View className="flex-row justify-end items-center px-4" style={{height: DEVICE_HEIGHT/13}}>
            <CustomButton text="완료" size={DEVICE_HEIGHT/15} onPress={onClose}/>
          </View>
        </View>
    </Modal>
  );
}; 