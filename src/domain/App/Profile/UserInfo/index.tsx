import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from "react-native"
import { Background } from "@components/Background"
import { useState, useEffect } from "react"
import { useTranslation } from 'react-i18next'
import { signOut } from "@libs/supabase/operations/auth/signOut"
import { requestAccountDeletion } from "@libs/supabase/operations/users/requestAccountDeletion"
import { getUserInfo } from "@libs/supabase/operations/users/getUserInfo"
import { updateUserInfo } from "@libs/supabase/operations/users/updateUserInfo"
import { checkProfileUpdateAvailability } from "@libs/supabase/operations/users/checkProfileUpdateAvailablilty"
import { useAuthStore } from "@store/authStore"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ProfileStackParamList } from "@nav/stack/Profile"
import DateTimePicker from '@react-native-community/datetimepicker'
import { Platform } from "react-native"
import { AppBar } from "@components/AppBar"
import React from 'react'
import { useLanguageStore } from "@store/languageStore"
type UserInfoScreenProps = NativeStackScreenProps<ProfileStackParamList,'UserInfo'>

type GenderKey = 'male' | 'female' | 'notSelected'
const GENDER_KEYS: GenderKey[] = ['male', 'female', 'notSelected']

const Label = ({ text }: { text: string }) => (
    <Text className="text-sm text-gray-600 mb-2 px-4">{text}</Text>
)

const convertGenderToBoolean = (genderKey: GenderKey): boolean | null => {
    if (genderKey === "male") return true
    if (genderKey === "female") return false
    return null
}

const convertBooleanToGender = (gender: boolean | null): GenderKey => {
    if (gender === true) return "male"
    if (gender === false) return "female"
    return "notSelected"
}

