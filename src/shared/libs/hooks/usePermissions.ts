import { usePermissionStore } from '@store/permissionStore.ts';
import { useEffect } from 'react';
import { AppState } from 'react-native';

// 카메라와 사진 라이브러리 권한을 관리하는 커스텀 훅
export const usePermissions = () => {
  const {
    cameraPermission,
    photoLibraryPermission,
    locationPermission,
    requestCameraPermission,
    requestPhotoLibraryPermission,
    requestLocationPermission,
    initPermissions,
  } = usePermissionStore();

  useEffect(() => {
    // 앱 상태 변경(예: 백그라운드 -> 포그라운드)을 감지하는 리스너 설정
    const subscription = AppState.addEventListener('change', nextAppState => {
      // 앱이 다시 활성화될 때마다 권한 상태를 다시 확인하고 업데이트합니다.
      // 이를 통해 사용자가 설정에서 권한을 변경하고 앱으로 돌아왔을 때, 변경된 상태를 즉시 반영할 수 있습니다.
      if (nextAppState === 'active') {
        initPermissions();
      }
    });

    // 컴포넌트가 언마운트될 때 리스너를 정리합니다.
    return () => {
      subscription.remove();
    };
  }, [initPermissions]);

  // 카메라 권한이 없으면 요청
  const checkAndRequestCameraPermission = async () => {
    if (!cameraPermission) {
      return await requestCameraPermission();
    }
    return cameraPermission;
  };

  // 앨범 권한이 없으면 요청
  const checkAndRequestPhotoLibraryPermission = async () => {
    if (!photoLibraryPermission) {
      return await requestPhotoLibraryPermission();
    }
    return photoLibraryPermission;
  };

  // 위치 권한이 없으면 요청
  const checkAndRequestLocationPermission = async () => {
    if (!locationPermission) {
      return await requestLocationPermission();
    }
    return locationPermission;
  };

  return {
    cameraPermission,
    photoLibraryPermission,
    locationPermission,
    checkAndRequestCameraPermission,
    checkAndRequestPhotoLibraryPermission,
    checkAndRequestLocationPermission,
  };
}; 