import {Platform} from 'react-native';

const isIOS = Platform.OS === 'ios';

// 탭바 높이 상수 export
export const TAB_BAR_HEIGHT = isIOS ? 100 : 78;

export const TabNavOptions0 = {
  headerShown: false,
  tabBarStyle: {
    borderTopColor: 'transparent',
    backgroundColor: '#36384E',
    height: TAB_BAR_HEIGHT,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    position: 'absolute',
  },
  tabBarItemStyle: {flex: 1},
  tabBarIconStyle: {flex: 1},
  tabBarLabelStyle: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'WantedSans-Regular',
    lineHeight: 16.5,
    letterSpacing: -0.275,
  },
  tabBarActiveTintColor: '#fafafa',
  tabBarInactiveTintColor: '#585a6c',
};
export const TabBarStyle = {
  borderTopColor: 'transparent',
  backgroundColor: '#1C8597',
  height: TAB_BAR_HEIGHT,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  padding: 10,
  display: 'flex' as const,
  elevation: 0,
  position: 'absolute' as const,
}
export const TabBarStyleNone = {  display: 'none' as const}
export const TabNavOptions = {
    headerShown: false,
    tabBarStyle: TabBarStyle,
    tabBarItemStyle: {flex: 1},
    tabBarIconStyle: {flex: 1},
    tabBarLabelStyle: {
      flex: 1,
      fontSize: 11,
      fontFamily: 'Pretendard-Regular',
      lineHeight: 16.5,
      letterSpacing: -0.275,
    },
    tabBarActiveTintColor: '#ADFDAD',
    tabBarInactiveTintColor: '#6AE3D0',
  };
  