export const UserInfoScreen = ({navigation}:UserInfoScreenProps) => {
    const { t } = useTranslation('domain');
    const { currentLanguage } = useLanguageStore();
    const [name, setName] = useState("")
    const [nickname, setNickname] = useState("")
    const [email, setEmail] = useState("")
    const [gender, setGender] = useState<GenderKey>("notSelected")
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
            Alert.alert(t('profile.userInfo.error'), t('profile.userInfo.fetchError'))
        }
    }

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false)
        if (selectedDate) {
            setBirthDate(selectedDate)
        }
    }

    const formatDate = (date: Date | null) => {
        if (!date) return t('profile.userInfo.selectBirthDate')
        const locale = currentLanguage === 'ko' ? 'ko-KR' : 'en-US'
        if (currentLanguage === 'ko') {
            return date.toLocaleDateString(locale, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\. /g, '년 ').replace('.', '월 ') + '일'
        } else {
            return date.toLocaleDateString(locale, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
        }
    }

    const handleUpdate = async () => {
        const { canUpdate, nextUpdateDate } = await checkProfileUpdateAvailability();
        
        if (!canUpdate && nextUpdateDate) {
            const locale = currentLanguage === 'ko' ? 'ko-KR' : 'en-US'
            const formattedDate = nextUpdateDate.toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            Alert.alert(
                t('profile.userInfo.updateLimited'),
                t('profile.userInfo.updateLimitedMessage', { date: formattedDate })
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
                Alert.alert(t('profile.userInfo.success'), t('profile.userInfo.updateSuccess'));
            } else {
                Alert.alert(t('profile.userInfo.error'), result.error?.message || t('profile.userInfo.updateError'));
            }
        } catch (error) {
            console.error('Error updating user info:', error);
            Alert.alert(t('profile.userInfo.error'), t('profile.userInfo.updateError'));
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            t('profile.userInfo.logoutTitle'),
            t('profile.userInfo.logoutMessage'),
            [
                {
                    text: t('profile.userInfo.cancel'),
                    style: "cancel"
                },
                {
                    text: t('profile.auth.logout'),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const result = await signOut()
                            if (result.success) {
                                logout() // 로컬 상태 업데이트
                                Alert.alert(t('profile.userInfo.success'), t('profile.userInfo.logoutSuccess'), [
                                    {
                                        text: t('profile.userInfo.confirm'),
                                        onPress: () => navigation.goBack()
                                    }
                                ])
                            } else {
                                Alert.alert(t('profile.userInfo.error'), t('profile.userInfo.logoutError'))
                            }
                        } catch (error) {
                            Alert.alert(t('profile.userInfo.error'), t('profile.userInfo.logoutError'))
                        }
                    }
                }
            ]
        )
    }

    const handleAccountDeletion = async () => {
        Alert.alert(
            t('profile.userInfo.deleteAccountTitle'),
            t('profile.userInfo.deleteAccountMessage'),
            [
                {
                    text: t('profile.userInfo.cancel'),
                    style: "cancel"
                },
                {
                    text: t('profile.userInfo.deleteAccountButton'),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const result = await requestAccountDeletion()
                            if (result.success) {
                                logout() // 로컬 상태 업데이트
                                Alert.alert(t('profile.userInfo.completed'), t('profile.userInfo.deleteAccountSuccess'),[
                                    {
                                        text: t('profile.userInfo.confirm'),
                                        onPress: ()=>navigation.goBack()
                                    }
                                ])
                            } else {
                                Alert.alert(t('profile.userInfo.error'), result.error?.message || t('profile.userInfo.deleteAccountError'))
                            }
                        } catch (error) {
                            Alert.alert(t('profile.userInfo.error'), t('profile.userInfo.deleteAccountError'))
                        }
                    }
                }
            ]
        )
    }

    return (
        <Background isStatusBarGap={true} type="white">
            <AppBar title={t('profile.userInfoTitle')} navigation={navigation}/>
            <ScrollView className="flex-1">
                <View className="p-4">
                    {/* 이름 */}
                    <View className="my-2">
                        <Label text={t('profile.userInfo.name')} />
                        <View className="rounded-lg border-b border-gray-200 px-4 py-3">
                            <Text className="text-base text-black">{name}</Text>
                        </View>
                    </View>

                    {/* 닉네임 */}
                    <View className="my-2">
                        <Label text={t('profile.userInfo.nickname')} />
                        <View className="bg-white rounded-lg border border-gray-200 px-4"
                        style={{paddingVertical: Platform.OS === 'ios' ? 10 : 0}}>
                            <TextInput
                                value={nickname}
                                onChangeText={setNickname}
                                placeholder={t('profile.userInfo.nicknamePlaceholder')}
                                maxLength={15}
                            />
                        </View>
                    </View>

                    {/* 이메일 */}
                    <View className="my-2">
                        <Label text={t('profile.userInfo.email')} />
                        <View className="rounded-lg border-b border-gray-200 px-4 py-3">
                            <Text className="text-base text-black">{email}</Text>
                        </View>
                    </View>

                    {/* 성별 */}
                    <View className="my-2">
                        <Label text={t('profile.userInfo.gender')} />
                        <View className="flex-row bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {GENDER_KEYS.map((genderKey, index) => (
                                <TouchableOpacity
                                    key={genderKey}
                                    onPress={() => setGender(genderKey)}
                                    className={`flex-1 py-3 ${index !== GENDER_KEYS.length - 1 ? 'border-r border-gray-200' : ''} ${gender === genderKey ? 'bg-blue-50' : ''}`}
                                >
                                    <Text className={`text-center text-base ${gender === genderKey ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                                        {t(`profile.userInfo.${genderKey}`)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 생년월일 */}
                    <View className="my-2">
                        <Label text={t('profile.userInfo.birthDate')} />
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
                            <Text className="text-blue-600">{t('profile.userInfo.update')}</Text>
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
                        {t('profile.userInfo.logoutConfirmQuestion')}
                    </Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Text className="text-sm text-blue-600 underline">{t('profile.auth.logout')}</Text>
                    </TouchableOpacity>
                </View>
                {/* 회원탈퇴 버튼 */}
                <View className="mt-4 p-4 flex-row justify-between">
                    <Text className="text-sm text-gray-500">
                        {t('profile.userInfo.deleteAccountQuestion')}
                    </Text>
                    <TouchableOpacity onPress={handleAccountDeletion}>
                        <Text className="text-sm text-blue-600 underline">{t('profile.userInfo.deleteAccountButtonText')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Background>
    )
}
