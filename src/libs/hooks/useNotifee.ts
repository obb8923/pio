import { useEffect, useState } from "react";
import { requestNotificationPermission } from '../utils/notifee/permission';
import { cancelAllScheduledNotifications, getScheduledNotifications, scheduleSpecificTimeNotification } from '../utils/notifee/schedule';
import { initializeNotifee, isNotifeeAvailable } from '../utils/notifee';

const notifeeMessages = [
  {
    title: '오늘 만난 식물, 기억하고 있나요?',
    body: '피오에 기록해두면 나중에 잊지 않고 다시 만날 수 있어요 🌱'
  },
  {
    title: '오늘 길에서 꽃을 봤다면?',
    body: '지금 피오에 남겨두면 당신만의 꽃지도가 완성돼요 🌸'
  },
  {
    title: '하루 한 송이, 꽃 기록 어때요?',
    body: '작고 귀여운 순간을 피오에 담아보세요 🌼'
  },
  {
    title: '당신만의 식물 컬렉션, 오늘도 추가해볼까요?',
    body: '피오가 기다리고 있어요 🍃'
  },
  {
    title: '오늘도 피오에 꽃 하나 피워볼까요?',
    body: '발견한 식물을 마커로 콕! 잊지 말고 기록해요 🌿'
  },
  {
    title: '혹시 오늘 본 꽃, 이름이 궁금했나요?',
    body: '피오가 같이 찾아드릴게요 🌺'
  },
  {
    title: '식물과의 하루, 피오에 남겨보세요',
    body: '당신의 작은 기록이 모여 예쁜 지도가 완성돼요 🗺️'
  },
  {
    title: '자연이 준 선물, 오늘도 만났나요?',
    body: '피오로 그 순간을 간직해보세요 🍀'
  },
  {
    title: '마커 하나가 추억 하나예요',
    body: '오늘의 식물을 지도 위에 콕 찍어보세요! 📍'
  },
  {
    title: '당신만의 꽃길을 만들고 있어요',
    body: '피오가 오늘의 발자국도 함께 기억해드릴게요 🌸'
  }
];
const notifeeTime = {
  hour: 11,
  minute: 57
}
export const useNotifee = () => {
  const [notifeeAvailable, setNotifeeAvailable] = useState(false);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await cancelAllScheduledNotifications();
        await initializeNotifee();
        const available = await isNotifeeAvailable();
        setNotifeeAvailable(available);
        
        // notifee가 사용 가능하면 자동으로 테스트 알림 설정
        if (available) {
          // 랜덤하게 메시지 선택
          const randomMessage = notifeeMessages[Math.floor(Math.random() * notifeeMessages.length)];
          
          await scheduleSpecificTimeNotification(
            randomMessage.title, 
            randomMessage.body, 
            notifeeTime.hour, 
            notifeeTime.minute
          );
          
          if(__DEV__) {
            // 예약된 알림들을 확인
            setTimeout(async () => {
              const scheduledNotifications = await getScheduledNotifications();
              // console.log('현재 예약된 알림 개수:', scheduledNotifications.length);
            }, 1000);
          }
        }
      } catch (error) {
        console.error('알림 초기화 실패:', error);
        setNotifeeAvailable(false);
      }
    };
    
    requestNotificationPermission();
    initializeNotifications();
  }, []);

  return { notifeeAvailable };
};