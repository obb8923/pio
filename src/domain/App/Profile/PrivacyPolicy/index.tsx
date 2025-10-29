import { View, Text, ScrollView } from "react-native"
import { Background } from "@components/Background"
import { Privacy } from "@constants/PrivacyAndPolicy.ts"
import { AppBar } from "@components/AppBar"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ProfileStackParamList } from "@nav/stack/Profile"
type PrivacyPolicyScreenProps = NativeStackScreenProps<ProfileStackParamList, 'PrivacyPolicy'>;
export const PrivacyPolicyScreen = ({navigation}:PrivacyPolicyScreenProps) => {
    return (
        <Background isStatusBarGap={true} type="white">
            <AppBar navigation={navigation} />
            <ScrollView className="flex-1 p-4"
            contentContainerStyle={{paddingBottom: 50}}
            >
                <Text className="text-sm leading-5">{Privacy}</Text>
            </ScrollView>
        </Background>
    )
}   