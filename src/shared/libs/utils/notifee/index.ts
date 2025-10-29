import notifee from '@notifee/react-native';

// Notifee 모듈이 사용 가능한지 확인하는 함수
export async function isNotifeeAvailable(): Promise<boolean> {
  try {
    // 간단한 API 호출로 모듈이 로드되었는지 확인
    await notifee.getInitialNotification();
    return true;
  } catch (error) {
    console.error('Notifee 모듈을 사용할 수 없습니다:', error);
    return false;
  }
}

// Notifee 초기화 함수
export async function initializeNotifee(): Promise<void> {
  try {
    await isNotifeeAvailable();
  } catch (error) {
    console.error('Notifee 초기화 실패:', error);
  }
} 