// 광고 관련 유틸리티 함수들
import { useTrackingStore } from '@store/trackingStore.ts';

/**
 * 추적 권한 상태에 따른 광고 설정을 반환합니다.
 * @returns 광고 요청 옵션 객체
 */
export const getAdRequestOptions = () => {
  const { isTrackingAuthorized } = useTrackingStore.getState();
  
  return {
    requestNonPersonalizedAdsOnly: !isTrackingAuthorized,
    isPersonalizedAdsEnabled: isTrackingAuthorized,
    trackingStatus: useTrackingStore.getState().trackingStatus
  };
};

/**
 * 추적 권한이 허용되었는지 확인합니다.
 * @returns 추적 권한 허용 여부
 */
export const isTrackingPermissionGranted = (): boolean => {
  return useTrackingStore.getState().isTrackingAuthorized;
};

/**
 * 광고 타입에 따른 설명을 반환합니다.
 * @returns 광고 타입 설명
 */
export const getAdTypeDescription = (): string => {
  const isAuthorized = isTrackingPermissionGranted();
  return isAuthorized 
    ? '개인화된 광고가 표시됩니다' 
    : '일반 광고가 표시됩니다';
};
