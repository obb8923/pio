import { useState, useEffect } from 'react';
import { getSignedUrls } from '@libs/supabase/operations/image/getSignedUrls.ts';
import { found_plants_columns } from '@libs/supabase/operations/foundPlants/type.ts';

export const useSignedUrls = (plants: found_plants_columns[]) => {
  const [signedUrls, setSignedUrls] = useState<(string | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!plants.length) {
        setSignedUrls([]);
        return;
      }

      setIsLoading(true);
      try {
        const imagePaths = plants.map(plant => plant.image_path);
        const urls = await getSignedUrls(imagePaths);
        setSignedUrls(Array.isArray(urls) ? urls : [urls]);
      } catch (err) {
        console.error('Error fetching signed URLs:', err);
        setSignedUrls(plants.map(() => null));
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