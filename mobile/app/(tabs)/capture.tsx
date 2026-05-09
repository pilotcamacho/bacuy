import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { classifyInput } from '@/lib/classify';
import { useRecordsStore } from '@/store';
import { PriorityDots } from '@/components/record-card';
import { CATEGORY_COLORS } from '@/constants/categories';
import type { AIClassification, LifeArea } from '@/types';

type ScreenState = 'idle' | 'classifying' | 'review' | 'saving';

export default function CaptureScreen() {
  const { t } = useTranslation();
  const { createRecord } = useRecordsStore();
  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [rawInput, setRawInput] = useState('');
  const [classification, setClassification] = useState<AIClassification | null>(null);
  const [error, setError] = useState('');

  const handleOrganize = async () => {
    if (!rawInput.trim()) return;
    setScreenState('classifying');
    setError('');
    try {
      const result = await classifyInput(rawInput.trim());
      setClassification(result);
      setScreenState('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.classificationFailed'));
      setScreenState('idle');
    }
  };

  const handleConfirm = async () => {
    if (!classification) return;
    setScreenState('saving');
    try {
      await createRecord({
        rawInput,
        category: classification.category,
        title: classification.title,
        description: classification.description,
        status: 'PENDING',
        lifeArea: classification.lifeArea,
        priority: classification.priority,
        dueDate: classification.dueDate,
        tags: classification.tags ?? [],
      });
      setRawInput('');
      setClassification(null);
      setScreenState('idle');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.saveFailed'));
      setScreenState('review');
    }
  };

  const handleAdjust = () => {
    setScreenState('idle');
  };

  const isReviewing = screenState === 'review' || screenState === 'saving';

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-6 pb-8">

            {/* Header */}
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('tabs.capture')}
            </Text>

            {/* Error banner */}
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            ) : null}

            {/* Text input */}
            <TextInput
              className="border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-4 text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 min-h-40 mb-4"
              value={rawInput}
              onChangeText={setRawInput}
              multiline
              textAlignVertical="top"
              placeholder={t('capture.placeholder')}
              placeholderTextColor="#9ca3af"
              editable={screenState === 'idle'}
            />

            {/* Organize / loading button */}
            {!isReviewing && (
              <TouchableOpacity
                onPress={handleOrganize}
                disabled={!rawInput.trim() || screenState === 'classifying'}
                className={`rounded-xl py-4 items-center mb-6 ${
                  rawInput.trim() ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-800'
                }`}
              >
                {screenState === 'classifying' ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-semibold text-base">
                      {t('capture.classifyingLabel')}
                    </Text>
                  </View>
                ) : (
                  <Text
                    className={`font-semibold text-base ${
                      rawInput.trim() ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {t('capture.classifyButton')}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {/* Classification result card */}
            {isReviewing && classification && (
              <View className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-6 bg-gray-50 dark:bg-gray-900">
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  {t('capture.suggestionTitle')}
                </Text>

                {/* Category badge */}
                <View className="flex-row items-center gap-2 mb-3">
                  <View className={`px-3 py-1 rounded-full ${CATEGORY_COLORS[classification.category].bg}`}>
                    <Text className={`text-xs font-semibold ${CATEGORY_COLORS[classification.category].text}`}>
                      {t(`categories.${classification.category}`)}
                    </Text>
                  </View>
                  {classification.lifeArea && (
                    <View className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                      <Text className="text-xs text-gray-600 dark:text-gray-400">
                        {t(`lifeAreas.${classification.lifeArea as LifeArea}`)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Title */}
                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {classification.title}
                </Text>

                {/* Description */}
                {classification.description ? (
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {classification.description}
                  </Text>
                ) : null}

                {/* Priority + due date row */}
                <View className="flex-row items-center gap-4 mb-3">
                  {classification.priority !== undefined && (
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xs text-gray-400">{t('classification.priority')}</Text>
                      <PriorityDots value={classification.priority} />
                    </View>
                  )}
                  {classification.dueDate && (
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {t('classification.dueDate')}: {classification.dueDate}
                    </Text>
                  )}
                </View>

                {/* Tags */}
                {classification.tags && classification.tags.length > 0 && (
                  <View className="flex-row flex-wrap gap-2">
                    {classification.tags.map((tag) => (
                      <View key={tag} className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-700">
                        <Text className="text-xs text-gray-600 dark:text-gray-300">{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Confirm / Adjust buttons */}
            {isReviewing && (
              <View className="gap-3">
                <TouchableOpacity
                  onPress={handleConfirm}
                  disabled={screenState === 'saving'}
                  className="bg-primary-500 rounded-xl py-4 items-center"
                >
                  {screenState === 'saving' ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold text-base">
                      {t('capture.confirmButton')}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAdjust}
                  disabled={screenState === 'saving'}
                  className="rounded-xl py-4 items-center border border-gray-200 dark:border-gray-700"
                >
                  <Text className="text-gray-600 dark:text-gray-400 font-medium text-base">
                    {t('capture.adjustButton')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
