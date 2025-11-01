import { memo, useCallback } from "react";
import { Alert } from "react-native";
import { useTranslation } from 'react-i18next';
import { TextToggle } from '@components/TextToggle';
import { useAuthStore } from "@store/authStore.ts";
// 식물 필터 토글 컴포넌트
export const PlantFilterToggle = memo(({ 
    showOnlyMyPlants,
    onToggle
  }: { 
    showOnlyMyPlants: boolean;
    onToggle: () => void;
  }) => {
    const { t } = useTranslation(['domain', 'common']);
    const userId = useAuthStore(state => state.userId);

    const handleToggle = useCallback(() => {
      if (!showOnlyMyPlants && !userId) {
        Alert.alert(
          t('map.loginRequired'),
          t('map.loginRequiredMessage'),
          [{ text: t('common:components.button.confirm'), style: "default" as any }]
        );
        return;
      }
      onToggle();
    }, [showOnlyMyPlants, userId, onToggle, t]);
  
    return (
      <TextToggle
        isActive={showOnlyMyPlants}
        activeText={t('map.myPlantsOnly')}
        inactiveText={t('map.allPlants')}
        onToggle={handleToggle}
      />
    );
  });