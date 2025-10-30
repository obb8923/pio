import { View,Text, ScrollView, Image, Platform } from "react-native"
import { useRoute } from "@react-navigation/native"
import { NaverMapView,NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map"
import { CustomButton } from "@components/CustomButton"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { PiodexStackParamList } from "@nav/stack/Piodex"
import { Background } from "@components/Background"
import { found_plants_columns } from "@libs/supabase/operations/foundPlants/type"
import {Line} from "@components/Line"
import { plantTypeImages } from "@domain/App/Map/constants/images"
import { PlantTypeMap } from "@libs/supabase/operations/foundPlants/type"
import { useState } from "react"
import ImageX from '@assets/svgs/ImageX.svg'
import {Colors} from "@constants/Colors"
import { BlurView } from "@shared/components/BlurView"
import { useSafeAreaInsets } from "react-native-safe-area-context"
type DetailScreenProps = NativeStackScreenProps<PiodexStackParamList,'Detail'>

export const DetailScreen = ({navigation}:DetailScreenProps)=>{
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const {plant,image_url,isPreviousScreenDictionary} = route.params as {plant:found_plants_columns,image_url:string,isPreviousScreenDictionary:boolean}   
    const [imageError, setImageError] = useState(false);
    const [curveWidth, setCurveWidth] = useState<number>(200);
    const {id,plant_name,description,memo,lat,lng,type_code,activity_curve,activity_notes} = plant

    return (
      <Background isStatusBarGap={false} isTabBarGap={false} style={{alignItems:'center'}}>
        <ScrollView 
         className="flex-1 px-4 rounded-3xl" 
         showsVerticalScrollIndicator={false} 
         contentContainerStyle={{ 
          paddingTop: insets.top + 16,
          paddingBottom: Platform.OS === "ios" ? 120 : 400 ,
          alignItems:'center',

          }}>
            {/* 전체 컨테이너 */}
            <View 
            className=" bg-white p-4 w-full"
            style={{borderTopLeftRadius:96,borderTopRightRadius:96,borderBottomLeftRadius:20,borderBottomRightRadius:20,
             
            }}
            >
              
            {/* 사진 영역 */}
            <View 
            className="items-center w-full h-80"
            style={{borderTopLeftRadius:80,borderTopRightRadius:80,borderBottomLeftRadius:20,borderBottomRightRadius:20,overflow:'hidden'}}

            >
                <View 
                className="overflow-hidden w-full h-full"
                style={{borderTopLeftRadius:72,borderTopRightRadius:72,borderBottomLeftRadius:20,borderBottomRightRadius:20,overflow:'hidden'}}
                >
                {imageError ? (
                <View className="w-full h-full bg-gray-100 justify-center items-center opacity-50" >
                  <ImageX width="36" height="36" style={{color:Colors.greenTab900}}/>
                </View>
              ) : (
                <>
                  <Image
                    source={{ uri: image_url }}
                    className="w-full h-full"
                    resizeMode="cover"
                    onError={() => setImageError(true)}
                  />                 
                   <View className="w-full h-full absolute top-0 left-0 right-0 bottom-0"
                  style={{ 
                    borderRadius: 76,
                    boxShadow: [
                      {
                        inset: true,
                        offsetX: 0,
                        offsetY: 0,
                        blurRadius: 30,
                        spreadDistance: 0,
                        color: "rgba(0, 0, 0, 0.6)",
                      },
                    ],
                  }}
                  />
                  </>
              )}
                </View>
              
              </View>
               {/* 식물 이름 ,종류 영역 */}
               
               <View>
            <View className="px-0 flex-row justify-between items-center absolute top-[-52px] left-0 right-0 w-full">
              {/* 이름 */}
              
              <BlurView style={{borderWidth:6,borderColor: Colors.white,borderRadius:10000,maxWidth:'70%',minWidth:'35%',
                boxShadow: [
                  {
                    offsetX: 0,
                    offsetY: 0,
                    blurRadius: 17,
                    spreadDistance: 0,
                    color: "rgba(0, 0, 0, 0.3)",
                  },
                ],
              }} innerStyle={{borderRadius:20}}>
              <View className="px-6 py-4">
              <Text className="text-center text-xl font-bold overflow-scroll" numberOfLines={1} >
              {plant_name}
              </Text>
              </View>
              </BlurView>

               {/* 식물 종류 영역 */}
               <BlurView style={{borderWidth:6,borderColor: Colors.white,borderRadius:10000,boxShadow: [
                  {
                    offsetX: 0,
                    offsetY: 0,
                    blurRadius: 17,
                    spreadDistance: 0,
                    color: "rgba(0, 0, 0, 0.3)",
                  },
                ],}} innerStyle={{borderRadius:20}}>
               <View className="justify-center items-center px-6 py-4 flex-row">
              <Image source={plantTypeImages[type_code ?? 0]} style={{width:24,height:24}}/>
              <Text className="text-center text-md ml-2">{PlantTypeMap[type_code ?? 0]}</Text>
              </View>
              </BlurView>
            </View>
            </View>
         {/* 식물 정보 영역 */}
         <View className="w-full py-8 items-center">
            {/* 설명 영역 */}
            <Text className="border-b border-gray-300 border-1 text-gray-900 min-h-[90px] max-h-[140px] p-4 rounded-lg overflow-y-scroll">
                {description?description:'설명이 없습니다.'}
              </Text>
     
              {/* 활동 곡선 영역 */}
              <View className="w-full items-center p-4 border-b border-gray-300 border-1">
                <Text className="w-full text-gray-600 text-sm">식물의 활동 곡선</Text>
              <View 
                className="justify-center items-center mb-2" 
                style={{width: '90%'}} 
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setCurveWidth(width);
                }}
              >
                {curveWidth !== null && (
                  <Line data={activity_curve ?? []} width={curveWidth} height={100} />
                )}
              </View>
              </View>
           
            
          
             {/* 지도 영역 */}
             {lat && lng &&
            <View className="w-full h-72 p-4 border-b border-gray-300 border-1 ">
                <Text className="w-full text-gray-600 text-sm mb-2">발견한 위치</Text>
                <View className="flex-1 rounded-3xl overflow-hidden">
                <NaverMapView
                style={{ flex:1 }}
                initialCamera={{
                  latitude: lat,
                  longitude: lng,
                  zoom: 17,
                }}
                isShowZoomControls={true}
                isShowLocationButton={false}
              >
              <NaverMapMarkerOverlay
                latitude={lat}
                longitude={lng}
                image={plantTypeImages[type_code ?? 0]}
                width={32}
                height={32}
              />
              </NaverMapView>  
              </View>
            </View>
            }
              {/* 메모 영역 */}
              {!isPreviousScreenDictionary &&
              <View className="w-full p-4">
                {/* 메모 */}
                <View className="bg-[#FFDEA2] rounded-lg p-4 w-full">
                  {/* 메모 헤더 */}
                  <View className="w-full flex-row justify-between items-center mb-2">
                  <Text className="text-[#9D691D] text-sm font-bold">메모</Text>
                  </View>
                  {/* 메모 내용 */}
                  <Text
                    className="min-h-[90px] max-h-[140px] text-[#A2690F]"
                  >{memo?memo:'메모가 없습니다.'}</Text>
              </View>
              </View>
            }

           </View>
           </View>
         </ScrollView>  

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