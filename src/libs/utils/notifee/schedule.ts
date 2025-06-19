import notifee, { TriggerType, RepeatFrequency } from '@notifee/react-native';
import { createAndroidChannel } from './service';
// 특정 시간에 알림을 보내는 함수
export async function scheduleSpecificTimeNotification(title: string, body: string, hour: number, minute: number) {
  try {
    const channelId = await createAndroidChannel();
    
    const now = new Date();
    const triggerDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0
    );
    // 이미 지난 시간이라면 내일로 예약
    if (triggerDate < now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }
    await notifee.createTriggerNotification(
      {
        title,
        body,
        android: { 
          channelId,
          importance: 4, // HIGH importance
          pressAction: { id: 'default' },
        },
        ios: { sound: 'default' },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
        repeatFrequency: RepeatFrequency.DAILY, // 매일 반복
      }
    );
  } catch (error) {
    console.error(`${hour}시 ${minute}분 알림 스케줄링 실패:`, error);
  }
}

// 모든 예약된 알림을 취소하는 함수
export async function cancelAllScheduledNotifications() {
  try {
    await notifee.cancelAllNotifications();
    console.log('모든 예약된 알림이 취소되었습니다.');
  } catch (error) {
    console.error('알림 취소 실패:', error);
  }
}

// 현재 예약된 알림들을 확인하는 함수
export async function getScheduledNotifications() {
  try {
    const notifications = await notifee.getTriggerNotifications();
    console.log('현재 예약된 알림들:', notifications);
    return notifications;
  } catch (error) {
    console.error('예약된 알림 조회 실패:', error);
    return [];
  }
}
