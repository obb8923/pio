import {
    BottomTabNavigationOptions,
    createBottomTabNavigator,
  } from '@react-navigation/bottom-tabs';
import {MapStack} from '@nav/stack/Map.tsx';
import {PiodexStack} from '@nav/stack/Piodex.tsx';
import {ProfileStack} from '@nav/stack/Profile.tsx';
import MapIcon from '@assets/svgs/Map.svg';
import PiodexIcon from '@assets/svgs/Piodex.svg';
import ProfileIcon from '@assets/svgs/Profile.svg';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import {Colors} from '@constants/Colors.ts';
import {TabNavOptions, TabBarStyle,TabBarStyleNone} from '@constants/TabNavOptions.ts';
const Tab = createBottomTabNavigator();
const AppTab = () => {
  return (
<Tab.Navigator 
screenOptions={TabNavOptions as BottomTabNavigationOptions}>
  <Tab.Screen
    name="MapStack"
        component={MapStack}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Map';
          return {
          tabBarLabel: '지도',
          tabBarIcon: ({focused}) =>
            focused ? (
              <MapIcon style={{color: Colors.greenActive}} />
            ) : (
              <MapIcon style={{color: Colors.greenInactive}} />
            ),
          tabBarStyle: routeName === 'Map' ? TabBarStyle : TabBarStyleNone
          
          }
    }}
  />
  <Tab.Screen
    name="PiodexStack"
        component={PiodexStack}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Piodex';
          return {
            tabBarLabel: '기록',
            tabBarIcon: ({focused}) =>
              focused ? (
                <PiodexIcon style={{color: Colors.greenActive}} />
              ) : (
                <PiodexIcon style={{color: Colors.greenInactive}} />
              ),
              tabBarStyle: routeName === 'Piodex' ? TabBarStyle : TabBarStyleNone

          }
        }}
  />
  <Tab.Screen
    name="ProfileStack"
        component={ProfileStack}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Profile';
          return {
          tabBarLabel: '프로필',
          tabBarIcon: ({focused}) =>
            focused ? (
              <ProfileIcon style={{color: Colors.greenActive}} />
            ) : (
              <ProfileIcon style={{color: Colors.greenInactive}} />
            ),
            tabBarStyle: routeName === 'Profile' ? TabBarStyle : TabBarStyleNone
          }
    }}
  />
   </Tab.Navigator>
  );
};

export default AppTab;



