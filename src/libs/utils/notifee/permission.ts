import notifee from '@notifee/react-native';

// 현재 알림 권한 상태 확인 함수
export async function checkNotificationPermission() {
  try {
    const settings = await notifee.getNotificationSettings();
    return settings;
  } catch (error) {
    console.error('알림 권한 상태 확인 실패:', error);
    return { authorizationStatus: 0 }; // 0 = NOT_DETERMINED
  }
}

// 알림 권한 요청 함수 (권한이 없을 때만 요청)
export async function requestNotificationPermission() {
  try {
    // 먼저 현재 권한 상태 확인
    const currentSettings = await checkNotificationPermission();
    
    // 권한이 이미 허용된 경우
    if (currentSettings.authorizationStatus === 1) { // AUTHORIZED
      console.log('알림 권한이 이미 허용되어 있습니다');
      return currentSettings;
    }
    
    // 권한이 거부된 경우
    if (currentSettings.authorizationStatus === 2) { // DENIED
      console.log('알림 권한이 거부되어 있습니다');
      return currentSettings;
    }
    
    // 권한이 결정되지 않은 경우에만 요청
    console.log('알림 권한을 요청합니다');
    const settings = await notifee.requestPermission();
    return settings;
  } catch (error) {
    console.error('Notifee 권한 요청 실패:', error);
    return { authorizationStatus: 0 }; // 0 = NOT_DETERMINED
  }
}
