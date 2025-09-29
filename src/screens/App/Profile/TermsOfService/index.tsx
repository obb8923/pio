import { View, Text, ScrollView } from "react-native"
import { Background } from "../../../../components/Background"
import { Policy } from "../../../../constants/PrivacyAndPolicy"
import { AppBar } from "../../../../components/AppBar"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ProfileStackParamList } from "../../../../nav/stack/Profile"
type TermsOfServiceScreenProps = NativeStackScreenProps<ProfileStackParamList, 'TermsOfService'>;
export const TermsOfServiceScreen = ({navigation}:TermsOfServiceScreenProps) => {
    return (
        <Background isStatusBarGap={true} type="white">
            <AppBar navigation={navigation} />
            <ScrollView className="flex-1 p-4"
            contentContainerStyle={{paddingBottom: 50}}
            >
                <Text className="text-sm leading-5">{Policy}</Text>
            </ScrollView>
        </Background>
    )
}   