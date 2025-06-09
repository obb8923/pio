import { View, TextInput, Modal, Text, Dimensions } from "react-native";
import { CustomButton } from "../../../../components/CustomButton";

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
    const height = Dimensions.get('window').height;
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
    >
      {/* 배경 검은색 오버레이 */}
      <View className="flex-1 bg-black/50">
        {/* 내부 영역*/}
        <View className="flex-1 relative mx-4 mt-20 mb-16 pt-4 pb-2 border border-greenTab900 rounded-3xl bg-greenTab">
            {/* 타이틀 */}
          <View className="items-start justify-end px-4 py-2" style={{height: height/18}}>
            <Text className="text-center text-lg text-greenActive">식물에 대한 설명을 입력해주세요</Text>
          </View>
          {/* 텍스트 인풋 */}
          <TextInput
            className="flex-1 text-gray-700 p-4 rounded-lg bg-gray-50"
            multiline
            value={description}
            onChangeText={onDescriptionChange}
            placeholder="식물에 대한 설명을 입력해주세요"
            autoFocus
          />
          {/* 버튼 */}
          <View className="flex-row justify-end items-center px-4" style={{height: height/13}}>
            <CustomButton text="완료" size={height/15} onPress={onClose}/>
          </View>
        </View>
      </View>
    </Modal>
  );
}; 