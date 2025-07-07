import {PiodexScreen} from "../../screens/App/Piodex";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DetailScreen } from "../../screens/App/Piodex/Detail";
import { found_plants_columns } from '../../libs/supabase/operations/foundPlants/type';
const Stack = createNativeStackNavigator<PiodexStackParamList>();
export type PiodexStackParamList = {
  Piodex:undefined,
  Detail:{
    plant : found_plants_columns,
    image_url: string | null
  },
}

export const PiodexStack = () => {
  return (
    <Stack.Navigator >
      <Stack.Screen name="Piodex" component={PiodexScreen} options={{headerShown:false}}/>
      <Stack.Screen name="Detail" component={DetailScreen} options={{headerShown:false}}/>
    </Stack.Navigator>
  );
};