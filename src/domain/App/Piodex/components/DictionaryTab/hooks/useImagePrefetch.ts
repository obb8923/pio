import { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { DictionaryColumns } from '@libs/supabase/operations/dictionary/type';
import { SUPABASE_URL } from '@env';
import { DICTIONARY_BUCKET_NAME } from '@constants/normal';

const getPublicImageUrl = (fileName: string) => {
  return `${SUPABASE_URL}/storage/v1/object/public/${DICTIONARY_BUCKET_NAME}/${fileName}`;
};

export const useImagePrefetch = (dictionary: DictionaryColumns[] | null) => {
  const [imageLoading, setImageLoading] = useState(true);

  const prefetchImages = async (plants: DictionaryColumns[]) => {
    if (!plants || plants.length === 0) return;
    
    try {
      setImageLoading(true);
      const imageUrls = plants.map(plant => getPublicImageUrl(plant.id + ".jpg"));
      
      // 모든 이미지를 병렬로 프리페치
      await Promise.all(
        imageUrls.map(url => Image.prefetch(url))
      );
    } catch (error) {
      console.warn('이미지 프리페치 중 오류 발생:', error);
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    if (dictionary) {
      prefetchImages(dictionary);
    }
  }, [dictionary]);

  return {
    imageLoading,
    getPublicImageUrl
  };
};
