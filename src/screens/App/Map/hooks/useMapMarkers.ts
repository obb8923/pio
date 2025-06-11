import { useState } from 'react';
import type { FoundPlant } from '../../../../libs/hooks/useFoundPlants';

export const useMapMarkers = () => {
  const [selectedPlant, setSelectedPlant] = useState<FoundPlant | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleMarkerPress = async (plant: FoundPlant) => {
    setSelectedPlant(plant);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedPlant(null);
  };

  return {
    selectedPlant,
    isModalVisible,
    handleMarkerPress,
    closeModal
  };
}; 