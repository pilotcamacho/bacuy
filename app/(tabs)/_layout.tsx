import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMessageQueueStore } from '@/store';

function NotificationTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { pendingCount } = useMessageQueueStore();
  return (
    <View>
      <IconSymbol size={28} name="bell.fill" color={color} />
      {pendingCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -6,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#ef4444',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 3,
          }}
        >
          <Text style={{ color: 'white', fontSize: 9, fontWeight: '700' }}>
            {pendingCount > 9 ? '9+' : pendingCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: t('tabs.capture'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="plus.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: t('tabs.records'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('tabs.notifications'),
          tabBarIcon: ({ color, focused }) => (
            <NotificationTabIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
