import { useState ,useEffect} from "react"
import { View, Text, ScrollView, Platform ,Image } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, { SlideInUp, Keyframe } from 'react-native-reanimated'
import ImageX from '@assets/svgs/ImageX.svg'
import {Colors} from "@constants/Colors"
import { BlurView } from "@components/BlurView"
import { plantTypeImages } from "@domain/App/Map/constants/images"
import { PlantTypeCode, PlantTypeMap } from "@libs/supabase/operations/foundPlants/type"
import { type ResponseCode } from "@libs/utils/AI"
import { Line } from "@components/Line"
import { NaverMapView, NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map"
import { Memo } from "@components/PlantDetail/Memo"
import { MapModalButton } from "@components/PlantDetail/MapModalButton"
import { Divider } from "@components/Divider"
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
    isAILoading?: boolean;
    AIResponseCode?: ResponseCode | null;
}

export const PlantDetail = ({type = "detail",image_url, plant_name, type_code, description, activity_curve, memo, lat, lng, onOpenModal, isLocationSelected, isPreviousScreenDictionary, isAILoading, AIResponseCode}: PlantDetailProps) => {
  const insets = useSafeAreaInsets();
  const [curveWidth, setCurveWidth] = useState<number>(200);
  const isLoading = !!isAILoading;
  const hasError = !!AIResponseCode && AIResponseCode !== 'success';
  const nameTypeEntering = new Keyframe({
    0: { transform: [{ translateY: 24 }], opacity: 0 },
    100: { transform: [{ translateY: 0 }], opacity: 1 },
  }).duration(320);
  const errorMessage = (() => {
    if (!hasError) return undefined;
    switch (AIResponseCode) {
      case 'not_plant':
        return '식물이 아닌 것 같아요. 다른 사진으로 시도해 주세요.';
      case 'low_confidence':
        return '식물을 구별하지 못했어요. 다른 각도의 사진으로 다시 시도해주세요.';
      case 'error':
      default:
        return '분석 중 오류가 발생했어요. 다시 시도해 주세요.';
    }
  })();
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
            {/* 상태 오버레이 */}
            {(isLoading || hasError) && (
              <View className="absolute top-0 left-0 right-0 bottom-0 w-full h-full justify-center items-center" style={{backgroundColor:'rgba(0,0,0,0.35)'}}>
                <Text className="text-white text-base font-semibold">
                  {isLoading ? '분석 중...' : (errorMessage as string)}
                </Text>
              </View>
            )}
             </>
         )}
           </View>
         
         </View>
          {/* 식물 이름 ,종류 영역 */}
          
          <View>
       <View className="px-0 flex-row justify-between items-center absolute top-[-52px] left-0 right-0 w-full">
         {/* 이름/종류 영역: 로딩/에러 시 숨김, 성공 시 아래에서 애니메이션 등장 */}
        {!isLoading && !hasError && (
          <Animated.View entering={nameTypeEntering} style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
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
           </Animated.View>
         )}
       </View>
       </View>
    {/* 식물 정보 영역 */}
    <View className="w-full py-8 items-center">
       {/* 설명 영역 */}
       <Text className="text-gray-900 min-h-[90px] p-4 rounded-lg overflow-y-scroll">
          {hasError ? (errorMessage as string) : (isLoading ? 'AI가 사진을 분석하고 있어요...' : (description ? description : '설명이 없습니다.'))}
         </Text>

         <Divider/>

        {/* 활동 곡선 영역 */}
        {!hasError && !isLoading && (
          <View className="w-full items-center p-4">
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
        )}

      <Divider/>

     
      {/* 지도 영역 */}
      {!isPreviousScreenDictionary && !hasError && !isLoading && (
        <>
          <View className="w-full p-4">
            <Text className="w-full text-gray-600 text-sm mb-2">발견한 위치{isPreviousScreenDictionary}</Text>
            {type === "imageProcessing" && (
              <MapModalButton isLocationSelected={isLocationSelected ?? false} onOpenModal={onOpenModal as (modalType: 'map' | 'memo' | 'reviewRequest') => void} />
            )}
            {lat && lng && type === "detail" && (
              
              <View className=" w-full h-72 overflow-hidden" style={{borderRadius:20}}>
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
                <View 
                  pointerEvents="none"
                  style={{width:'100%',height:'100%',borderRadius:20,position:'absolute',top:0,left:0,right:0,bottom:0,
                    boxShadow: [{
                      inset: true,
                      offsetX: 0,
                      offsetY: 0,
                      blurRadius: 20,
                      spreadDistance: 0,
                      color: "rgba(0, 0, 0, 0.3)",
                    },]
                    }}
                  />
              </View>
              
            )}
          </View>
          <Divider/>

          {/* 메모 영역 */}
          <View className="w-full p-4" onTouchEnd={() => onOpenModal?.('memo')}>
            <Memo content={memo ?? null} type="button" />
          </View>
        </>
      )}

      </View>
      </View>
    </ScrollView> 
  )
}