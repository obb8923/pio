import {Platform} from 'react-native';
import { Colors } from './Colors';
const isIOS = Platform.OS === 'ios';

// 탭바 높이 상수 export
export const TAB_BAR_HEIGHT = isIOS ? 88 : 78;

export const TabBarStyle = {
  borderTopColor: 'transparent',
  backgroundColor: Colors.greenTab,
  height: TAB_BAR_HEIGHT,
  padding: 10,
  display: 'flex' as const,
  elevation: 0,
  position: 'absolute' as const,
}
export const TabBarStyleNone = {  display: 'none' as const}
export const TabNavOptions = {
    headerShown: false,
    tabBarStyle: TabBarStyle,
    tabBarItemStyle: {flex: 1 ,height:78,padding:0,backgroundColor:'trandparent'},
    tabBarIconStyle: {flex: 1},
    tabBarLabelStyle: {
      flex: 1,
      fontSize: 11,
      fontFamily: 'Pretendard-Regular',
      lineHeight: 16.5,
      letterSpacing: -0.275,
    },
    tabBarActiveTintColor: Colors.greenActive,
    tabBarInactiveTintColor: Colors.greenInactive,
  };
  