import { useState } from "react"
import { View, Text, ScrollView, Platform ,Image, TouchableOpacity} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import ImageX from '@assets/svgs/ImageX.svg'
import {Colors} from "@constants/Colors"
import { BlurView } from "@shared/components/BlurView"
import { plantTypeImages } from "@domain/App/Map/constants/images"
import { PlantTypeCode, PlantTypeMap } from "@libs/supabase/operations/foundPlants/type"
import { Line } from "@components/Line"
import { NaverMapView, NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map"

type PlantDetailProps = {
    type : "imageProcessing" | "detail" | "detailProcessing";
    image_url?: string | null;
    plant_name: string;
    type_code: PlantTypeCode;
    description?: string;
    activity_curve?: number[];
    lat?: number;
    lng?: number;
    memo?: string;
    onOpenModal?: (modalType: 'map' | 'memo' | 'reviewRequest') => void;
    isLocationSelected?: boolean;
    isPreviousScreenDictionary?: boolean;
}

export const PlantDetail = ({type = "detail",image_url, plant_name, type_code, description, activity_curve, memo, lat, lng, onOpenModal, isLocationSelected, isPreviousScreenDictionary}: PlantDetailProps) => {
  const insets = useSafeAreaInsets();
  const [curveWidth, setCurveWidth] = useState<number>(200);
  return (
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
           {image_url===null? (
           <View className="w-full h-full bg-gray-100 justify-center items-center opacity-50" >
             <ImageX width="36" height="36" style={{color:Colors.greenTab900}}/>
           </View>
         ) : (
           <>
             <Image
               source={{ uri: image_url as string }}
               className="w-full h-full"
               resizeMode="cover"
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
         <Text className="text-center text-md ml-2">{PlantTypeMap[type_code]}</Text>
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
       {!isPreviousScreenDictionary && (
        <>
       <View className="w-full p-4 border-b border-gray-300 border-1 ">
           <Text className="w-full text-gray-600 text-sm mb-2">발견한 위치{isPreviousScreenDictionary}</Text>
           {type === "imageProcessing" && (
           <View className="bg-gray-100 pl-4 rounded-full flex-row justify-between items-center">
              <View className="h-full w-auto py-4">
                <Text className="text-greenTab text-center font-medium">
                  {isLocationSelected ? "위치가 선택되었습니다" : "발견한 곳을 선택해 주세요"}
                </Text>
              </View>
              <TouchableOpacity 
                className="p-4 bg-greenTab rounded-full justify-center items-center"
                onPress={() => onOpenModal?.('map')}
              >
                <Text className="text-greenActive text-center font-medium">
                  {isLocationSelected ? "수정하기" : "선택하기"}
                </Text>
              </TouchableOpacity>
            </View>
            )}
           {lat && lng && type === "detail" && (
           <View className=" w-full h-72 rounded-3xl overflow-hidden">
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
           )}
       </View>
       
         {/* 메모 영역 */}
         <View className="w-full p-4" onTouchEnd={() => onOpenModal?.('memo')}>
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
         </>
         )}

      </View>
      </View>
    </ScrollView> 
  )
}