import { View, Modal } from "react-native";
import { useModalBackground } from "@libs/hooks/useModalBackground";
import {Memo} from "@components/PlantDetail/Memo"
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

 
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
    >
   
        {/* 내부 영역*/}
        <View 
        className="mx-4 mt-20"
        >
       
          <Memo content={memo} type="textInput" onChangeText={onMemoChange} onClose={onClose} />
        
        </View>
    </Modal>
  );
}; 