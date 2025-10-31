import { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { DictionaryColumns } from '@libs/supabase/operations/dictionary/type';
import { SUPABASE_URL } from '@env';
import { DICTIONARY_BUCKET_NAME } from '@constants/normal';

const getPublicImageUrl = (fileName: string) => {
  return `${SUPABASE_URL}/storage/v1/object/public/${DICTIONARY_BUCKET_NAME}/${fileName}`;
};

export const useImagePrefetch = (dictionary: DictionaryColumns[] | null) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [prefetchedDictionary, setPrefetchedDictionary] = useState<DictionaryColumns[] | null>(null);

  const prefetchImages = async (plants: DictionaryColumns[]) => {
    if (!plants || plants.length === 0) {
      setImageLoading(false);
      return;
    }
    
    // 이미 같은 데이터를 프리페치했다면 스킵
    if (prefetchedDictionary === plants) return;
    
    try {
      setImageLoading(true);
      const imageUrls = plants.map(plant => getPublicImageUrl(plant.id + ".webp"));
      
      // 모든 이미지를 병렬로 프리페치
      await Promise.all(
        imageUrls.map(url => Image.prefetch(url))
      );
      
      setPrefetchedDictionary(plants); // 프리페치 완료 표시
    } catch (error) {
      console.warn('이미지 프리페치 중 오류 발생:', error);
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    if (dictionary && dictionary !== prefetchedDictionary) {
      prefetchImages(dictionary);
    } else if (!dictionary) {
      setImageLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictionary]);

  return {
    imageLoading,
    getPublicImageUrl
  };
};
