import { useInterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { useEffect } from 'react';
export const useAds = () => {
  const { isLoaded, isClosed, load, show } = useInterstitialAd(TestIds.INTERSTITIAL);
  useEffect(() => {
    load();
  }, [load]);
  return { isLoaded, isClosed, show };
};