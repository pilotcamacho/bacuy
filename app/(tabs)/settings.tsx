import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '@/i18n';
import { useAuthStore, useUIStore } from '@/store';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useUIStore();
  const { signOut } = useAuthStore();

  const toggleLanguage = () => {
    const next = language === 'en' ? 'es' : 'en';
    setLanguage(next);
    i18n.changeLanguage(next);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 px-4 pt-8">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t('settings.title')}
        </Text>

        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {t('settings.language')}
        </Text>
        <TouchableOpacity
          onPress={toggleLanguage}
          className="flex-row items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 mb-8"
        >
          <Text className="text-base text-gray-900 dark:text-white">
            {t(`settings.languageOptions.${language}`)}
          </Text>
          <Text className="text-sm text-primary-500">
            {language === 'en'
              ? t('settings.languageOptions.es')
              : t('settings.languageOptions.en')}
          </Text>
        </TouchableOpacity>

        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {t('settings.account')}
        </Text>
        <TouchableOpacity
          onPress={signOut}
          className="bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3"
        >
          <Text className="text-red-500 font-medium">{t('settings.signOut')}</Text>
        </TouchableOpacity>

        {/* Phase 8: Life areas customization goes here */}
      </View>
    </SafeAreaView>
  );
}
