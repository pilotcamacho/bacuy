import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <ScrollView className="flex-1 px-4">
        <View className="pt-8 pb-4">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            Bacuy
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 mt-1">
            {t('tabs.home')}
          </Text>
        </View>
        {/* Phase 8: Dashboard — today's priorities, habit check-ins, upcoming deadlines */}
      </ScrollView>
    </SafeAreaView>
  );
}
