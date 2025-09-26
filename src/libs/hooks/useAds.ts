import { useInterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { useEffect } from 'react';
import { useTrackingStore } from '../../store/trackingStore';

export const useAds = () => {
  const { isTrackingAuthorized } = useTrackingStore();
  const { isLoaded, isClosed, load, show } = useInterstitialAd(TestIds.INTERSTITIAL, {
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