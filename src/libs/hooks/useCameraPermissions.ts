// 필요한 리액트 네이티브와 권한 관련 라이브러리 임포트
import { Platform } from 'react-native';
import { requestMultiple, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import { usePermissionStore } from '../../store/permissionStore';

// 카메라와 사진 라이브러리 권한을 관리하는 커스텀 훅
export const useCameraPermissions = () => {
  // 권한 상태를 관리하는 스토어 초기화
  const permissionStore = usePermissionStore();

  // 권한 체크 및 요청을 처리하는 비동기 함수
  const checkAndRequestPermissions = async () => {
    let currentCameraPermission = permissionStore.camera;
    let currentPhotoLibraryPermission = permissionStore.photoLibrary;

    // 필요한 권한이 없는 경우 권한 요청 처리
    if (!currentCameraPermission || !currentPhotoLibraryPermission) {
      // 요청할 권한들을 저장할 배열
      const permissionsToRequest: Permission[] = [];
      
      // 카메라 권한이 없는 경우 운영체제에 맞는 권한 요청 추가
      if (!currentCameraPermission) {
        permissionsToRequest.push(
          Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA
        );
      }
      
      // 사진 라이브러리 권한이 없는 경우 운영체제와 버전에 맞는 권한 요청 추가
      if (!currentPhotoLibraryPermission) {
        permissionsToRequest.push(
          Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY :
          (typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version) >= 33 
            ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES 
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
        );
      }

      // 요청할 권한이 있는 경우 권한 요청 실행
      if (permissionsToRequest.length > 0) {
        // 요청할 권한 목록 로깅
        console.log('[Permissions] Requesting permissions:', permissionsToRequest);
        // 여러 권한 동시 요청
        const statuses = await requestMultiple(permissionsToRequest);
        console.log('[Permissions] Permission statuses:', statuses);

        const cameraStatus = statuses[Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA];
        const photoStatus = statuses[
          Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY :
          (typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version) >= 33 
            ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES 
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
        ];

        if (cameraStatus !== undefined) {
          const granted = cameraStatus === RESULTS.GRANTED;
          permissionStore.setCameraPermission(granted);
          currentCameraPermission = granted;
        }
        
        if (photoStatus !== undefined) {
          const granted = photoStatus === RESULTS.GRANTED;
          permissionStore.setPhotoLibraryPermission(granted);
          currentPhotoLibraryPermission = granted;
        }
      }
    }

    // 현재 권한 상태를 객체로 반환
    return {
      // 모든 필요한 권한이 허용되었는지 여부
      hasAllPermissions: currentCameraPermission && currentPhotoLibraryPermission,
      // 각 권한별 상태
      permissions: {
        camera: currentCameraPermission,
        photoLibrary: currentPhotoLibraryPermission
      }
    };
  };

  // 훅의 반환값 정의
  return {
    checkAndRequestPermissions,
    permissionStatus: {
      camera: permissionStore.camera,
      photoLibrary: permissionStore.photoLibrary
    }
  };
}; 