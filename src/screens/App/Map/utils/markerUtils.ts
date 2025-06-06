import { flowerImages } from '../constants/images';

/**
 * 식물 ID를 기반으로 마커에 표시할 꽃 이미지를 결정합니다.
 * @param plantId - 식물의 고유 ID
 * @returns 마커에 표시할 꽃 이미지
 */
export const getFlowerImageForPlant = (plantId: string) => {
  const lastChar = plantId.slice(-1);
  const num = parseInt(lastChar);
  const index = (isNaN(num) ? 0 : num) % flowerImages.length;
  return flowerImages[index];
}; 