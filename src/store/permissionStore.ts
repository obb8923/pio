import { create } from 'zustand';
import { requestMultiple, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import { Platform } from 'react-native';

interface PermissionState {
  camera: boolean;
  photoLibrary: boolean;
  location: boolean;
  setCameraPermission: (granted: boolean) => void;
  setPhotoLibraryPermission: (granted: boolean) => void;
  setLocationPermission: (granted: boolean) => void;
  requestAllPermissions: () => Promise<boolean>;
  hasAllPermission: () => boolean;
  isInitialized: boolean;
  initPermissions: () => Promise<void>;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  camera: false,
  photoLibrary: false,
  location: false,
  isInitialized: false,
  setCameraPermission: (granted) => set({ camera: granted }),
  setPhotoLibraryPermission: (granted) => set({ photoLibrary: granted }),
  setLocationPermission: (granted) => set({ location: granted }),
  hasAllPermission: () => {
    const state = get();
    return state.camera && state.photoLibrary && state.location;
  },

  initPermissions: async () => {
    try {
      let galleryPermission;
      if (Platform.OS === 'android') {
        const version = typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version;
        galleryPermission = version >= 33 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }

      const permissionsToCheck = Platform.select({
        ios: [
          PERMISSIONS.IOS.CAMERA,
          PERMISSIONS.IOS.PHOTO_LIBRARY,
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        ],
        android: [
          PERMISSIONS.ANDROID.CAMERA,
          galleryPermission,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ],
        default: [],
      });

      if (!permissionsToCheck || permissionsToCheck.length === 0) {
        set({ isInitialized: true });
        return;
      }

      for (const permission of permissionsToCheck) {
        if (!permission) continue;
        try {
          const status = await check(permission);
          const isGranted = status === RESULTS.GRANTED;

          if (Platform.OS === 'ios') {
            if (permission === PERMISSIONS.IOS.CAMERA) {
              set({ camera: isGranted });
            } else if (permission === PERMISSIONS.IOS.PHOTO_LIBRARY) {
              set({ photoLibrary: isGranted });
            } else if (permission === PERMISSIONS.IOS.LOCATION_WHEN_IN_USE) {
              set({ location: isGranted });
            }
          } else if (Platform.OS === 'android') {
            if (permission === PERMISSIONS.ANDROID.CAMERA) {
              set({ camera: isGranted });
            } else if (permission === PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE || permission === PERMISSIONS.ANDROID.READ_MEDIA_IMAGES) {
              set({ photoLibrary: isGranted });
            } else if (permission === PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION) {
              set({ location: isGranted });
            }
          }
        } catch (error) {
          console.error(`[PermissionStore] Error checking permission ${permission}:`, error);
        }
      }
      set({ isInitialized: true });
    } catch (error) {
      console.error("[PermissionStore] Error during permission check: ", error);
      set({ isInitialized: true });
    }
  },
  
  requestAllPermissions: async () => {
    try {
      let galleryPermission;
      if (Platform.OS === 'android') {
        const version = typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : Platform.Version;
        galleryPermission = version >= 33 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }
      const permissionsToRequest = Platform.select({
        ios: [
          PERMISSIONS.IOS.CAMERA,
          PERMISSIONS.IOS.PHOTO_LIBRARY,
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        ],
        android: [
          PERMISSIONS.ANDROID.CAMERA,
          galleryPermission,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ],
        default: [],
      });

      console.log('[PermissionStore] Requesting permissions:', permissionsToRequest);

      if (!permissionsToRequest || permissionsToRequest.length === 0) {
        console.log('[PermissionStore] No permissions to request');
        return false;
      }

      // 각 권한을 개별적으로 요청
      for (const permission of permissionsToRequest) {
        if (!permission) continue;
        try {
          const status = await requestMultiple([permission]);
          console.log(`[PermissionStore] Permission ${permission} status:`, status);
          
          if (Platform.OS === 'ios') {
            if (permission === PERMISSIONS.IOS.CAMERA) {
              set({ camera: status[permission] === RESULTS.GRANTED });
            } else if (permission === PERMISSIONS.IOS.PHOTO_LIBRARY) {
              set({ photoLibrary: status[permission] === RESULTS.GRANTED });
            } else if (permission === PERMISSIONS.IOS.LOCATION_WHEN_IN_USE) {
              set({ location: status[permission] === RESULTS.GRANTED });
            }
          } else if (Platform.OS === 'android') {
            if (permission === PERMISSIONS.ANDROID.CAMERA) {
              set({ camera: status[permission] === RESULTS.GRANTED });
            } else if (permission === PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE || permission === PERMISSIONS.ANDROID.READ_MEDIA_IMAGES) {
              set({ photoLibrary: status[permission] === RESULTS.GRANTED });
            } else if (permission === PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION) {
              set({ location: status[permission] === RESULTS.GRANTED });
            }
          }
        } catch (error) {
          console.error(`[PermissionStore] Error requesting permission ${permission}:`, error);
        }
      }

      // 모든 권한이 승인되었는지 확인
      const state = get();
      return state.camera && state.photoLibrary && state.location;
    } catch (error) {
      console.error("[PermissionStore] Error during permission request: ", error);
      return false;
    }
  },
})); 