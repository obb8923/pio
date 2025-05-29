import {
    BottomTabNavigationOptions,
    createBottomTabNavigator,
  } from '@react-navigation/bottom-tabs';
import {MapStack} from '../stack/Map';
import {PiodexStack} from '../stack/Piodex';
import {ProfileStack} from '../stack/Profile';

import MapIcon from '../../../assets/svgs/Map.svg';
import PiodexIcon from '../../../assets/svgs/Piodex.svg';
import ProfileIcon from '../../../assets/svgs/Profile.svg';

import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import {Colors} from '../../constants/Colors';
import {TabNavOptions} from '../../constants/TabNavOptions';
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
              <MapIcon style={{color: '#36384E'}} />
            ) : (
              <MapIcon style={{color: '#999999'}} />
            ),
          tabBarStyle: {
            display: routeName === 'Map' ? 'flex' : 'none'
          }
          }
    }}
  />
  <Tab.Screen
    name="PiodexStack"
        component={PiodexStack}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Piodex';
          return {
            tabBarLabel: '피오덱스',
            tabBarIcon: ({focused}) =>
              focused ? (
                <PiodexIcon style={{color: '#36384E'}} />
              ) : (
                <PiodexIcon style={{color: '#999999'}} />
              ),
              tabBarStyle: {
                display: routeName === 'Piodex' ? 'flex' : 'none'
              }
          }
        }}
  />
  <Tab.Screen
    name="ProfileStack"
        component={ProfileStack}
        options={({route}) => {
          return {
          tabBarLabel: '프로필',
          tabBarIcon: ({focused}) =>
            focused ? (
              <ProfileIcon style={{color: '#36384E'}} />
            ) : (
              <ProfileIcon style={{color: '#999999'}} />
            ),
          }
    }}
  />
   </Tab.Navigator>
  );
};

export default AppTab;



