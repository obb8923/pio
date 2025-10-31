import { supabase } from "@libs/supabase/supabase.ts";
import { BUCKET_NAME } from "@constants/normal.ts";

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
            // 에러 객체의 더 자세한 정보 로깅
            console.error('Error creating signed URL:', {
              message: error.message,
              name: error.name,
              statusCode: (error as any).statusCode,
              path,
              bucket: BUCKET_NAME,
            });
            return null;
          }

          if (!data?.signedUrl) {
            console.error('No signed URL returned from Supabase', {
              data,
              path,
              bucket: BUCKET_NAME,
            });
            return null;
          }

          return data.signedUrl;
        } catch (err) {
          // 예상치 못한 에러에 대한 더 자세한 정보
          const errorInfo = err instanceof Error 
            ? {
                message: err.message,
                name: err.name,
                stack: err.stack,
              }
            : err;
          console.error('Error getting signed URL:', {
            error: errorInfo,
            path,
            bucket: BUCKET_NAME,
          });
          return null;
        }
      })
    );

    return Array.isArray(imagePaths) ? signedUrls : (signedUrls[0] || '');
  } catch (err) {
    const errorInfo = err instanceof Error 
      ? {
          message: err.message,
          name: err.name,
          stack: err.stack,
        }
      : err;
    console.error('Error in getSignedUrls:', errorInfo);
    return Array.isArray(imagePaths) ? imagePaths.map(() => null) : '';
  }
};