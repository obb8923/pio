import {useState,useEffect} from 'react'
import { View,Text,TouchableOpacity,Linking } from 'react-native';
import VersionCheck from 'react-native-version-check';
import {Colors} from '../../../../constants/Colors'
import ArrowUpRight from "../../../../../assets/svgs/ArrowUpRight.svg";

export const VersionItem = () => {
    const [currentVersion, setCurrentVersion] = useState<string>('');
    const [needsUpdate, setNeedsUpdate] = useState<boolean>(false);
    const [storeUrl, setStoreUrl] = useState<string>('');
  
    useEffect(() => {
      const checkVersion = async () => {
        try {
          const version = await VersionCheck.getCurrentVersion();
          setCurrentVersion(version);
  
          console.log(version,"##")
          const updateInfo = await VersionCheck.needUpdate({ provider: 'playStore' });
          setNeedsUpdate(updateInfo?.isNeeded ?? false);
          const url = await VersionCheck.getStoreUrl({ provider: 'playStore' });
          setStoreUrl(url);
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
  