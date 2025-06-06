import { useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { usePermissionStore } from '../../store/permissionStore';

export const useLocationPermissions = () => {
  const { 
    camera, 
    photoLibrary, 
    location,
    setCameraPermission,
    setPhotoLibraryPermission,
    setLocationPermission
  } = usePermissionStore();

  const checkAndRequestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '카메라 권한',
            message: '카메라 접근 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
          }
        );
        setCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await check(PERMISSIONS.IOS.CAMERA);
        if (result === RESULTS.DENIED) {
          const permissionResult = await request(PERMISSIONS.IOS.CAMERA);
          setCameraPermission(permissionResult === RESULTS.GRANTED);
        } else {
          setCameraPermission(result === RESULTS.GRANTED);
        }
      }
    } catch (err) {
      console.warn(err);
      setCameraPermission(false);
    }
  };

  const checkAndRequestPhotoLibraryPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: '사진 라이브러리 권한',
            message: '사진 라이브러리 접근 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
          }
        );
        setPhotoLibraryPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (result === RESULTS.DENIED) {
          const permissionResult = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
          setPhotoLibraryPermission(permissionResult === RESULTS.GRANTED);
        } else {
          setPhotoLibraryPermission(result === RESULTS.GRANTED);
        }
      }
    } catch (err) {
      console.warn(err);
      setPhotoLibraryPermission(false);
    }
  };

  const checkAndRequestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한',
            message: '위치 접근 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
          }
        );
        setLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (result === RESULTS.DENIED) {
          const permissionResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          setLocationPermission(permissionResult === RESULTS.GRANTED);
        } else {
          setLocationPermission(result === RESULTS.GRANTED);
        }
      }
    } catch (err) {
      console.warn(err);
      setLocationPermission(false);
    }
  };

  return {
    camera,
    photoLibrary,
    location,
    checkAndRequestCameraPermission,
    checkAndRequestPhotoLibraryPermission,
    checkAndRequestLocationPermission,
  };
}; 