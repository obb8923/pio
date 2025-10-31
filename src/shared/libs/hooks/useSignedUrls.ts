import { useState, useEffect, useRef } from 'react';
import { getSignedUrls } from '@libs/supabase/operations/image/getSignedUrls.ts';
import { found_plants_columns } from '@libs/supabase/operations/foundPlants/type.ts';

// 전역 캐시 (컴포넌트 언마운트 후에도 유지)
const signedUrlCache = new Map<string, string>();

export const useSignedUrls = (plants: found_plants_columns[]) => {
  const [signedUrls, setSignedUrls] = useState<(string | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const previousPlantsRef = useRef<string>(''); // 이전 plants의 JSON 문자열
  const previousUrlsRef = useRef<(string | null)[]>([]); // 이전 signedUrls

  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!plants.length) {
        setSignedUrls([]);
        previousUrlsRef.current = [];
        return;
      }

      // plants 배열을 JSON 문자열로 변환하여 변경 여부 확인
      const plantsKey = JSON.stringify(plants.map(p => ({ id: p.id, image_path: p.image_path })));
      
      // 같은 데이터면 스킵
      if (plantsKey === previousPlantsRef.current && previousUrlsRef.current.length > 0) {
        return;
      }

      previousPlantsRef.current = plantsKey;

      // 캐시된 URL이 모두 있는지 확인
      const cachedUrls = plants.map((plant) => {
        const cacheKey = `${plant.id}-${plant.image_path}`;
        return signedUrlCache.get(cacheKey) || null;
      });

      // 모든 URL이 캐시되어 있으면 캐시 사용
      if (cachedUrls.every(url => url !== null) && cachedUrls.length === plants.length) {
        const cachedUrlsArray = cachedUrls as string[];
        setSignedUrls(cachedUrlsArray);
        previousUrlsRef.current = cachedUrlsArray;
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const imagePaths = plants.map(plant => plant.image_path);
        const urls = await getSignedUrls(imagePaths);
        const urlArray = Array.isArray(urls) ? urls : [urls];
        
        // 캐시에 저장
        plants.forEach((plant, index) => {
          const cacheKey = `${plant.id}-${plant.image_path}`;
          if (urlArray[index]) {
            signedUrlCache.set(cacheKey, urlArray[index]);
          }
        });
        
        setSignedUrls(urlArray);
        previousUrlsRef.current = urlArray;
      } catch (err) {
        console.error('Error fetching signed URLs:', err);
        const errorUrls = plants.map(() => null);
        setSignedUrls(errorUrls);
        previousUrlsRef.current = errorUrls;
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrls();
  }, [plants]);

  return {
    signedUrls,
    isLoading
  };
}; 