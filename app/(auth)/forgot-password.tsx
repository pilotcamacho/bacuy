import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authForgotPassword } from '@/lib/auth';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await authForgotPassword(email);
      router.push({ pathname: '/(auth)/reset-password', params: { email } });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-8">
            <Text className="text-primary-500">{t('common.back')}</Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.forgotPassword')}
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 mb-8">
            {t('auth.resetSent')}
          </Text>

          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          ) : null}

          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.email')}
          </Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 mb-6"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={loading}
            className="bg-primary-500 rounded-xl py-4 items-center"
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">{t('auth.resetPassword')}</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
