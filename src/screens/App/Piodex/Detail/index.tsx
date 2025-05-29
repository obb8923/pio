import { View,Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput } from "react-native"
import { Background } from "../../../../components/Background"
import { FoundPlant } from ".."
import { useRoute } from "@react-navigation/native"
import { NaverMapView,NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map"
import { BlurView } from "@react-native-community/blur";

export const DetailScreen = ()=>{
    const route = useRoute();
    const {id,image_url,signed_url,plant_name,description,memo,lat,lng} = route.params as FoundPlant   
    return (
        <Background>
             <BlurView
        style={{width:100,height:100}}
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
        <ScrollView className="flex-1 p-4">
          {/* 사진 영역 - 중앙정렬, 정사각형, 둥근 모서리 */}
          <View className="items-center mb-6">
            <Image
              source={{ uri: signed_url }}
              className="w-64 h-64 rounded-2xl"
              resizeMode="cover"
            />
          </View>
          
          {/* 식물 이름 영역 */}
            <Text className="text-center text-xl font-bold text-gray-800 mb-2">
              {plant_name?plant_name:'알 수 없는 식물'}
            </Text>
           
  
          {/* 설명 영역 */}
            <Text className="text-gray-600 leading-5">
                {description}
            </Text>
  
          {/* 메모 영역 */}
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              {memo}    
            </Text>
                {/* 지도 영역 */}
                <View className="w-full h-64">

                  <NaverMapView
                    style={{ width: '100%', height: '100%' }}
                    initialCamera={{
                      latitude: lat,
                      longitude: lng,
                      zoom: 15,
                    }}
                  ><NaverMapMarkerOverlay
                  latitude={lat}
                  longitude={lng}
                  image={require('../../../../../assets/pngs/flowers/flower1.png')}
                  width={32}
                  height={32}
                
                  />
                    </NaverMapView>  
                    </View>

        
        </ScrollView>
      </Background>
    )
}