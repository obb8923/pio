import notifee from '@notifee/react-native';

// Android 채널 생성 함수
export async function createAndroidChannel() {
  try {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: 4, // HIGH
    });
    return channelId;
  } catch (error) {
    console.error('Android 채널 생성 실패:', error);
    return 'default';
  }
}

// 즉시 알림 표시 함수
// export async function displayNotification(title: string, body: string) {
//   try {
//     const channelId = await createAndroidChannel();
//     await notifee.displayNotification({
//       title,
//       body,
//       android: {
//         channelId,
//         pressAction: { id: 'default' },
//       },
//       ios: {
//         sound: 'default',
//       },
//     });
//   } catch (error) {
//     console.error('알림 표시 실패:', error);
//   }
// }
