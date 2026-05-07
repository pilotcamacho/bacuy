import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecordsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('records.title')}
        </Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center">
          {t('records.emptyState')}
        </Text>
      </View>
      {/* Phase 4: Record type UIs go here */}
    </SafeAreaView>
  );
}
