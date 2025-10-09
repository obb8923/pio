import { memo, useCallback } from "react";
import { Alert } from "react-native";
import { TextToggle } from "../../../../components/TextToggle";
import { useAuthStore } from "../../../../store/authStore";
// 식물 필터 토글 컴포넌트
export const PlantFilterToggle = memo(({ 
    showOnlyMyPlants,
    onToggle
  }: { 
    showOnlyMyPlants: boolean;
    onToggle: () => void;
  }) => {
    const userId = useAuthStore(state => state.userId);

    const handleToggle = useCallback(() => {
      if (!showOnlyMyPlants && !userId) {
        Alert.alert(
          "로그인 필요",
          "내 식물을 보려면 로그인이 필요합니다.",
          [{ text: "확인", style: "default" }]
        );
        return;
      }
      onToggle();
    }, [showOnlyMyPlants, userId, onToggle]);
  
    return (
      <TextToggle
        isActive={showOnlyMyPlants}
        activeText="내 식물만"
        inactiveText="모든 식물"
        onToggle={handleToggle}
      />
    );
  });