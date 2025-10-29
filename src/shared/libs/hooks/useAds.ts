import { useInterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { useEffect } from 'react';
import { useTrackingStore } from '@store/trackingStore.ts';
import { GOOGLE_MOBILE_ADS_UNIT_ID_INTERSTITIAL_ANDROID ,GOOGLE_MOBILE_ADS_UNIT_ID_INTERSTITIAL_IOS} from '@env';
import { Platform } from 'react-native';

const UNIT_ID_BANNER = 
__DEV__ ? 
TestIds.BANNER : 
Platform.select({ android: GOOGLE_MOBILE_ADS_UNIT_ID_INTERSTITIAL_ANDROID, ios: GOOGLE_MOBILE_ADS_UNIT_ID_INTERSTITIAL_IOS }) || TestIds.BANNER;

export const useAds = () => {
  const { isTrackingAuthorized } = useTrackingStore();
  const { isLoaded, isClosed, load, show } = useInterstitialAd(UNIT_ID_BANNER, {
    requestNonPersonalizedAdsOnly: !isTrackingAuthorized
  });
  
  useEffect(() => {
    load();
  }, [load]);
  
  return { 
    isLoaded, 
    isClosed, 
    show,
    isTrackingAuthorized,
    isPersonalizedAdsEnabled: isTrackingAuthorized
  };
};