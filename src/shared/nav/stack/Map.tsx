import {MapScreen} from "@domain/App/Map";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ImageProcessingScreen } from "@domain/App/Map/ImageProcessing";

const Stack = createNativeStackNavigator<MapStackParamList>();
export type MapStackParamList = {
  Map:undefined,
  ImageProcessing:{imageUri: string;}
}

export const MapStack = () => {
  return (
    <Stack.Navigator 
    screenOptions={{headerShown:false}}
    initialRouteName="Map">
            <Stack.Screen name="Map" component={MapScreen}/>
            <Stack.Screen name="ImageProcessing" component={ImageProcessingScreen}/>
           </Stack.Navigator>
  );
};