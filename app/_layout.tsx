import '../global.css';
import '../i18n';
import '../lib/amplify';

import { useEffect } from 'react';
import { View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store';
import { checkCurrentUser } from '@/lib/auth';
import { useMessageQueueSync } from '@/hooks/use-message-queue-sync';
import { NotificationBanner } from '@/components/notification-banner';

function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

function MessageQueueManager() {
  const { bannerEntry, dismissBanner } = useMessageQueueSync();

  if (!bannerEntry) return null;
  return <NotificationBanner entry={bannerEntry} onDismiss={dismissBanner} />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    checkCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGuard />
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="record/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
        <MessageQueueManager />
      </View>
    </ThemeProvider>
  );
}
