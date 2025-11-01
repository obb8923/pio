import { View, Text, TouchableOpacity, Animated, Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/Colors';
import CameraIcon from '@assets/svgs/Camera.svg';
import ImageAddIcon from '@assets/svgs/ImageAdd.svg';
import React, { useCallback, memo } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import { usePermissionStore } from '../../../../store/permissionStore';
import { usePermissions } from '@libs/hooks/usePermissions';
import { useFab } from '@domain/App/Map/hooks/useFab.ts';
import { useHaptic } from '@libs/hooks/useHaptic';
interface AddPlantFABProps {
  onNavigate: (screen: string, params: any) => void;
}

export const AddPlantFAB = memo(({ onNavigate }:AddPlantFABProps) => {
  const { t } = useTranslation(['domain', 'common']);
  const { isOpen, toggle, close, fabAnimation, animations } = useFab();
  const { cameraButtonTranslateY, galleryButtonTranslateY, buttonScale } = animations;
  const {cameraPermission,photoLibraryPermission,checkAndRequestCameraPermission,checkAndRequestPhotoLibraryPermission } = usePermissions();
  const { light } = useHaptic();
  const handleCameraPress = useCallback(async () => {
    if (!cameraPermission) {
      close(); // FAB 닫기
      const permissionGranted = await checkAndRequestCameraPermission();
      if(!permissionGranted){
      Alert.alert(
        t('common:errors.cameraPermission.title'),
        t('common:errors.cameraPermission.message'),
        [
          { text: t('common:errors.cameraPermission.cancel'), style: "cancel" as any },
          { text: t('common:errors.cameraPermission.settings'), onPress: () => Linking.openSettings() }
        ]
      );
      }
      return;
    }

    close();
    launchCamera({
      mediaType: 'photo',
      quality: 1,
    }, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert(t('common:errors.unknownError'), t('common:errors.cameraError'));
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        onNavigate('ImageProcessing', {
          imageUri: response.assets[0].uri,
        });
      } else {
        Alert.alert(t('common:errors.unknownError'), t('common:errors.imageLoadError'));
      }
    });
  }, [cameraPermission, checkAndRequestCameraPermission, close, onNavigate, t]);

  const handleGalleryPress = useCallback(async () => {
    if (!photoLibraryPermission) {
      close(); // FAB 닫기
      const permissionGranted = await checkAndRequestPhotoLibraryPermission();
      if(!permissionGranted){
      Alert.alert(
        t('common:errors.albumPermission.title'),
        t('common:errors.albumPermission.message'),
        [
          { text: t('common:errors.albumPermission.cancel'), style: "cancel" as any },
          { text: t('common:errors.albumPermission.settings'), onPress: () => Linking.openSettings() }
        ]
      );
    }
      return;
    }

    close();
    launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    }, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert(t('common:errors.unknownError'), t('common:errors.galleryError'));
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        onNavigate('ImageProcessing', {
          imageUri: response.assets[0].uri,
        });
      } else {
        Alert.alert(t('common:errors.unknownError'), t('common:errors.imageLoadError'));
      }
    });
  }, [photoLibraryPermission, checkAndRequestPhotoLibraryPermission, close, onNavigate, t]);

  return (
    <View className="w-1/2 absolute bottom-8 right-4">
      {/* 갤러리 버튼 */}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={{
          transform: [
            { translateY: galleryButtonTranslateY },
            { scale: buttonScale }
          ],
          opacity: fabAnimation,
        }}
      >
        <TouchableOpacity
          className="bg-greenTab rounded-full px-6 py-4 flex-row justify-center items-center shadow-lg"
          onPress={handleGalleryPress}
        >
          <ImageAddIcon style={{color: Colors.greenActive, width: 20, height: 20, marginRight: 8}}/>
          <Text className="text-greenActive font-medium">{t('map.galleryButton')}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 카메라 버튼 */}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={{
          transform: [
            { translateY: cameraButtonTranslateY },
            { scale: buttonScale }
          ],
          opacity: fabAnimation,
        }}
      >
        <TouchableOpacity
          className="bg-greenTab rounded-full px-6 py-4 flex-row justify-center items-center shadow-lg"
          onPress={handleCameraPress}
        >
          <CameraIcon style={{color: Colors.greenActive, width: 20, height: 20, marginRight: 8}}/>
          <Text className="text-greenActive font-medium">{t('map.cameraButton')}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 메인 Extended FAB */}
      <TouchableOpacity
        className="bg-greenTab rounded-full px-6 py-4 flex-row justify-center items-center shadow-lg"
        style={{opacity: isOpen ? 0.7 : 1}}
        onPress={() => {
          light();
          toggle();
        }}
      >
        <Animated.Text
          className="text-greenActive text-3xl font-bold"
          style={{
            transform: [{ rotate: isOpen ? '45deg' : '0deg' }]
          }}
        >
          +
        </Animated.Text>
        {!isOpen && (
          <Text className="text-greenActive text-lg font-bold ml-2">{t('map.addPlant')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}); 