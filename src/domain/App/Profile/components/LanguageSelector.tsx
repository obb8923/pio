import { View, Text, Modal, TouchableOpacity } from "react-native";
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from "@store/languageStore";
import { supportedLanguages, type SupportedLanguage } from "@libs/i18n";
import { useModalBackground } from "@libs/hooks/useModalBackground";

interface LanguageSelectorProps {
  isVisible: boolean;
  onClose: () => void;
}

export const LanguageSelector = ({ isVisible, onClose }: LanguageSelectorProps) => {
  const { t } = useTranslation('common');
  const { currentLanguage, changeLanguage } = useLanguageStore();
  useModalBackground(isVisible);

  const handleLanguageSelect = async (language: SupportedLanguage) => {
    await changeLanguage(language);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 bg-white rounded-2xl p-6">
          <Text className="text-xl font-bold text-greenTab900 mb-6">
            {t('language.selectLanguage')}
          </Text>

          {supportedLanguages.map((lang) => (
            <TouchableOpacity
              key={lang}
              className={`py-4 px-4 rounded-xl mb-2 ${
                currentLanguage === lang ? 'bg-greenTab' : 'bg-gray-100'
              }`}
              onPress={() => handleLanguageSelect(lang)}
            >
              <Text
                className={`text-base font-medium ${
                  currentLanguage === lang ? 'text-white' : 'text-gray-700'
                }`}
              >
                {t(`language.languages.${lang}`)}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            className="mt-4 py-3 px-4 rounded-xl bg-gray-200"
            onPress={onClose}
          >
            <Text className="text-base font-medium text-gray-700 text-center">
              {t('components.button.cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

