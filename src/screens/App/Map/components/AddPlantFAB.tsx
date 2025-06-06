import { View, Text, TouchableOpacity, Animated, Alert, Linking } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import CameraIcon from '../../../../../assets/svgs/Camera.svg';
import ImageAddIcon from '../../../../../assets/svgs/ImageAdd.svg';
import { TAB_BAR_HEIGHT } from '../../../../constants/TabNavOptions';
import React from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { usePermissionStore } from '../../../../store/permissionStore';
import { useFabAnimation } from '../hooks/useFabAnimation';

interface AddPlantFABProps {
  isFabOpen: boolean;
  onToggleFab: () => void;
  onNavigate: (screen: string, params: any) => void;
}

export const AddPlantFAB: React.FC<AddPlantFABProps> = ({
  isFabOpen,
  onToggleFab,
  onNavigate,
}) => {
  const { fabAnimation, animations } = useFabAnimation(isFabOpen);
  const { cameraButtonTranslateY, galleryButtonTranslateY, buttonScale } = animations;

  const handleCameraPress = async () => {
    const hasPermission = usePermissionStore.getState().camera;
    if (!hasPermission) {
      onToggleFab(); // FAB 닫기
      Alert.alert(
        "카메라 권한 필요",
        "카메라를 사용하려면 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
        [
          { text: "취소", style: "cancel" },
          { text: "설정으로 이동", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    onToggleFab();
    launchCamera({
      mediaType: 'photo',
      quality: 1,
    }, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('오류', '카메라 실행 중 오류가 발생했습니다.');
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        onNavigate('ImageProcessing', {
          imageUri: response.assets[0].uri,
        });
      } else {
        Alert.alert('오류', '이미지를 가져올 수 없습니다.');
      }
    });
  };

  const handleGalleryPress = async () => {
    const hasPermission = usePermissionStore.getState().photoLibrary;
    if (!hasPermission) {
      onToggleFab(); // FAB 닫기
      Alert.alert(
        "앨범 접근 권한 필요",
        "앨범에서 사진을 선택하려면 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
        [
          { text: "취소", style: "cancel" },
          { text: "설정으로 이동", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    onToggleFab();
    launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    }, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('오류', '갤러리 실행 중 오류가 발생했습니다.');
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        onNavigate('ImageProcessing', {
          imageUri: response.assets[0].uri,
        });
      } else {
        Alert.alert('오류', '이미지를 가져올 수 없습니다.');
      }
    });
  };

  return (
    <View className="w-1/2 absolute" style={{ bottom: TAB_BAR_HEIGHT + 20, right: 20 }}>
      {/* 갤러리 버튼 */}
      <Animated.View
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
          <Text className="text-greenActive font-medium">앨범에서 선택</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 카메라 버튼 */}
      <Animated.View
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
          <Text className="text-greenActive font-medium">카메라로 찍기</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 메인 Extended FAB */}
      <TouchableOpacity
        className="bg-greenTab rounded-full px-6 py-4 flex-row justify-center items-center shadow-lg"
        style={{opacity: isFabOpen ? 0.7 : 1}}
        onPress={onToggleFab}
      >
        <Animated.Text
          className="text-greenActive text-3xl font-bold"
          style={{
            transform: [{ rotate: isFabOpen ? '45deg' : '0deg' }]
          }}
        >
          +
        </Animated.Text>
        {!isFabOpen && (
          <Text className="text-greenActive text-lg font-bold ml-2">발견한 식물 추가하기</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}; 