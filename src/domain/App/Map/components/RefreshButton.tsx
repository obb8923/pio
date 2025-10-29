import { memo, useCallback } from "react";
import { TouchableOpacity, ActivityIndicator, Text } from "react-native";
import { Colors } from "@constants/Colors.ts";

// 새로고침 버튼 컴포넌트
export const RefreshButton = memo(({ 
    isLoading, 
    onRefresh 
  }: { 
    isLoading: boolean; 
    onRefresh: () => void;
  }) => {
    const handlePress = useCallback(() => {
      if (!isLoading) {
        onRefresh();
      }
    }, [isLoading, onRefresh]);
  
    return (
      <TouchableOpacity
        className="bg-white rounded-full px-3 py-1.5 shadow-lg flex-row items-center border border-greenTab"
        onPress={handlePress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.greenTab} />
        ) : (
          <Text className="text-greenTab font-medium text-sm">지도 새로고침</Text>
        )}
      </TouchableOpacity>
    );
  });