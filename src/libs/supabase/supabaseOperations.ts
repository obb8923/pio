import { supabase } from './supabase';
import { Platform } from 'react-native';
import * as RNFS from 'react-native-fs';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import { useAuthStore } from '../../store/authStore';
const { isLoggedIn} = useAuthStore.getState();

export const getCurrentUserId = async (): Promise<string | null> => {
  /**
 * 현재 로그인된 Supabase 사용자의 ID를 가져옵니다.
 * @returns {Promise<string | null>} 사용자 ID 또는 null (로그인되지 않았거나 오류 발생 시)
 */
  if(!isLoggedIn) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.log('Supabase 사용자 정보 가져오기 오류:', error);
      return null; // 오류 발생 시 null 반환
    }

    if (!user) {
      console.log('로그인된 사용자가 없습니다.');
      return null; // 사용자 정보가 없으면 null 반환
    }

    return user.id; // 사용자 ID 반환

  } catch (err) {
    console.error('getCurrentUserId 함수 오류:', err);
    return null; // 예외 발생 시 null 반환
  }
};
export const requestAccountDeletion = async (): Promise<{ success: boolean, error?: any }> => {
  /**
 * 회원 탈퇴를 위한 Supabase Edge Function 호출을 요청합니다.
 * 실제 삭제 로직은 'delete-user' Edge Function에서 처리됩니다.
 * @returns {Promise<{ success: boolean, error?: any }>} 요청 성공 여부와 에러 객체
 */
  if(!isLoggedIn) return { success: false, error: new Error('로그인되지 않았습니다.') };
  try {
    // 'delete-user'는 실제 구현된 Edge Function의 이름이어야 합니다.
    const { error } = await supabase.functions.invoke('delete-user');

    if (error) {
      console.error('회원 탈퇴 Edge Function 호출 오류:', error);
      // Edge Function에서 반환한 구체적인 오류 메시지를 포함할 수 있습니다.
      return { success: false, error: new Error(error.message || '회원 탈퇴 처리 중 서버 오류가 발생했습니다.') };
    }

    console.log('회원 탈퇴 요청 성공');
    return { success: true };

  } catch (err: any) { // catch 블록에서 err 타입을 명시적으로 any 또는 Error로 지정
    console.error('requestAccountDeletion 함수 처리 중 예외 발생:', err);
    // 네트워크 오류 등 invoke 자체의 실패일 수 있습니다.
    // err 객체가 message 속성을 가지고 있는지 확인
    const errorMessage = err?.message || '회원 탈퇴 요청 중 알 수 없는 오류가 발생했습니다.';
    return { success: false, error: new Error(errorMessage) };
  }
};
export const getUserNickname = async (): Promise<string | null> => {
  /**
 * 현재 로그인된 사용자의 닉네임을 가져옵니다.
 * @returns {Promise<string | null>} 사용자의 닉네임 또는 null (로그인되지 않았거나 오류 발생 시)
 */
  if(!isLoggedIn) return null;
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error fetching user or user not logged in:', userError);
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('nickname')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user nickname:', error);
      return null;
    }

    if (__DEV__) {
      console.log('supabase: getUserNickname', data);
    }

    return data?.nickname || null;
  } catch (err) {
    console.error('getUserNickname function error:', err);
    return null;
  }
};
export const checkNicknameUpdateAvailability = async (): Promise<{ canUpdate: boolean, message?: string }> => {
  /**
 * 사용자의 닉네임 변경 가능 여부를 확인합니다.
 * @returns {Promise<{ canUpdate: boolean, message?: string }>} 변경 가능 여부와 메시지
 */
  if(!isLoggedIn) return { canUpdate: false, message: '로그인되지 않았습니다.' };
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { canUpdate: false, message: '사용자 인증에 실패했습니다.' };
    }

    const { data, error } = await supabase
      .from('users')
      .select('last_profile_update_at')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error checking nickname update availability:', error);
      return { canUpdate: false, message: '닉네임 변경 가능 여부를 확인하는 중 오류가 발생했습니다.' };
    }

    // last_profile_update_at이 null이면 변경 가능
    if (!data.last_profile_update_at) {
      return { canUpdate: true };
    }

    // 마지막 업데이트로부터 한 달이 지났는지 확인
    const lastUpdate = new Date(data.last_profile_update_at);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (lastUpdate < oneMonthAgo) {
      return { canUpdate: true };
    }

    // 다음 변경 가능 날짜 계산
    const nextUpdateDate = new Date(lastUpdate);
    nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 1);
    
    return { 
      canUpdate: false, 
      message: `다음 닉네임 변경은 ${nextUpdateDate.toLocaleDateString()}부터 가능합니다.` 
    };
  } catch (err) {
    console.error('checkNicknameUpdateAvailability function error:', err);
    return { canUpdate: false, message: '닉네임 변경 가능 여부를 확인하는 중 오류가 발생했습니다.' };
  }
};
export const uploadImageAndGetUrl = async (imageUri: string, bucketName: string): Promise<string | null> => {
  /**
 * 이미지를 Supabase 스토리지에 업로드하고 공개 URL을 반환합니다.
 * @param imageUri 업로드할 이미지의 로컬 URI
 * @param bucketName 이미지를 저장할 버킷 이름
 * @returns {Promise<string | null>} 이미지의 공개 URL 또는 null (오류 발생 시)
 */
  if(!isLoggedIn) return null;
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('User not authenticated');
      return null;
    }

    // 파일 확장자 추출
    const extension = imageUri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${new Date().toISOString()}_${Math.random().toString(36).substring(2, 15)}.${extension}`;

    // base64로 이미지 읽기
    const base64Data = await RNFS.readFile(imageUri, 'base64');

    // base64를 ArrayBuffer로 변환 (base64-arraybuffer 패키지 사용)
    const arrayBuffer = decodeBase64(base64Data);

    // Supabase Storage에 업로드
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: `image/${extension}`,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    // 공개 URL 가져오기
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error('Error getting public URL for image:', data.path);
      return null;
    }

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('uploadImageAndGetUrl function error:', err);
    return null;
  }
};
export const saveFoundPlant = async (plantData: {
  userId: string;
  imageUrl: string;
  memo: string | null;
  lat: number;
  lng: number;
  description: string | null; // plantName은 description으로 우선 사용합니다. 필요시 컬럼 추가.
  plantName: string | null; 
}): Promise<{ success: boolean, error?: any }> => {

/**
 * found_plants 테이블에 식물 데이터를 저장합니다.
 * @param plantData 저장할 식물 데이터
 * @returns {Promise<{ success: boolean, error?: any }>} 저장 성공 여부와 에러 객체
 */
  if(!isLoggedIn) return { success: false, error: new Error('로그인되지 않았습니다.') };
  try {
    const { userId, imageUrl, memo, lat, lng, description, plantName } = plantData;
    
    const { error } = await supabase.from('found_plants').insert([
      {
        user_id: userId,
        image_url: imageUrl,
        memo: memo,
        lat: lat,
        lng: lng,
        // description 필드에 plantName을 우선 사용하고, AI 분석 결과를 추후 업데이트 할 수 있도록 합니다.
        // 또는 description 필드를 AI 분석 결과용으로 남겨두고, plant_name 필드를 추가하는 것을 고려해야 합니다.
        // 현재는 plantName 값을 description으로 저장합니다.
        description: description || plantName, 
        plant_name: plantName // plant_name 필드가 테이블에 존재한다고 가정합니다. 없다면 마이그레이션 필요.
      },
    ]);

    if (error) {
      console.error('Error saving found plant data:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('saveFoundPlant function error:', err);
    return { success: false, error: err };
  }
};
export const getFoundPlants = async () => {
  /**
 * 발견된 식물들의 위치 정보를 가져옵니다.
 * @returns {Promise<Array<{
 *   id: string;
  *   lat: number;
  *   lng: number;
  *   image_url: string;
  *   plant_name: string;
  *   description: string;
  *   memo: string;
  * }> | null>} 발견된 식물들의 정보 배열 또는 null (오류 발생 시)
  */
  if(!isLoggedIn) return null;
  try {
    const { data, error } = await supabase
      .from('found_plants')
      .select('id, lat, lng, image_url, plant_name, description, memo');

    if (error) {
      console.error('Error fetching found plants:', error);
      return null;
    }

    if (__DEV__) {
      console.log('supabase: getFoundPlants', data);
    }

    return data;
  } catch (err) {
    console.error('getFoundPlants function error:', err);
    return null;
  }
};
export const getSignedImageUrl = async (imagePath: string, bucketName: string): Promise<string | null> => {
  /**
 * 스토리지의 이미지에 대한 서명된 URL을 생성합니다.
 * @param imagePath 스토리지 내 이미지 경로
 * @param bucketName 버킷 이름
 * @returns {Promise<string | null>} 서명된 URL 또는 null (오류 발생 시)
 */
  if(!isLoggedIn) return null;
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(imagePath, 3600); // 1시간 유효

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('getSignedImageUrl function error:', err);
    return null;
  }
};
export const getCurrentUserFoundPlants = async () => {
  /**
 * 현재 사용자가 발견한 식물들의 정보를 가져옵니다.
 * @returns {Promise<Array<{
 *   id: string;
  *   created_at: string;
  *   image_url: string;
  *   plant_name: string;
  *   description: string;
  *   memo: string;
  *   lat: number;
  *   lng: number;
  *   signed_url?: string;
  * }> | null>} 현재 사용자가 발견한 식물들의 정보 배열 또는 null (오류 발생 시)
  */
  if(!isLoggedIn) return null;
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('found_plants')
      .select('id, created_at, image_url, plant_name, description, memo, lat, lng')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching current user found plants:', error);
      return null;
    }

    // 각 이미지에 대해 서명된 URL 생성
    const plantsWithSignedUrls = await Promise.all(
      data.map(async (plant) => {
        try {
          // image_url에서 버킷 이름과 경로 추출
          // 예: https://[project-ref].supabase.co/storage/v1/object/public/found-plants/user-id/image.jpg
          const urlParts = plant.image_url.split('/');
          const bucketName = urlParts[urlParts.indexOf('public') + 1];
          const filePath = urlParts.slice(urlParts.indexOf('public') + 2).join('/');
          
          if (bucketName && filePath) {
            const signedUrl = await getSignedImageUrl(filePath, bucketName);
            return { ...plant, signed_url: signedUrl || undefined };
          }
        } catch (err) {
          console.error('Error processing image URL:', err);
        }
        return { ...plant, signed_url: undefined };
      })
    );

    if (__DEV__) {
      console.log('supabase: getCurrentUserFoundPlants', plantsWithSignedUrls);
    }

    return plantsWithSignedUrls;
  } catch (err) {
    console.error('getCurrentUserFoundPlants function error:', err);
    return null;
  }
};
export const getPlantList = async () => {
  /**
 * plant_list 테이블에서 식물 사전 데이터를 가져옵니다.
 * @returns {Promise<Array<{
 *   id: number;
  *   updated_at: string;
  *   image_url: string;
  *   plant_name: string;
  *   description: string;
  * }> | null>} 식물 사전 데이터 배열 또는 null (오류 발생 시)
  */
  if(!isLoggedIn) return null;
  try {
    const { data, error } = await supabase
      .from('plant_list')
      .select('id, updated_at, image_url, plant_name, description')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching plant list:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('getPlantList function error:', err);
    return null;
  }
};

export const signOut = async (): Promise<{ success: boolean, error?: any }> => {
  /**
   * Supabase에서 로그아웃을 수행합니다.
   * @returns {Promise<{ success: boolean, error?: any }>} 로그아웃 성공 여부와 에러 객체
   */
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('로그아웃 오류:', error);
      return { success: false, error };
    }

    console.log('로그아웃 성공');
    return { success: true };

  } catch (err: any) {
    console.error('signOut 함수 처리 중 예외 발생:', err);
    const errorMessage = err?.message || '로그아웃 중 알 수 없는 오류가 발생했습니다.';
    return { success: false, error: new Error(errorMessage) };
  }
};

export const getUserInfo = async (): Promise<{
  name: string | null;
  nickname: string | null;
  email: string | null;
  gender: boolean | null;
  birthDate: string | null;
} | null> => {
  /**
   * 현재 로그인된 사용자의 정보를 가져옵니다.
   * @returns {Promise<{ name: string | null, nickname: string | null, email: string | null, gender: boolean | null, birthDate: string | null } | null>} 
   * 사용자 정보 또는 null (로그인되지 않았거나 오류 발생 시)
   */
  if(!isLoggedIn) return null;
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error fetching user or user not logged in:', userError);
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('name, nickname, email, gender, birthdate')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user info:', error);
      return null;
    }

    if (__DEV__) {
      console.log('supabase: getUserInfo', data);
    }

    return {
      name: data?.name || null,
      nickname: data?.nickname || null,
      email: data?.email || user.email || null,
      gender: data?.gender,
      birthDate: data?.birthdate || null
    };
  } catch (err) {
    console.error('getUserInfo function error:', err);
    return null;
  }
};

export const updateUserInfo = async (userData: {
  nickname: string;
  gender: boolean | null;
  birthDate: string | null;
}): Promise<{ success: boolean; error?: any }> => {
  /**
   * 사용자 정보를 업데이트합니다.
   * @param userData 업데이트할 사용자 정보
   * @returns {Promise<{ success: boolean; error?: any }>} 업데이트 성공 여부와 에러 객체
   */
  if(!isLoggedIn) return { success: false, error: new Error('로그인되지 않았습니다.') };
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: new Error('사용자 ID를 찾을 수 없습니다.') };
    }

    const { error } = await supabase
      .from('users')
      .update({
        nickname: userData.nickname,
        gender: userData.gender,
        birthdate: userData.birthDate
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user info:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('updateUserInfo function error:', err);
    return { success: false, error: err };
  }
};

export const checkProfileUpdateAvailability = async (): Promise<{ canUpdate: boolean; nextUpdateDate?: Date }> => {
  /**
   * 사용자 정보 수정 가능 여부를 확인합니다.
   * @returns {Promise<{ canUpdate: boolean; nextUpdateDate?: Date }>} 수정 가능 여부와 다음 수정 가능 날짜
   */
  if(!isLoggedIn) return { canUpdate: false };
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { canUpdate: false };
    }

    const { data, error } = await supabase
      .from('users')
      .select('updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking profile update availability:', error);
      return { canUpdate: false };
    }

    // updated_at이 null이면 수정 가능
    if (!data.updated_at) {
      return { canUpdate: true };
    }

    // 마지막 업데이트로부터 한 달이 지났는지 확인
    const lastUpdate = new Date(data.updated_at);
    const oneMonthInFuture = new Date(lastUpdate);
    oneMonthInFuture.setMonth(oneMonthInFuture.getMonth() + 1);
    const today = new Date();

    if (today < oneMonthInFuture) { // 한달 내에 수정했으면 (즉, 다음 수정 가능일이 오늘보다 미래면)
      // 다음 수정 가능 날짜 계산
      const nextUpdateDate = new Date(lastUpdate);
      nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 1);
      return { 
        canUpdate: false, 
        nextUpdateDate 
      };
    }
    
    // 한달이 지났거나 오늘이 수정 가능일인 경우
    return { canUpdate: true };

  } catch (err) {
    console.error('checkProfileUpdateAvailability function error:', err);
    return { canUpdate: false };
  }
};