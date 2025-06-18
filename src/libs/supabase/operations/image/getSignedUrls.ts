import { supabase } from "../../supabase";
import { BUCKET_NAME } from "../../../../constants/normal";

export const getSignedUrls = async (imagePaths: string | string[]): Promise<string | (string | null)[]> => {
  try {
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
    const signedUrls = await Promise.all(
      paths.map(async (path) => {
        try {
          // 경로 유효성 검사
          if (!path || typeof path !== 'string') {
            console.error('Invalid image path:', path);
            return null;
          }

          // 서명된 URL 생성
          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(path, 3600);

          if (error) {
            console.error('Error creating signed URL:', error);
            return null;
          }

          if (!data?.signedUrl) {
            console.error('No signed URL returned from Supabase');
            return null;
          }

          return data.signedUrl;
        } catch (err) {
          console.error('Error getting signed URL:', err);
          return null;
        }
      })
    );

    return Array.isArray(imagePaths) ? signedUrls : (signedUrls[0] || '');
  } catch (err) {
    console.error('Error in getSignedUrls:', err);
    return Array.isArray(imagePaths) ? imagePaths.map(() => null) : '';
  }
};