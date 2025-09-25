import React from "react";
import { View, ViewStyle ,Platform} from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { GOOGLE_MOBILE_ADS_UNIT_ID_BANNER_ANDROID ,GOOGLE_MOBILE_ADS_UNIT_ID_BANNER_IOS} from '@env';

type AdmobBannerProps = {
  style?: ViewStyle;
  requestNonPersonalizedAdsOnly?: boolean;
};

const UNIT_ID_BANNER = __DEV__ ? TestIds.BANNER : Platform.select({ android: GOOGLE_MOBILE_ADS_UNIT_ID_BANNER_ANDROID, ios: GOOGLE_MOBILE_ADS_UNIT_ID_BANNER_IOS }) || TestIds.BANNER;


export function AdmobBanner({
  style,
  requestNonPersonalizedAdsOnly = true,
}: AdmobBannerProps) {
  const bannerUnitId = UNIT_ID_BANNER;
  return (
    <View style={[{ alignItems: "center", justifyContent: "center", width: "100%" ,height: 'auto'}, style]}>
      <BannerAd
        unitId={bannerUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly }}
      />
    </View>
  );
}

export default AdmobBanner;


