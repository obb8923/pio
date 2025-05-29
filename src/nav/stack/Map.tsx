import {MapScreen} from "../../screens/App/Map";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ImageProcessingScreen } from "../../screens/App/Map/ImageProcessing";

const Stack = createNativeStackNavigator<MapStackParamList>();
export type MapStackParamList = {
  Map:undefined,
  ImageProcessing:{imageUri: string;}
}

export const MapStack = () => {
  return (
    <Stack.Navigator >
            <Stack.Screen name="Map" component={MapScreen} options={{headerShown:false}}/>
            <Stack.Screen name="ImageProcessing" component={ImageProcessingScreen} options={{headerShown:false}}/>
           </Stack.Navigator>
  );
};