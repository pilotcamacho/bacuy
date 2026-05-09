import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecordCard } from '@/components/record-card';
import { useRecordsStore } from '@/store';
import type { BacuyRecord, RecordCategory, RecordStatus } from '@/types';

type FilterCategory = RecordCategory | 'ALL';

const FILTER_OPTIONS: FilterCategory[] = ['ALL', 'TASK', 'HABIT', 'SKILL', 'ATTITUDE', 'PROJECT'];

function sortRecords(records: BacuyRecord[], byPriority: boolean): BacuyRecord[] {
  return [...records].sort((a, b) => {
    if (byPriority) return (b.priority ?? 3) - (a.priority ?? 3);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export default function RecordsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { records, isLoading, error, fetchRecords, saveRecord, deleteRecord } = useRecordsStore();
  const [filter, setFilter] = useState<FilterCategory>('ALL');
  const [sortByPriority, setSortByPriority] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [fetchRecords])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  };

  const handleStatusToggle = (id: string, status: RecordStatus) => {
    saveRecord(id, { status });
  };

  const filtered = sortRecords(
    filter === 'ALL' ? records : records.filter((r) => r.category === filter),
    sortByPriority
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-6 pb-3">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('records.title')}
          </Text>
          <TouchableOpacity
            onPress={() => setSortByPriority((prev) => !prev)}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800"
          >
            <MaterialIcons name="sort" size={16} color="#6b7280" />
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {sortByPriority ? t('records.sortByPriority') : t('records.sortByDate')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 12 }}
        >
          {FILTER_OPTIONS.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full mr-2 ${
                filter === cat ? 'bg-primary-500' : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === cat ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {cat === 'ALL' ? t('records.filterAll') : t(`categories.${cat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Error */}
        {error ? (
          <View className="mx-6 mb-3 bg-red-50 border border-red-200 rounded-xl p-3">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        ) : null}

        {/* List */}
        {isLoading && records.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0ea5e9" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RecordCard
                record={item}
                onStatusToggle={handleStatusToggle}
                onDelete={deleteRecord}
                onPress={() => router.push({ pathname: '/record/[id]', params: { id: item.id } })}
              />
            )}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 32,
              flexGrow: 1,
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-base text-gray-400 dark:text-gray-600 text-center">
                  {records.length === 0
                    ? t('records.emptyState')
                    : `No ${filter.toLowerCase()} records`}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
