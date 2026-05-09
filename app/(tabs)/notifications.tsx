import { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageQueueStore } from '@/store';
import type { MessageQueueEntry, MessageStatus } from '@/types';

type Filter = 'ALL' | 'UNREAD';

const CHANNEL_ICONS: Record<string, string> = {
  IN_APP: 'notifications',
  PUSH: 'phone-android',
  VOICE: 'mic',
};

function MessageItem({
  entry,
  onMarkRead,
  onDismiss,
}: {
  entry: MessageQueueEntry;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const { t } = useTranslation();
  const isUnread = entry.status === 'PENDING' || entry.status === 'DELIVERED';
  const isDismissed = entry.status === 'DISMISSED';

  return (
    <View
      className={`mx-4 mb-3 rounded-2xl p-4 border ${
        isUnread
          ? 'bg-primary-50 dark:bg-primary-950 border-primary-100 dark:border-primary-900'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
      } ${isDismissed ? 'opacity-50' : ''}`}
    >
      <View className="flex-row items-start gap-3">
        <View
          className={`w-8 h-8 rounded-full items-center justify-center mt-0.5 ${
            isUnread ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <MaterialIcons
            name={CHANNEL_ICONS[entry.channel] as any}
            size={16}
            color={isUnread ? 'white' : '#9ca3af'}
          />
        </View>

        <View className="flex-1">
          <Text
            className={`text-sm leading-5 mb-1 ${
              isUnread
                ? 'font-semibold text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {entry.content}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-600">
            {new Date(entry.scheduledAt).toLocaleString()}
          </Text>
        </View>

        {isUnread && (
          <View className="w-2 h-2 rounded-full bg-primary-500 mt-1.5" />
        )}
      </View>

      {!isDismissed && (
        <View className="flex-row gap-2 mt-3 ml-11">
          {isUnread && (
            <TouchableOpacity
              onPress={() => onMarkRead(entry.id)}
              className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <MaterialIcons name="done" size={14} color="#6b7280" />
              <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {t('messages.markRead')}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onDismiss(entry.id)}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            <MaterialIcons name="close" size={14} color="#6b7280" />
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {t('messages.dismiss')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { entries, isLoading, fetchEntries, markRead, dismissEntry, pendingCount } =
    useMessageQueueStore();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [fetchEntries])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  };

  const filtered = entries.filter((e) => {
    if (filter === 'UNREAD') return e.status === 'PENDING' || e.status === 'DELIVERED';
    return e.status !== 'DISMISSED';
  });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-6 pb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('messages.title')}
          </Text>
          {pendingCount > 0 && (
            <View className="min-w-5 h-5 px-1.5 rounded-full bg-primary-500 items-center justify-center">
              <Text className="text-xs text-white font-bold">{pendingCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Filter pills */}
      <View className="flex-row px-6 gap-2 mb-3">
        {(['ALL', 'UNREAD'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full ${
              filter === f ? 'bg-primary-500' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                filter === f ? 'text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {t(`messages.filter${f}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageItem
            entry={item}
            onMarkRead={markRead}
            onDismiss={dismissEntry}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-24">
            <MaterialIcons name="notifications-none" size={48} color="#d1d5db" />
            <Text className="text-base text-gray-400 dark:text-gray-600 mt-3">
              {t('messages.empty')}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}
