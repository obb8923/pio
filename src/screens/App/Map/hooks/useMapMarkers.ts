import { useState } from 'react';
import { getSignedUrls } from '../../../../libs/supabase/supabaseOperations';
import type { FoundPlant } from './useFoundPlants';

export const useMapMarkers = () => {
  const [selectedPlant, setSelectedPlant] = useState<FoundPlant | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleMarkerPress = async (plant: FoundPlant) => {
    try {
      const signedUrl = await getSignedUrls(plant.image_url);
      const finalSignedUrl = Array.isArray(signedUrl) ? signedUrl[0] : signedUrl;
      setSelectedPlant({ ...plant, signed_url: finalSignedUrl || undefined });
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error getting signed URL:', error);
      setSelectedPlant(plant);
      setIsModalVisible(true);
    }
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