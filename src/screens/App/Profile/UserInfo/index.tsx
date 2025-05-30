import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Background } from "../../../../components/Background"
import { useState } from "react"
import { signOut, requestAccountDeletion } from "../../../../libs/supabase/supabaseOperations"
import { useAuthStore } from "../../../../store/authStore"
import { useNavigation } from "@react-navigation/native"

export const UserInfoScreen = () => {
    const [nickname, setNickname] = useState("빛나는아스파라거스6")
    const [email, setEmail] = useState("ob*****@gmail.com")
    const [gender, setGender] = useState("남성")
    const [ageRange, setAgeRange] = useState("20~29")
    const { logout } = useAuthStore()
    const navigation = useNavigation()

    const handleLogout = async () => {
        Alert.alert(
            "로그아웃",
            "정말 로그아웃 하시겠습니까?",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                {
                    text: "로그아웃",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const result = await signOut()
                            if (result.success) {
                                logout() // 로컬 상태 업데이트
                                Alert.alert("성공", "로그아웃되었습니다.", [
                                    {
                                        text: "확인",
                                        onPress: () => navigation.goBack()
                                    }
                                ])
                            } else {
                                Alert.alert("오류", "로그아웃 중 오류가 발생했습니다.")
                            }
                        } catch (error) {
                            Alert.alert("오류", "로그아웃 중 오류가 발생했습니다.")
                        }
                    }
                }
            ]
        )
    }

    const handleAccountDeletion = async () => {
        Alert.alert(
            "회원탈퇴",
            "정말 회원탈퇴 하시겠습니까?\n이 작업은 되돌릴 수 없습니다.",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                {
                    text: "탈퇴하기",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const result = await requestAccountDeletion()
                            if (result.success) {
                                logout() // 로컬 상태 업데이트
                                Alert.alert("완료", "회원탈퇴가 완료되었습니다.")
                            } else {
                                Alert.alert("오류", result.error?.message || "회원탈퇴 중 오류가 발생했습니다.")
                            }
                        } catch (error) {
                            Alert.alert("오류", "회원탈퇴 중 오류가 발생했습니다.")
                        }
                    }
                }
            ]
        )
    }

    const TextInput = ({label,value}:{label:string,value:string})=>{return (
    <View className="my-2">
        <Text className="text-sm text-gray-600 mb-2">{label}</Text>
        <View className="bg-white rounded-lg border border-gray-200 px-4 py-3">
            <Text className="text-base text-black">{value}</Text>
        </View>
    </View>
    )}
    return (
        <Background>
                <ScrollView className="flex-1">
                    <View className="p-4">
                        <TextInput label="닉네임" value={nickname}/>
                        <TextInput label="이메일" value={email}/>
                        <TextInput label="성별" value={gender}/>
                        <TextInput label="연령대" value={ageRange}/>
                        <View className="w-full flex-row justify-end mt-2">
                            <TouchableOpacity>
                                <Text className="text-blue-600">수정하기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View className="h-3 bg-gray-300"/>
                    {/* 로그아웃 버튼 */}
                    <View className="p-4 flex-row justify-between">
                        <Text className="text-sm text-gray-500">
                            로그아웃 하시겠습니까?
                        </Text>
                        <TouchableOpacity onPress={handleLogout}>
                            <Text className="text-sm text-blue-600 underline">로그아웃</Text>
                        </TouchableOpacity>
                    </View>
                    {/* 회원탈퇴 버튼 */}
                    <View className="p-4 flex-row justify-between">
                        <Text className="text-sm text-gray-500">
                            리드로그 서비스를 더 이상 사용하지 않으시나요?
                        </Text>
                        <TouchableOpacity onPress={handleAccountDeletion}>
                            <Text className="text-sm text-blue-600 underline">회원탈퇴하기</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
        </Background>
    )
}
