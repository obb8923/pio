import { Skeleton } from "@/shared/components/Skeleton";
import { View,Image } from "react-native";
export const ImageItem = ({signedUrl, isLoadingImages,width}: {signedUrl: string | null, isLoadingImages: boolean, width: number}) => {
  return (
    <View 
    className="overflow-hidden bg-gray-100" 
    style={{width,height:width,borderRadius:20,overflow:'hidden'}}>
                  {!signedUrl && isLoadingImages ? (
                    <Skeleton width={width} height={width} />
                  ) : signedUrl ? (
                    <>
                    <Image
                      source={{ uri: signedUrl }}
                      className="w-full h-full"
                      style={{ backgroundColor: 'transparent' }}
                      resizeMode="cover"
                    />
                    <View className="w-full h-full absolute top-0 left-0 right-0 bottom-0"
                    style={{
                      borderRadius: 20,
                      boxShadow: 'inset 0 0 10px 0 rgba(0, 0, 0, 0.6)',
                    }}
                    />
                    </>
                  ) : null}
                </View>
  )
}