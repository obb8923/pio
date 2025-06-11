import { useAuthStore } from "../../../../store/authStore";
import { supabase } from "../../supabase";
import * as RNFS from 'react-native-fs';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import ImageResizer from 'react-native-image-resizer';

/**
 * 이미지를 리사이징합니다.
 * @param imageUri 원본 이미지 URI
 * @returns 리사이징된 이미지 정보 또는 null
 */
const resizeImage = async (imageUri: string) => {
  try {
    const resizedImage = await ImageResizer.createResizedImage(
      imageUri,
      1280,
      1280,
      'JPEG',
      85,
      0,
      undefined,
      false,
      { mode: 'contain', onlyScaleDown: true }
    );
    console.log('resizeImage: Image resized successfully. URI:', resizedImage.uri, 'Size:', resizedImage.size);
    return resizedImage;
  } catch (resizeError) {
    console.error('resizeImage: Error resizing image:', resizeError);
    return null;
  }
};

/**
 * 이미지를 ArrayBuffer로 변환합니다.
 * @param imageUri 이미지 URI
 * @returns ArrayBuffer 또는 null
 */
const convertImageToArrayBuffer = async (imageUri: string) => {
  try {
    const base64Data = await RNFS.readFile(imageUri, 'base64');
    console.log('convertImageToArrayBuffer: Image read to base64 successfully.');
    const arrayBuffer = decodeBase64(base64Data);
    console.log('convertImageToArrayBuffer: Base64 decoded to ArrayBuffer.');
    return arrayBuffer;
  } catch (error) {
    console.error('convertImageToArrayBuffer: Error converting image:', error);
    return null;
  }
};

/**
 * 이미지를 Supabase Storage에 업로드합니다.
 * @param arrayBuffer 업로드할 이미지 데이터
 * @param fileName 저장될 파일 이름
 * @param extension 파일 확장자
 * @param bucketName 버킷 이름
 * @returns 업로드된 파일 데이터 또는 null
 */
const uploadImageToStorage = async (
  arrayBuffer: ArrayBuffer,
  fileName: string,
  extension: string,
  bucketName: string
) => {
  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: `image/${extension}`,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('uploadImageToStorage: Error uploading image:', uploadError);
      return null;
    }
    console.log('uploadImageToStorage: Image uploaded successfully. Path:', uploadData.path);
    return uploadData;
  } catch (error) {
    console.error('uploadImageToStorage: Error:', error);
    return null;
  }
};

export const uploadImageAndGetPath = async (imageUri: string, bucketName: string): Promise<string | null> => {
  /**
   * 이미지를 Supabase 스토리지에 업로드하고 경로를 반환합니다.
   * 업로드 전에 이미지 크기를 조절합니다.
   * @param imageUri 업로드할 이미지의 로컬 URI
   * @param bucketName 이미지를 저장할 버킷 이름
   * @returns {Promise<string | null>} 이미지의 공개 URL 또는 null (오류 발생 시)
   */
  const { userId } = useAuthStore.getState();
  if (!userId) {
    console.error('uploadImageAndGetUrl: User not authenticated');
    return null;
  }

  try {
    console.log('uploadImageAndGetUrl: User authenticated, userId:', userId);

    // 1. 이미지 리사이징
    const resizedImage = await resizeImage(imageUri);
    if (!resizedImage) return null;

    // 파일 이름 생성
    const extension = resizedImage.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/${new Date().toISOString()}_${Math.random().toString(36).substring(2, 15)}.${extension}`;
    console.log('uploadImageAndGetUrl: Generated fileName:', fileName);

    // 2. 이미지 변환
    const arrayBuffer = await convertImageToArrayBuffer(resizedImage.uri);
    if (!arrayBuffer) return null;

    // 3. 스토리지 업로드
    const uploadData = await uploadImageToStorage(arrayBuffer, fileName, extension, bucketName);
    if (!uploadData) return null;

    // 4. 이미지 경로 가져오기
    return uploadData.path;
  } catch (err) {
    console.error('uploadImageAndGetUrl: Error:', err);
    return null;
  }
};