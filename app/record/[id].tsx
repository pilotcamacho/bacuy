import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { client } from '@/lib/data';
import { useRecordsStore } from '@/store';
import { PriorityDots } from '@/components/record-card';
import { CATEGORY_COLORS } from '@/constants/categories';
import type { BacuyRecord, HabitEntry, LifeArea, RecordStatus } from '@/types';

const STATUS_OPTIONS: RecordStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE', 'ARCHIVED'];
const MOODS = ['😢', '😕', '😐', '😊', '😁'];

// ── Reusable modal shell ──────────────────────────────────────────────────────

function FormModal({
  visible,
  title,
  onClose,
  onSave,
  saving,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/50" onPress={onClose} />
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl px-6 pt-5 pb-8">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={22} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          {children}
          <TouchableOpacity
            onPress={onSave}
            disabled={saving}
            className="mt-4 bg-primary-500 rounded-xl py-3.5 items-center"
          >
            <Text className="text-white font-semibold text-base">
              {saving ? t('common.loading') : t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
      {label}
    </Text>
  );
}

function FormInput({
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      multiline={multiline}
      keyboardType={keyboardType ?? 'default'}
      className={`border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 mb-4 ${multiline ? 'min-h-20' : ''}`}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  );
}

// ── Category-specific section ─────────────────────────────────────────────────

function CategorySection({
  record,
  subTasks,
  habitEntries,
  onHabitCheckIn,
  onLogSession,
  onLogApplication,
  onAddSubTask,
}: {
  record: BacuyRecord;
  subTasks: BacuyRecord[];
  habitEntries: HabitEntry[];
  onHabitCheckIn: () => void;
  onLogSession: () => void;
  onLogApplication: () => void;
  onAddSubTask: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  if (record.category === 'TASK') return null;

  return (
    <View className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-2">
      {record.category === 'HABIT' && (
        <>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('record.habitSection')}
            </Text>
            <Text className="text-xs text-gray-400">
              {t('record.checkInCount', { count: habitEntries.length })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onHabitCheckIn}
            className="flex-row items-center justify-center gap-2 py-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"
          >
            <MaterialIcons name="check-circle" size={18} color="#16a34a" />
            <Text className="text-green-700 dark:text-green-400 font-semibold text-sm">
              {t('habits.checkIn')}
            </Text>
          </TouchableOpacity>
          {habitEntries.length > 0 && (
            <View className="mt-3 gap-1">
              {habitEntries.slice(0, 3).map((entry) => (
                <View key={entry.id} className="flex-row items-center gap-2 py-1">
                  <Text className="text-base">{entry.mood ?? '✓'}</Text>
                  <Text className="text-xs text-gray-400 flex-1">
                    {new Date(entry.completedAt).toLocaleDateString()}
                  </Text>
                  {entry.notes ? (
                    <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                      {entry.notes}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {record.category === 'SKILL' && (
        <>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('record.skillSection')}
            </Text>
            <Text className="text-xs text-gray-400">
              {t('record.checkInCount', { count: subTasks.length })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onLogSession}
            className="flex-row items-center justify-center gap-2 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950"
          >
            <MaterialIcons name="timer" size={18} color="#2563eb" />
            <Text className="text-blue-700 dark:text-blue-400 font-semibold text-sm">
              {t('skills.logSession')}
            </Text>
          </TouchableOpacity>
          {subTasks.length > 0 && (
            <View className="mt-3 gap-2">
              {subTasks.slice(0, 5).map((task) => (
                <View key={task.id} className="flex-row items-center gap-2 py-1">
                  <MaterialIcons
                    name={task.status === 'DONE' ? 'check-circle' : 'radio-button-unchecked'}
                    size={16}
                    color={task.status === 'DONE' ? '#22c55e' : '#9ca3af'}
                  />
                  <Text
                    className="text-sm text-gray-700 dark:text-gray-300 flex-1"
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                  {task.tags?.[0] ? (
                    <Text className="text-xs text-gray-400">{task.tags[0]}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {record.category === 'ATTITUDE' && (
        <>
          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t('record.attitudeSection')}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 italic">
              {t('attitudes.reflectionPrompt')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onLogApplication}
            className="flex-row items-center justify-center gap-2 py-3 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950"
          >
            <MaterialIcons name="edit-note" size={18} color="#7c3aed" />
            <Text className="text-purple-700 dark:text-purple-400 font-semibold text-sm">
              {t('attitudes.logApplication')}
            </Text>
          </TouchableOpacity>
          {subTasks.length > 0 && (
            <View className="mt-3 gap-2">
              {subTasks.slice(0, 3).map((task) => (
                <View
                  key={task.id}
                  className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                >
                  <Text className="text-xs text-gray-400 mb-1">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </Text>
                  <Text
                    className="text-sm text-gray-700 dark:text-gray-300"
                    numberOfLines={3}
                  >
                    {task.description ?? task.title}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {record.category === 'PROJECT' && (
        <>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('record.projectSection')}
            </Text>
            <Text className="text-xs text-gray-400">
              {subTasks.filter((s) => s.status === 'DONE').length}/{subTasks.length}
            </Text>
          </View>
          {subTasks.length === 0 ? (
            <Text className="text-sm text-gray-400 dark:text-gray-600 mb-3">
              {t('record.noSubTasks')}
            </Text>
          ) : (
            <View className="gap-2 mb-3">
              {subTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => router.push({ pathname: '/record/[id]', params: { id: task.id } })}
                  className="flex-row items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                >
                  <MaterialIcons
                    name={task.status === 'DONE' ? 'check-circle' : 'radio-button-unchecked'}
                    size={18}
                    color={task.status === 'DONE' ? '#22c55e' : '#9ca3af'}
                  />
                  <Text
                    className={`flex-1 text-sm ${
                      task.status === 'DONE'
                        ? 'line-through text-gray-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                  {task.dueDate ? (
                    <Text className="text-xs text-gray-400">{task.dueDate}</Text>
                  ) : null}
                  <MaterialIcons name="chevron-right" size={16} color="#d1d5db" />
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity
            onPress={onAddSubTask}
            className="flex-row items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-amber-300 dark:border-amber-700"
          >
            <MaterialIcons name="add" size={18} color="#d97706" />
            <Text className="text-amber-700 dark:text-amber-400 font-semibold text-sm">
              {t('projects.addTask')}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { records, isLoading, saveRecord, deleteRecord, fetchRecords, createRecord } =
    useRecordsStore();

  const record = records.find((r) => r.id === id);
  const subTasks = records.filter((r) => r.parentId === id);

  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [rawExpanded, setRawExpanded] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  // Modal visibility
  const [showHabit, setShowHabit] = useState(false);
  const [showSkill, setShowSkill] = useState(false);
  const [showAttitude, setShowAttitude] = useState(false);
  const [showSubTask, setShowSubTask] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);

  // Habit form
  const [mood, setMood] = useState('');
  const [location, setLocation] = useState('');
  const [companions, setCompanions] = useState('');
  const [habitNotes, setHabitNotes] = useState('');

  // Skill form
  const [duration, setDuration] = useState('');
  const [skillNotes, setSkillNotes] = useState('');
  const [outcome, setOutcome] = useState(3);

  // Attitude form
  const [situation, setSituation] = useState('');
  const [attitudeOutcome, setAttitudeOutcome] = useState('');

  // Sub-task form
  const [subTaskTitle, setSubTaskTitle] = useState('');
  const [subTaskDue, setSubTaskDue] = useState('');

  useEffect(() => {
    if (records.length === 0) fetchRecords();
  }, []);

  useEffect(() => {
    if (record?.category !== 'HABIT') return;
    client.models.HabitEntry.list({ filter: { recordId: { eq: id } } }).then(({ data }) => {
      setHabitEntries(
        (data ?? []).map((e) => ({
          id: e.id,
          recordId: e.recordId,
          completedAt: e.completedAt,
          location: e.location ?? undefined,
          mood: e.mood ?? undefined,
          companions: (e.companions?.filter(Boolean) as string[]) ?? undefined,
          notes: e.notes ?? undefined,
        }))
      );
    });
  }, [record?.category, id]);

  const handleStatusChange = async (status: RecordStatus) => {
    if (!record || record.status === status || statusSaving) return;
    setStatusSaving(true);
    await saveRecord(record.id, { status });
    setStatusSaving(false);
  };

  const handleDelete = () => {
    Alert.alert(t('common.delete'), t('record.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteRecord(id);
          router.back();
        },
      },
    ]);
  };

  const saveHabitCheckIn = async () => {
    if (!record) return;
    setModalSaving(true);
    try {
      const { data } = await client.models.HabitEntry.create({
        recordId: record.id,
        completedAt: new Date().toISOString(),
        mood: mood || undefined,
        location: location.trim() || undefined,
        companions: companions.trim()
          ? companions.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
        notes: habitNotes.trim() || undefined,
      });
      if (data) {
        setHabitEntries((prev) => [
          ...prev,
          {
            id: data.id,
            recordId: data.recordId,
            completedAt: data.completedAt,
            location: data.location ?? undefined,
            mood: data.mood ?? undefined,
            companions: (data.companions?.filter(Boolean) as string[]) ?? undefined,
            notes: data.notes ?? undefined,
          },
        ]);
      }
      setMood('');
      setLocation('');
      setCompanions('');
      setHabitNotes('');
      setShowHabit(false);
    } finally {
      setModalSaving(false);
    }
  };

  const saveSkillSession = async () => {
    if (!record) return;
    setModalSaving(true);
    try {
      const label = `Session – ${new Date().toLocaleDateString()}`;
      await createRecord({
        rawInput: skillNotes.trim() || label,
        category: 'TASK',
        title: label,
        description: skillNotes.trim() || undefined,
        status: 'DONE',
        lifeArea: record.lifeArea,
        priority: outcome,
        parentId: record.id,
        tags: duration.trim() ? [`${duration.trim()} min`] : [],
      });
      setDuration('');
      setSkillNotes('');
      setOutcome(3);
      setShowSkill(false);
    } finally {
      setModalSaving(false);
    }
  };

  const saveAttitudeApplication = async () => {
    if (!record) return;
    setModalSaving(true);
    try {
      const desc = [situation.trim(), attitudeOutcome.trim() ? `Outcome: ${attitudeOutcome.trim()}` : '']
        .filter(Boolean)
        .join('\n\n');
      await createRecord({
        rawInput: situation.trim() || 'Attitude application',
        category: 'TASK',
        title: `Application – ${new Date().toLocaleDateString()}`,
        description: desc || undefined,
        status: 'DONE',
        lifeArea: record.lifeArea,
        priority: 3,
        parentId: record.id,
        tags: [],
      });
      setSituation('');
      setAttitudeOutcome('');
      setShowAttitude(false);
    } finally {
      setModalSaving(false);
    }
  };

  const saveSubTask = async () => {
    if (!record || !subTaskTitle.trim()) return;
    setModalSaving(true);
    try {
      await createRecord({
        rawInput: subTaskTitle.trim(),
        category: 'TASK',
        title: subTaskTitle.trim(),
        status: 'PENDING',
        lifeArea: record.lifeArea,
        priority: record.priority,
        dueDate: subTaskDue.trim() || undefined,
        parentId: record.id,
        tags: [],
      });
      setSubTaskTitle('');
      setSubTaskDue('');
      setShowSubTask(false);
    } finally {
      setModalSaving(false);
    }
  };

  if (isLoading && !record) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black items-center justify-center">
        <Text className="text-gray-400">{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (!record) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black items-center justify-center">
        <TouchableOpacity onPress={() => router.back()} className="items-center gap-2">
          <MaterialIcons name="arrow-back" size={24} color="#9ca3af" />
          <Text className="text-gray-400">{t('common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const colors = CATEGORY_COLORS[record.category];
  const isDone = record.status === 'DONE';

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 mb-2">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} className="p-1">
            <MaterialIcons name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} hitSlop={8} className="p-1">
            <MaterialIcons name="delete-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View className="px-5">
          {/* Badges */}
          <View className="flex-row flex-wrap gap-2 mb-3">
            <View className={`px-3 py-1 rounded-full ${colors.bg}`}>
              <Text className={`text-xs font-semibold ${colors.text}`}>
                {t(`categories.${record.category}`)}
              </Text>
            </View>
            {record.lifeArea ? (
              <View className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  {t(`lifeAreas.${record.lifeArea as LifeArea}`)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Title */}
          <Text
            className={`text-2xl font-bold mb-4 ${
              isDone
                ? 'line-through text-gray-400 dark:text-gray-600'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {record.title}
          </Text>

          {/* Status picker */}
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {t('record.statusLabel')}
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => handleStatusChange(s)}
                disabled={statusSaving}
                className={`px-3 py-1.5 rounded-full border ${
                  record.status === s
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    record.status === s
                      ? 'text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {t(`status.${s}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Priority + due date */}
          {(record.priority !== undefined || record.dueDate) ? (
            <View className="flex-row items-center gap-4 mb-4">
              {record.priority !== undefined && (
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs text-gray-400">{t('classification.priority')}</Text>
                  <PriorityDots value={record.priority} />
                </View>
              )}
              {record.dueDate ? (
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="event" size={14} color="#9ca3af" />
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {record.dueDate}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Description */}
          {record.description ? (
            <Text className="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {record.description}
            </Text>
          ) : null}

          {/* Tags */}
          {record.tags.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {record.tags.map((tag) => (
                <View key={tag} className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Text className="text-xs text-gray-600 dark:text-gray-400">{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Original note (collapsible) */}
          <TouchableOpacity
            onPress={() => setRawExpanded((v) => !v)}
            className="flex-row items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800"
          >
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {t('record.rawInput')}
            </Text>
            <MaterialIcons
              name={rawExpanded ? 'expand-less' : 'expand-more'}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
          {rawExpanded ? (
            <Text className="text-sm text-gray-500 dark:text-gray-400 pb-4 leading-relaxed">
              {record.rawInput}
            </Text>
          ) : null}

          {/* Timestamps */}
          <View className="flex-row gap-4 py-3 border-t border-gray-100 dark:border-gray-800 mb-2">
            <Text className="text-xs text-gray-400">
              {t('record.created')}: {new Date(record.createdAt).toLocaleDateString()}
            </Text>
            <Text className="text-xs text-gray-400">
              {t('record.updated')}: {new Date(record.updatedAt).toLocaleDateString()}
            </Text>
          </View>

          {/* Category section */}
          <CategorySection
            record={record}
            subTasks={subTasks}
            habitEntries={habitEntries}
            onHabitCheckIn={() => setShowHabit(true)}
            onLogSession={() => setShowSkill(true)}
            onLogApplication={() => setShowAttitude(true)}
            onAddSubTask={() => setShowSubTask(true)}
          />
        </View>
      </ScrollView>

      {/* Habit check-in modal */}
      <FormModal
        visible={showHabit}
        title={t('habits.checkIn')}
        onClose={() => setShowHabit(false)}
        onSave={saveHabitCheckIn}
        saving={modalSaving}
      >
        <FieldLabel label={t('habits.checkInForm.mood')} />
        <View className="flex-row justify-between mb-4">
          {MOODS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => setMood(emoji)}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                mood === emoji
                  ? 'bg-primary-100 dark:bg-primary-900'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <Text className="text-2xl">{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FieldLabel label={t('habits.checkInForm.location')} />
        <FormInput
          value={location}
          onChangeText={setLocation}
          placeholder={t('habits.checkInForm.location')}
        />
        <FieldLabel label={t('habits.checkInForm.companions')} />
        <FormInput
          value={companions}
          onChangeText={setCompanions}
          placeholder="Alice, Bob"
        />
        <FieldLabel label={t('habits.checkInForm.notes')} />
        <FormInput value={habitNotes} onChangeText={setHabitNotes} multiline />
      </FormModal>

      {/* Skill session modal */}
      <FormModal
        visible={showSkill}
        title={t('skills.logSession')}
        onClose={() => setShowSkill(false)}
        onSave={saveSkillSession}
        saving={modalSaving}
      >
        <FieldLabel label={t('skills.sessionForm.duration')} />
        <FormInput
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholder="30"
        />
        <FieldLabel label={t('skills.sessionForm.notes')} />
        <FormInput value={skillNotes} onChangeText={setSkillNotes} multiline />
        <FieldLabel label={t('skills.sessionForm.outcome')} />
        <View className="flex-row gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setOutcome(n)}
              className={`flex-1 py-2.5 rounded-xl items-center border ${
                outcome === n
                  ? 'bg-primary-500 border-primary-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <Text
                className={`text-sm font-bold ${outcome === n ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </FormModal>

      {/* Attitude application modal */}
      <FormModal
        visible={showAttitude}
        title={t('attitudes.logApplication')}
        onClose={() => setShowAttitude(false)}
        onSave={saveAttitudeApplication}
        saving={modalSaving}
      >
        <FieldLabel label={t('attitudes.applicationForm.situation')} />
        <FormInput value={situation} onChangeText={setSituation} multiline />
        <FieldLabel label={t('attitudes.applicationForm.outcome')} />
        <FormInput value={attitudeOutcome} onChangeText={setAttitudeOutcome} multiline />
      </FormModal>

      {/* Project sub-task modal */}
      <FormModal
        visible={showSubTask}
        title={t('projects.addTask')}
        onClose={() => setShowSubTask(false)}
        onSave={saveSubTask}
        saving={modalSaving}
      >
        <FieldLabel label={t('classification.title')} />
        <FormInput
          value={subTaskTitle}
          onChangeText={setSubTaskTitle}
          placeholder={t('record.subTaskTitle')}
        />
        <FieldLabel label={t('classification.dueDate')} />
        <FormInput
          value={subTaskDue}
          onChangeText={setSubTaskDue}
          placeholder="YYYY-MM-DD"
        />
      </FormModal>
    </SafeAreaView>
  );
}
