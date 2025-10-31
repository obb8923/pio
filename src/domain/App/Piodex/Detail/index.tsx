import { View } from "react-native"
import { useRoute } from "@react-navigation/native"
import { CustomButton } from "@components/CustomButton"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { PiodexStackParamList } from "@nav/stack/Piodex"
import { Background } from "@components/Background"
import { found_plants_columns } from "@libs/supabase/operations/foundPlants/type"
import { PlantDetail } from "@components/PlantDetail"
type DetailScreenProps = NativeStackScreenProps<PiodexStackParamList,'Detail'>

export const DetailScreen = ({navigation}:DetailScreenProps)=>{
    const route = useRoute();
    const {plant,image_url,isPreviousScreenDictionary} = route.params as {plant:found_plants_columns,image_url:string,isPreviousScreenDictionary:boolean}   
    const {id,plant_name,description,memo,lat,lng,type_code,activity_curve,activity_notes} = plant

    return (
      <Background isStatusBarGap={false} isTabBarGap={false} style={{alignItems:'center'}}>
       <PlantDetail
       type="detail"
       image_url={image_url} 
       plant_name={plant_name as string} 
       type_code={type_code} 
       description={description as string} 
       activity_curve={activity_curve} 
       memo={memo as string} 
       lat={lat} 
       lng={lng}
       />

         {/* 확인 버튼 */}
         <View className="absolute bottom-10 left-0 right-0 flex-row justify-evenly items-center mt-4">
          {!isPreviousScreenDictionary && 
           <CustomButton text="수정" size={60} onPress={()=>navigation.navigate('DetailProcessing',{plant,image_url})}/> 
          }
          <CustomButton text="확인" size={70} onPress={()=>navigation.goBack()}/>
        </View>

    </Background>
    )
}