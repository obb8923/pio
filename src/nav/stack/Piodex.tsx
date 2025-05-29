import {PiodexScreen} from "../../screens/App/Piodex";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DetailScreen } from "../../screens/App/Piodex/Detail";
import { FoundPlant } from "../../screens/App/Piodex";
const Stack = createNativeStackNavigator<PiodexStackParamList>();
export type PiodexStackParamList = {
  Piodex:undefined,
  Detail:FoundPlant,
}

export const PiodexStack = () => {
  return (
    <Stack.Navigator >
      <Stack.Screen name="Piodex" component={PiodexScreen} options={{headerShown:false}}/>
      <Stack.Screen name="Detail" component={DetailScreen} options={{title:'식물 상세정보'}}/>
    </Stack.Navigator>
  );
};