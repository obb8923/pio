import {
    BottomTabNavigationOptions,
    createBottomTabNavigator,
  } from '@react-navigation/bottom-tabs';
import {MapStack} from '../stack/Map';
import {PiodexStack} from '../stack/Piodex';
import {ProfileStack} from '../stack/Profile';

import MapIcon from '../../../assets/svg/Map.svg';
import PiodexIcon from '../../../assets/svg/Piodex.svg';
import ProfileIcon from '../../../assets/svg/Profile.svg';

import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import {Colors} from '../../constants/Colors';

const Tab = createBottomTabNavigator();
const AppTab = () => {
  return (
<Tab.Navigator screenOptions={{headerShown:false}}>
  <Tab.Screen
    name="MapStack"
        component={MapStack}
        options={({route}) => {
          return {
          tabBarLabel: '지도',
          tabBarIcon: ({focused}) =>
            focused ? (
              <MapIcon style={{color: Colors.black}} />
            ) : (
              <MapIcon style={{color: '#dddddd'}} />
            ),
          }
    }}
  />
  <Tab.Screen
    name="PiodexStack"
        component={PiodexStack}
        options={({route}) => {
          return {
            tabBarLabel: '피오덱스',
            tabBarIcon: ({focused}) =>
              focused ? (
                <PiodexIcon style={{color: Colors.black}} />
              ) : (
                <PiodexIcon style={{color: '#dddddd'}} />
              ),
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
              <ProfileIcon style={{color: Colors.black}} />
            ) : (
              <ProfileIcon style={{color: '#dddddd'}} />
            ),
          }
    }}
  />
   </Tab.Navigator>
  );
};

export default AppTab;



