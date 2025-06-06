import { Platform } from 'react-native';
import { requestMultiple, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import { usePermissionStore } from '../../../../store/permissionStore';

export const usePermissions = () => {
  const permissionStore = usePermissionStore();

  const checkAndRequestPermissions = async () => {
    let currentCameraPermission = permissionStore.camera;
    let currentPhotoLibraryPermission = permissionStore.photoLibrary;

    if (!currentCameraPermission || !currentPhotoLibraryPermission) {
      const permissionsToRequest: Permission[] = [];
      
      if (!currentCameraPermission) {
        permissionsToRequest.push(
          Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA
        );
      }
      
      if (!currentPhotoLibraryPermission) {
        permissionsToRequest.push(
          Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY :
          (typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version) >= 33 
            ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES 
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
        );
      }

      if (permissionsToRequest.length > 0) {
        console.log('[Permissions] Requesting permissions:', permissionsToRequest);
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

    return {
      hasAllPermissions: currentCameraPermission && currentPhotoLibraryPermission,
      permissions: {
        camera: currentCameraPermission,
        photoLibrary: currentPhotoLibraryPermission
      }
    };
  };

  return {
    checkAndRequestPermissions,
    permissionStatus: {
      camera: permissionStore.camera,
      photoLibrary: permissionStore.photoLibrary
    }
  };
}; 