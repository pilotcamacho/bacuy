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
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authSignIn, checkCurrentUser } from '@/lib/auth';
import { useAuthStore } from '@/store';

export default function SignInScreen() {
  const { t } = useTranslation();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await authSignIn(email, password);
      const user = await checkCurrentUser();
      setUser(user);
    } catch (e: unknown) {
      console.error('[SignIn] error:', JSON.stringify(e, Object.getOwnPropertyNames(e)));
      setError(e instanceof Error ? e.message : t('errors.authFailed'));
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
          <Text className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
            Bacuy
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 mb-8">
            {t('auth.signIn')}
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
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 mb-4"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
          />

          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.password')}
          </Text>
          <TextInput
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 mb-2"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
          />

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity className="mb-6">
              <Text className="text-sm text-primary-500">{t('auth.forgotPassword')}</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className="bg-primary-500 rounded-xl py-4 items-center mb-4"
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">{t('auth.signIn')}</Text>
            }
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-500 dark:text-gray-400">{t('auth.noAccount')} </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text className="text-primary-500 font-medium">{t('auth.signUp')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
