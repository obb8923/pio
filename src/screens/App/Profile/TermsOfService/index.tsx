import { View, Text, ScrollView } from "react-native"
import { Background } from "../../../../components/Background"
import { Policy } from "../../../../constants/PrivacyAndPolicy"
import { AppBar } from "../../../../components/AppBar"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ProfileStackParamList } from "../../../../nav/stack/Profile"
import { useSafeAreaInsets } from "react-native-safe-area-context"
type TermsOfServiceScreenProps = NativeStackScreenProps<ProfileStackParamList, 'TermsOfService'>;
export const TermsOfServiceScreen = ({navigation}:TermsOfServiceScreenProps) => {
    const insets = useSafeAreaInsets();
    return (
        <Background isStatusBarGap={true} type="background">
            <AppBar navigation={navigation} />
            <ScrollView className="flex-1 p-4"
            contentContainerStyle={{paddingBottom: 50}}
            >
                <Text className="text-sm leading-5">{Policy}</Text>
            </ScrollView>
        </Background>
    )
}   