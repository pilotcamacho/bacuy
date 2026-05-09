import { Alert, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import type { BacuyRecord, RecordStatus, LifeArea } from '@/types';
import { CATEGORY_COLORS } from '@/constants/categories';

export function PriorityDots({ value }: { value: number }) {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          className={`w-2 h-2 rounded-full ${i <= value ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
        />
      ))}
    </View>
  );
}

interface RecordCardProps {
  record: BacuyRecord;
  onStatusToggle: (id: string, status: RecordStatus) => void;
  onDelete: (id: string) => void;
}

export function RecordCard({ record, onStatusToggle, onDelete }: RecordCardProps) {
  const { t } = useTranslation();
  const isDone = record.status === 'DONE';
  const colors = CATEGORY_COLORS[record.category];

  const handleDelete = () => {
    Alert.alert(
      t('common.delete'),
      record.title,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => onDelete(record.id),
        },
      ]
    );
  };

  return (
    <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800">
      {/* Top row: badges + actions */}
      <View className="flex-row items-center mb-2 gap-2">
        <View className={`px-2.5 py-0.5 rounded-full ${colors.bg}`}>
          <Text className={`text-xs font-semibold ${colors.text}`}>
            {t(`categories.${record.category}`)}
          </Text>
        </View>
        {record.lifeArea ? (
          <View className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t(`lifeAreas.${record.lifeArea as LifeArea}`)}
            </Text>
          </View>
        ) : null}
        <View className="flex-1" />
        <TouchableOpacity
          onPress={() => onStatusToggle(record.id, isDone ? 'PENDING' : 'DONE')}
          hitSlop={8}
        >
          <MaterialIcons
            name={isDone ? 'check-circle' : 'radio-button-unchecked'}
            size={22}
            color={isDone ? '#22c55e' : '#9ca3af'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} hitSlop={8}>
          <MaterialIcons name="delete-outline" size={22} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text
        className={`text-base font-semibold mb-1 ${
          isDone
            ? 'line-through text-gray-400 dark:text-gray-600'
            : 'text-gray-900 dark:text-white'
        }`}
      >
        {record.title}
      </Text>

      {/* Description */}
      {record.description ? (
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2" numberOfLines={2}>
          {record.description}
        </Text>
      ) : null}

      {/* Priority + due date */}
      {(record.priority !== undefined || record.dueDate) ? (
        <View className="flex-row items-center gap-3 mb-2">
          {record.priority !== undefined && <PriorityDots value={record.priority} />}
          {record.dueDate ? (
            <Text className="text-xs text-gray-400 dark:text-gray-500">{record.dueDate}</Text>
          ) : null}
        </View>
      ) : null}

      {/* Tags */}
      {record.tags && record.tags.length > 0 ? (
        <View className="flex-row flex-wrap gap-1">
          {record.tags.map((tag) => (
            <View key={tag} className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Text className="text-xs text-gray-500 dark:text-gray-400">{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
