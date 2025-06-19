import { useState, useEffect } from 'react';
import { getSignedUrls } from '../supabase/operations/image/getSignedUrls';
import { found_plants_columns } from '../supabase/operations/foundPlants/type';

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