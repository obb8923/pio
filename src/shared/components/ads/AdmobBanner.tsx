import React from "react";
import { View, ViewStyle ,Platform} from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { GOOGLE_MOBILE_ADS_UNIT_ID_BANNER_ANDROID ,GOOGLE_MOBILE_ADS_UNIT_ID_BANNER_IOS} from '@env';
import { useTrackingStore } from "@store/trackingStore.ts";

type AdmobBannerProps = {
  style?: ViewStyle;
  requestNonPersonalizedAdsOnly?: boolean; // 명시적으로 설정하지 않으면 추적 권한 상태에 따라 자동 결정
};

const UNIT_ID_BANNER = 
__DEV__ ? 
TestIds.BANNER : 
Platform.select({ android: GOOGLE_MOBILE_ADS_UNIT_ID_BANNER_ANDROID, ios: GOOGLE_MOBILE_ADS_UNIT_ID_BANNER_IOS }) || TestIds.BANNER;


export function AdmobBanner({
  style,
  requestNonPersonalizedAdsOnly,
}: AdmobBannerProps) {
  const { isTrackingAuthorized } = useTrackingStore();
  const bannerUnitId = UNIT_ID_BANNER;
  
  // 추적 권한이 허용되지 않았거나 명시적으로 비개인화 광고를 요청한 경우
  const shouldRequestNonPersonalizedAds = requestNonPersonalizedAdsOnly !== undefined 
    ? requestNonPersonalizedAdsOnly 
    : !isTrackingAuthorized;
  
  return (
    <View style={[{ alignItems: "center", justifyContent: "center", width: "100%" ,height: 60}, style]}>
      <BannerAd
        unitId={bannerUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: shouldRequestNonPersonalizedAds }}
      />
    </View>
  );
}

export default AdmobBanner;


