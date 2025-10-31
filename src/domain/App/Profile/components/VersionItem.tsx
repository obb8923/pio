import {useState,useEffect} from 'react'
import { View,Text,TouchableOpacity,Linking,Platform } from 'react-native';
import VersionCheck from 'react-native-version-check';
import {Colors} from '@constants/Colors.ts'
import ArrowUpRight from "@assets/svgs/ArrowUpRight.svg";
import { IOS_APP_ID } from '@constants/normal';
export const VersionItem = () => {
    const [currentVersion, setCurrentVersion] = useState<string>('');
    const [needsUpdate, setNeedsUpdate] = useState<boolean>(false);
    const [storeUrl, setStoreUrl] = useState<string>('');
  
    useEffect(() => {
      const checkVersion = async () => {
        try {
          const version = await VersionCheck.getCurrentVersion();
          setCurrentVersion(version);
          if(__DEV__){
            console.log('version: ',version)
          }
          if(Platform.OS === 'ios'){
            if(!IOS_APP_ID){
              if(__DEV__) console.warn('Version check skipped: iOS appID is empty.');
              setNeedsUpdate(false);
              return;
            }
            // iOS: App Store 사용. appID 필수
            // @ts-ignore - setAppID is available in the library at runtime
            if(typeof (VersionCheck as any).setAppID === 'function'){
              (VersionCheck as any).setAppID(IOS_APP_ID);
            }
            const updateInfo = await VersionCheck.needUpdate({ provider: 'appStore' as any });
            setNeedsUpdate(updateInfo?.isNeeded ?? false);
            const url = updateInfo?.storeUrl || (await VersionCheck.getStoreUrl({ appID: IOS_APP_ID } as any));
            setStoreUrl(url);
          }else{
            // Android: Play Store 사용, packageName 기반 동작
            const updateInfo = await VersionCheck.needUpdate({ provider: 'playStore' as any });
            setNeedsUpdate(updateInfo?.isNeeded ?? false);
            const url = updateInfo?.storeUrl || (await VersionCheck.getStoreUrl());
            setStoreUrl(url);
          }
        } catch (error) {
          console.error('Version check failed:', error);
          setNeedsUpdate(false);
        }
      };
      checkVersion();
    }, []);
  
  
    return (
      <TouchableOpacity 
        className="flex-row justify-between items-center py-4 px-5 rounded-lg border-b border-greenTab" 
        onPress={()=>{
          if (needsUpdate && storeUrl) {
            Linking.openURL(storeUrl);
          }
        }}
      >
        <Text className="text-base text-greenTab">버전정보</Text>
        <View className="flex-row items-center">
          <Text className="text-base text-greenTab mr-2">v{currentVersion}</Text>
          <Text className="text-sm text-greenTab">
            {needsUpdate ? '업데이트하기' : '최신버전'}
          </Text>
          {needsUpdate && <ArrowUpRight style={{width: 10, height: 12, color: Colors.greenTab,marginLeft:10}}/>}
        </View>
      </TouchableOpacity>
    );
  };
  