import {View,Modal,TouchableOpacity,Text, Animated, Linking, Platform} from 'react-native'
import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useModalBackground } from '@libs/hooks/useModalBackground';
import { GOOGLEPLAY_URL ,APPSTORE_URL} from "@constants/normal";

type ReviewRequestModalProps = {
    isVisible:boolean;
    onClose: ()=>void
    setReviewedInYear:()=>Promise<void>
}

export const ReviewRequestModal = ({isVisible,onClose,setReviewedInYear}:ReviewRequestModalProps)=>{
    const { t } = useTranslation(['domain', 'common']);
    const storeUrl = Platform.OS==='ios'?APPSTORE_URL:GOOGLEPLAY_URL; 

    useModalBackground(isVisible);
    
    // 애니메이션과 상태 추가
    const submitAnim = useRef(new Animated.Value(0)).current;
    const [showSubmit, setShowSubmit] = useState(false);

    // 모달이 보일 때 0.3초 후에 submit 버튼 애니메이션 시작
    useEffect(() => {
        if (isVisible) {
            // 모달이 열릴 때 0.3초 후에 submit 버튼 나타남
            const timer = setTimeout(() => {
                setShowSubmit(true);
                Animated.timing(submitAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }, 300);

            return () => clearTimeout(timer);
        } else {
            // 모달이 닫힐 때 애니메이션 리셋
            setShowSubmit(false);
            submitAnim.setValue(0);
        }
    }, [isVisible, submitAnim]);

    return (
        <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {onClose();}}
      >
        <View className="flex-1 justify-center items-center mb-32">
          {/* container (background) */}
          <View className="w-4/5 h-52 bg-greenTab p-2 rounded-xl items-center justify-center">
          {/* close button (absolute) */}
          <TouchableOpacity
          className="w-14 h-14 absolute top-0 items-center justify-center z-10 bg-greenTab rounded-full p-1" 
          style={{right:-18}}
          onPress={async()=>{await setReviewedInYear(); onClose();}}>
            <View className="items-center justify-center w-full h-full  rounded-full bg-black/50">
              <View className="bg-greenActive" style={{ width: 20, height: 4, position: 'absolute', transform: [{ rotate: '45deg' }] , borderRadius: 2}} />
              <View className="bg-greenActive" style={{ width: 20, height: 4, position: 'absolute', transform: [{ rotate: '-45deg' }], borderRadius: 2 }} />
            </View>
          </TouchableOpacity>
            {/* inner container (border) */}
            <View className="w-full h-full rounded-2xl pl-6 pr-10 flex-col justify-center pb-4">
            <Text className="text-greenActive text-2xl font-bold mb-2">{t('domain:map.reviewRequestModal.saveComplete')}</Text>
              <Text className="text-greenActive text-2xl font-bold mb-2">{t('domain:map.reviewRequestModal.wasAppHelpful')}</Text>
              <Text className="text-greenActive text-2xl font-bold">{t('domain:map.reviewRequestModal.pleaseTellUs')}</Text>

            </View>
                 {/* submit button (absolute) */}
          {/* Animated Submit Button */}
          <Animated.View
            style={{
              opacity: submitAnim,
              transform: [
                {
                  translateY: submitAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0], // 아래에서 위로 슬라이드
                  }),
                },
              ],
              position: "absolute",
              bottom: 0,
              right: -18,
            }}
            pointerEvents={showSubmit ? "auto" : "none"}
          >
            <TouchableOpacity
            className="w-auto h-14 items-center justify-center z-10 bg-greenTab rounded-full p-1"
            onPress={async()=>{
                Linking.openURL(storeUrl);
                setReviewedInYear();
            }}
            >
              <View 
                className="pl-4 flex-row items-center justify-center h-full rounded-full bg-black/50"
                >
                <Text className="text-greenActive font-bold text-xl ">{t('domain:map.reviewRequestModal.goToReview')}</Text>
                {/* 화살표 컨테이너 */}
                <View className="w-14 h-14 items-center justify-center rounded-full" style={{ transform: [{ rotate: '-45deg' }] }}>
                {/* 화살표 몸통 */}
                <View className="bg-greenActive" style={{ width: 20, height: 4, borderRadius: 2 }} />
                {/* 화살촉 위쪽 */}
                <View className="bg-greenActive" style={{ width: 12, height: 4, borderRadius: 2, position: 'absolute', right: 13, top: 19, transform: [{ rotate: '45deg' }] }} />
                {/* 화살촉 아래쪽 */}
                <View className="bg-greenActive" style={{ width: 12, height: 4, borderRadius: 2, position: 'absolute', right: 13, bottom: 19, transform: [{ rotate: '-45deg' }] }} />
                </View>
                </View>
            </TouchableOpacity>
          </Animated.View>
          </View>
        </View>
      </Modal>   
    )
}
