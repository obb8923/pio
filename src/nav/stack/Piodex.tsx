import {PiodexScreen} from "../../screens/App/Piodex";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<PiodexStackParamList>();
export type PiodexStackParamList = {
  Piodex:undefined,
}

export const PiodexStack = () => {
  return (
    <Stack.Navigator >
            <Stack.Screen name="Piodex" component={PiodexScreen} options={{headerShown:false}}/>
           </Stack.Navigator>
  );
};