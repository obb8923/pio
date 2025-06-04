import { View, Text, ScrollView } from "react-native"
import { Background } from "../../../../components/Background"
import { Policy } from "../../../../constants/PrivacyAndPolicy"

export const TermsOfServiceScreen = () => {
    return (
        <Background isStatusBarGap={false} type="background">
            <ScrollView className="flex-1 p-4"
            contentContainerStyle={{paddingBottom: 50}}
            >
                <Text className="text-sm leading-5">{Policy}</Text>
            </ScrollView>
        </Background>
    )
}   