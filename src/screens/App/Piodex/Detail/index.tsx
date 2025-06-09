import { View,Text, ScrollView, Image, Platform } from "react-native"
import { FoundPlant } from ".."
import { useRoute } from "@react-navigation/native"
import { NaverMapView,NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map"
import { Colors } from "../../../../constants/Colors"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { CustomButton } from "../../../../components/CustomButton"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { PiodexStackParamList } from "../../../../nav/stack/Piodex"
import { Background } from "../../../../components/Background"

type DetailScreenProps = NativeStackScreenProps<PiodexStackParamList,'Detail'>
export const DetailScreen = ({navigation}:DetailScreenProps)=>{
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const {id,signed_url,plant_name,description,memo,lat,lng} = route.params as FoundPlant   
    return (
      <Background isStatusBarGap={false} isTabBarGap={false}>
          {/* 사진 영역 */}
       <View className="absolute top-0 left-0 right-0 items-center mb-6 w-full h-80">
          <Image
            source={{ uri: signed_url }}
            className="w-full h-full rounded-3xl"
            resizeMode="cover"
          />
        </View>
        <ScrollView 
         className="flex-1 mt-4 pt-80 px-2 pb-2 rounded-lg " 
         showsVerticalScrollIndicator={false} 
         contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 400 }}>
         {/* 식물 정보 영역 */}
         <View className="w-full bg-white rounded-lg p-4">
            {/* 식물 이름 영역 */}
            <View className="mb-4 flex-row justify-center items-center">
              <Text
                className="rounded-lg p-3 text-center bg-white text-2xl"
              >{plant_name}</Text>
            </View>

            {/* 설명 영역 */}
              <Text
                className="text-gray-600 min-h-[90px] max-h-[140px] bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-y-scroll"               
              >{description?description:'설명이 없습니다.'}</Text>

            <View className="h-0.5 rounded-full bg-svggray3 my-8"/>

            {/* 메모 영역 */}
              <Text
                className="border border-gray-300 rounded-lg p-3 bg-white min-h-[90px] max-h-[140px] text-gray-600"
              >{memo?memo:'메모가 없습니다.'}</Text>


          
             {/* 지도 영역 */}
            <View className="w-full h-64 my-8">
              <NaverMapView
                style={{ width: '100%', height: '100%' }}
                initialCamera={{
                  latitude: lat,
                  longitude: lng,
                  zoom: 17,
                }}
                isShowZoomControls={true}
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

         {/* 확인 버튼 */}
        <View className="absolute bottom-10 left-0 right-0 h-20 flex-row justify-center items-center">
          <CustomButton text="확인" size={60} onPress={()=>navigation.goBack()}/>
        </View>

    </Background>
    )
}