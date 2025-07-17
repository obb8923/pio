import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from "react-native"
import { Background } from "../../../../components/Background"
import { useState, useEffect } from "react"
import { signOut } from "../../../../libs/supabase/operations/auth/signOut"
import { requestAccountDeletion } from "../../../../libs/supabase/operations/users/requestAccountDeletion"
import { getUserInfo } from "../../../../libs/supabase/operations/users/getUserInfo"
import { updateUserInfo } from "../../../../libs/supabase/operations/users/updateUserInfo"
import { checkProfileUpdateAvailability } from "../../../../libs/supabase/operations/users/checkProfileUpdateAvailablilty"
import { useAuthStore } from "../../../../store/authStore"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ProfileStackParamList } from "../../../../nav/stack/Profile"
import DateTimePicker from '@react-native-community/datetimepicker'
import { Platform } from "react-native"
import { AppBar } from "../../../../components/AppBar"
import React from 'react'
type UserInfoScreenProps = NativeStackScreenProps<ProfileStackParamList,'UserInfo'>

const GENDER_OPTIONS = ["남성", "여성", "선택안함"] as const

const Label = ({ text }: { text: string }) => (
    <Text className="text-sm text-gray-600 mb-2 px-4">{text}</Text>
)

const convertGenderToBoolean = (gender: string): boolean | null => {
    if (gender === "남성") return true
    if (gender === "여성") return false
    return null
}

const convertBooleanToGender = (gender: boolean | null): string => {
    if (gender === true) return "남성"
    if (gender === false) return "여성"
    return "선택안함"
}

export const UserInfoScreen = ({navigation}:UserInfoScreenProps) => {
    const [name, setName] = useState("")
    const [nickname, setNickname] = useState("")
    const [email, setEmail] = useState("")
    const [gender, setGender] = useState("선택안함")
    const [birthDate, setBirthDate] = useState<Date | null>(null)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const { logout } = useAuthStore()

    useEffect(() => {
        fetchUserInfo()
    }, [])

    const fetchUserInfo = async () => {
        try {
            const userInfo = await getUserInfo()
            if (userInfo) {
                setName(userInfo.name || "")
                setNickname(userInfo.nickname || "")
                setEmail(userInfo.email || "")
                setGender(convertBooleanToGender(userInfo.gender))
                if (userInfo.birthDate) {
                    const date = new Date(userInfo.birthDate)
                    if (!isNaN(date.getTime())) {
                        setBirthDate(date)
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching user info:', error)
            Alert.alert("오류", "사용자 정보를 가져오는 중 오류가 발생했습니다.")
        }
    }

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false)
        if (selectedDate) {
            setBirthDate(selectedDate)
        }
    }

    const formatDate = (date: Date | null) => {
        if (!date) return "생년월일 선택하기"
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\. /g, '년 ').replace('.', '월 ') + '일'
    }

    const handleUpdate = async () => {
        const { canUpdate, nextUpdateDate } = await checkProfileUpdateAvailability();
        
        if (!canUpdate && nextUpdateDate) {
            const formattedDate = nextUpdateDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            Alert.alert(
                "수정 불가",
                `프로필 정보는 한 달에 한 번만 수정할 수 있습니다. 다음 수정 가능 날짜는 ${formattedDate}입니다.`
            );
            return;
        }

        try {
            const result = await updateUserInfo({
                nickname,
                gender: convertGenderToBoolean(gender),
                birthDate: birthDate?.toISOString() || null
            });

            if (result.success) {
                Alert.alert("성공", "사용자 정보가 업데이트되었습니다.");
            } else {
                Alert.alert("오류", result.error?.message || "사용자 정보 업데이트 중 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error('Error updating user info:', error);
            Alert.alert("오류", "사용자 정보 업데이트 중 오류가 발생했습니다.");
        }
    };

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
                                Alert.alert("완료", "회원탈퇴가 완료되었습니다.",[
                                    {
                                        text:'확인',
                                        onPress: ()=>navigation.goBack()
                                    }
                                ])
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

    return (
        <Background isStatusBarGap={true} type="background">
            <AppBar title="회원 정보" navigation={navigation}/>
            <ScrollView className="flex-1">
                <View className="p-4">
                    {/* 이름 */}
                    <View className="my-2">
                        <Label text="이름" />
                        <View className="rounded-lg border-b border-gray-200 px-4 py-3">
                            <Text className="text-base text-black">{name}</Text>
                        </View>
                    </View>

                    {/* 닉네임 */}
                    <View className="my-2">
                        <Label text="닉네임" />
                        <View className="bg-white rounded-lg border border-gray-200 px-4"
                        style={{paddingVertical: Platform.OS === 'ios' ? 10 : 0}}>
                            <TextInput
                                value={nickname}
                                onChangeText={setNickname}
                                placeholder="닉네임을 입력하세요"
                                maxLength={15}
                            />
                        </View>
                    </View>

                    {/* 이메일 */}
                    <View className="my-2">
                        <Label text="이메일" />
                        <View className="rounded-lg border-b border-gray-200 px-4 py-3">
                            <Text className="text-base text-black">{email}</Text>
                        </View>
                    </View>

                    {/* 성별 */}
                    <View className="my-2">
                        <Label text="성별" />
                        <View className="flex-row bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {GENDER_OPTIONS.map((option, index) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => setGender(option)}
                                    className={`flex-1 py-3 ${index !== GENDER_OPTIONS.length - 1 ? 'border-r border-gray-200' : ''} ${gender === option ? 'bg-blue-50' : ''}`}
                                >
                                    <Text className={`text-center text-base ${gender === option ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 생년월일 */}
                    <View className="my-2">
                        <Label text="생년월일" />
                        <TouchableOpacity 
                            onPress={() => setShowDatePicker(true)}
                            className="bg-white rounded-lg border border-gray-200 px-4 py-3"
                        >
                            <Text className={` ${!birthDate ? "text-gray-400" : "text-black"}`}>
                                {formatDate(birthDate)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* 수정 버튼 */}
                    <View className="w-full flex-row justify-end mt-2">
                        <TouchableOpacity onPress={handleUpdate}>
                            <Text className="text-blue-600">수정하기</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 생년월일 선택기 */}
                {showDatePicker && (
                    <DateTimePicker
                        value={birthDate || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                    />
                )}

                <View className="h-3 bg-gray-300"/>
                {/* 로그아웃 버튼 */}
                <View className="mt-4 p-4 flex-row justify-between">
                    <Text className="text-sm text-gray-500">
                        로그아웃 하시겠습니까?
                    </Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Text className="text-sm text-blue-600 underline">로그아웃</Text>
                    </TouchableOpacity>
                </View>
                {/* 회원탈퇴 버튼 */}
                <View className="mt-4 p-4 flex-row justify-between">
                    <Text className="text-sm text-gray-500">
                        서비스를 더 이상 사용하지 않으시나요?
                    </Text>
                    <TouchableOpacity onPress={handleAccountDeletion}>
                        <Text className="text-sm text-blue-600 underline">회원탈퇴하기</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Background>
    )
}
