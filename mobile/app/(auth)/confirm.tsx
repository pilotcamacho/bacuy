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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authConfirmSignUp, authResendCode, authAutoSignIn, checkCurrentUser } from '@/lib/auth';
import { useAuthStore } from '@/store';

export default function ConfirmScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { setUser } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);

  const handleConfirm = async () => {
    if (!code || !email) return;
    setLoading(true);
    setError('');
    try {
      const { nextStep } = await authConfirmSignUp(email, code);
      if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
        await authAutoSignIn();
        const user = await checkCurrentUser();
        setUser(user);
        // AuthGuard handles redirect to /(tabs)
      } else {
        router.replace('/(auth)/sign-in');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await authResendCode(email);
      setResent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('errors.generic'));
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.verify')}
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 mb-8">
            {`We sent a code to ${email}`}
          </Text>

          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          ) : null}

          {resent ? (
            <View className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
              <Text className="text-green-600 text-sm">Code resent — check your email.</Text>
            </View>
          ) : null}

          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.verificationCode')}
          </Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 mb-6 tracking-widest text-center"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor="#9ca3af"
          />

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={loading}
            className="bg-primary-500 rounded-xl py-4 items-center mb-4"
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">{t('auth.verify')}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResend} disabled={resending} className="items-center">
            {resending
              ? <ActivityIndicator color="#0ea5e9" />
              : <Text className="text-primary-500 text-sm">Resend code</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
