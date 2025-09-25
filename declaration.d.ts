declare module '*.svg' {
    const content: any;
    export default content;
  }
  
declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
  export const AI_API_KEY: string;
  export const SUPABASE_REF: string;
  export const SUPABASE_WEB_CLIENT_KEY: string;
  export const SUPABASE_IOS_CLIENT_KEY: string;
  export const GOOGLE_MOBILE_ADS_UNIT_ID_BANNER_ANDROID: string;
  export const GOOGLE_MOBILE_ADS_UNIT_ID_BANNER_IOS: string;
  export const GOOGLE_MOBILE_ADS_UNIT_ID_INTERSTITIAL_ANDROID: string;
  export const GOOGLE_MOBILE_ADS_UNIT_ID_INTERSTITIAL_IOS: string;
  export const GOOGLE_MOBILE_ADS_UNIT_ID_NATIVE_AD_ANDROID: string;
  export const GOOGLE_MOBILE_ADS_UNIT_ID_NATIVE_AD_IOS: string;
}

declare module 'react-native-google-mobile-ads' {
  export const TestIds: any;
  export const BannerAd: any;
  export const BannerAdSize: any;
  export const NativeAdView: any;
  export const HeadlineView: any;
  export const TaglineView: any;
  export const AdvertiserView: any;
  export const StarRatingView: any;
  export const IconView: any;
  export const MediaView: any;
  export const CallToActionView: any;
  export const AdBadge: any;
  export const ImageView: any;
  export const useInterstitialAd: any;
}
  