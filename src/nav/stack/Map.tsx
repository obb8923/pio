import {MapScreen} from "../../screens/App/Map";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<MapStackParamList>();
export type MapStackParamList = {
  Map:undefined,
}

export const MapStack = () => {
  return (
    <Stack.Navigator >
            <Stack.Screen name="Map" component={MapScreen} options={{headerShown:false}}/>
           </Stack.Navigator>
  );
};