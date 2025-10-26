import { useEffect } from "react";
import { Platform } from "react-native";
import { check, PERMISSIONS, RESULTS } from "react-native-permissions";
import { useLocationStore } from "../../../store/locationStore";
import { useTrackingStore } from "../../../store/trackingStore";

/**
 * Map 스크린에서 필요한 초기화 및 권한 요청을 처리하는 훅
 * - 추적 권한 요청
 * - 위치 권한 확인 및 위치 정보 가져오기
 */
export const useMapInitialization = () => {
  const { requestTrackingPermission } = useTrackingStore();
  const { fetchLocation } = useLocationStore();

  useEffect(() => {
    const initialize = async () => {
      // 1. 추적 권한 요청 (광고 개인화용)
      try {
        const trackingStatus = await requestTrackingPermission();
        if (__DEV__) console.log('[useMapInitialization] Tracking permission:', trackingStatus);
      } catch (error) {
        if (__DEV__) console.error('[useMapInitialization] Error requesting tracking permission:', error);
      }

      // 2. 위치 권한 확인 및 위치 정보 가져오기
      try {
        const locationPermission = Platform.OS === 'ios' 
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        
        const locationStatus = await check(locationPermission);
        if (locationStatus === RESULTS.GRANTED) {
          fetchLocation();
          if (__DEV__) console.log('[useMapInitialization] Location permission granted, fetching location');
        } else {
          if (__DEV__) console.log('[useMapInitialization] Location permission not granted');
        }
      } catch (error) {
        if (__DEV__) console.error('[useMapInitialization] Error checking location permission:', error);
      }
    };

    initialize();
  }, []);
};

