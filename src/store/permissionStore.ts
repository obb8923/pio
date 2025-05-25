import { create } from 'zustand';

interface PermissionState {
  camera: boolean;
  photoLibrary: boolean;
  location: boolean;
  setCameraPermission: (granted: boolean) => void;
  setPhotoLibraryPermission: (granted: boolean) => void;
  setLocationPermission: (granted: boolean) => void;
}

export const usePermissionStore = create<PermissionState>((set) => ({
  camera: false,
  photoLibrary: false,
  location: false,
  setCameraPermission: (granted) => set({ camera: granted }),
  setPhotoLibraryPermission: (granted) => set({ photoLibrary: granted }),
  setLocationPermission: (granted) => set({ location: granted }),
})); 