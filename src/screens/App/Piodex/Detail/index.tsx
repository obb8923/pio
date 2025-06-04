import { View,Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput } from "react-native"
import { Background } from "../../../../components/Background"
import { FoundPlant } from ".."
import { useRoute } from "@react-navigation/native"
import { NaverMapView,NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map"
import { Colors } from "../../../../constants/Colors"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { CustomButton } from "../../../../components/CustomButton"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { PiodexStackParamList } from "../../../../nav/stack/Piodex"
type DetailScreenProps = NativeStackScreenProps<PiodexStackParamList,'Detail'>
export const DetailScreen = ({navigation}:DetailScreenProps)=>{
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const {id,signed_url,plant_name,description,memo,lat,lng} = route.params as FoundPlant   
    return (
       <View className="flex-1">
       
       <Image source={require('../../../../../assets/pngs/BackgroundGreen.png')} className="w-full h-full absolute top-0 left-0 right-0 bottom-0"/>
       <ScrollView 
         className="flex-1 p-2 rounded-lg" 
         style={{paddingTop: insets.top}}
         contentContainerStyle={{ paddingBottom: 400 }}>
          
           {/* 사진 영역 */}
           <View className="items-center my-6 w-full h-72">
             <Image
               source={{ uri: signed_url }}
               className="w-full h-full rounded-lg"
               resizeMode="cover"
             />
           </View>
           {/* 식물 정보 영역 */}
           <View className="w-full h-full bg-white rounded-lg p-4">
           {/* 식물 이름 영역 */}
           <View className="mb-4 flex-row justify-center items-center">
             <Text
               className="rounded-lg p-3 text-center bg-white text-2xl"
             
             >{plant_name}</Text>
   
           </View>
   
           {/* 설명 영역 */}
             <View className="bg-gray-50 p-3 rounded-lg border border-gray-200">
               <Text
                 className="text-gray-600"
               >
               {description || '설명이 없습니다.'}
               </Text>
             </View>
           <View className="h-0.5 rounded-full bg-svggray3 my-8"/>
           {/* 메모 영역 */}
           <View className="mb-4">
             <Text
               className="border border-gray-300 rounded-lg p-3 bg-white min-h-20"
             >
               {memo || '메모가 없습니다.'}
             </Text>
           </View>      
             {/* 지도 영역 */}
             <View className="w-full h-64">

<NaverMapView
  style={{ width: '100%', height: '100%' }}
  initialCamera={{
    latitude: lat,
    longitude: lng,
    zoom: 17,
  }}
  isShowZoomControls={false}
  isShowLocationButton={false}
><NaverMapMarkerOverlay
latitude={lat}
longitude={lng}
image={require('../../../../../assets/pngs/flowers/flower1.png')}
width={16}
height={16}

/>
  </NaverMapView>  
  <View className="absolute top-2 left-4 flex-row justify-between items-center">
<Text className="text-lg font-bold text-greenTab">발견한 위치</Text>
</View>
  </View> 
           </View>
            
         
         </ScrollView>  
         <View className="absolute bottom-10 left-0 right-0 h-20 flex-row justify-center items-center">
        <CustomButton text="확인" size={60} onPress={()=>navigation.goBack()}/>
        </View>
         </View>
    )
}