import {PiodexScreen} from "@domain/App/Piodex";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DetailScreen } from "@domain/App/Piodex/Detail";
import { DetailProcessingScreen } from "@domain/App/Piodex/Detail/DetailProcessing";

import { found_plants_columns } from '@libs/supabase/operations/foundPlants/type.ts';
const Stack = createNativeStackNavigator<PiodexStackParamList>();
export type PiodexStackParamList = {
  Piodex:undefined,
  Detail:{
    plant : found_plants_columns,
    image_url: string | null,
    isPreviousScreenDictionary:boolean
  },
  DetailProcessing:{
    plant:found_plants_columns ,
    image_url: string | null,
  }
}

export const PiodexStack = () => {
  return (
    <Stack.Navigator >
      <Stack.Screen name="Piodex" component={PiodexScreen} options={{headerShown:false}}/>
      <Stack.Screen name="Detail" component={DetailScreen} options={{headerShown:false}}/>
      <Stack.Screen name="DetailProcessing" component={DetailProcessingScreen} options={{headerShown:false}}/>
    </Stack.Navigator>
  );
};