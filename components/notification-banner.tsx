import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMessageQueueStore } from '@/store';
import type { MessageQueueEntry } from '@/types';

const AUTO_DISMISS_MS = 4500;

interface Props {
  entry: MessageQueueEntry;
  onDismiss: () => void;
}

export function NotificationBanner({ entry, onDismiss }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { markDelivered, markRead } = useMessageQueueStore();
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const dismissing = useRef(false);

  const slideOut = (then?: () => void) => {
    if (dismissing.current) return;
    dismissing.current = true;
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
      then?.();
    });
  };

  useEffect(() => {
    dismissing.current = false;
    slideAnim.setValue(-120);

    markDelivered(entry.id);

    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 70,
      friction: 11,
    }).start();

    const timer = setTimeout(() => slideOut(), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [entry.id]);

  const handlePress = () => {
    markRead(entry.id);
    slideOut(() => router.push('/(tabs)/notifications'));
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.92}
        style={{
          backgroundColor: '#111827',
          borderRadius: 18,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: '#0ea5e9',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="notifications" size={17} color="white" />
        </View>
        <Text
          style={{ flex: 1, color: '#f9fafb', fontSize: 13, fontWeight: '500', lineHeight: 18 }}
          numberOfLines={2}
        >
          {entry.content}
        </Text>
        <TouchableOpacity onPress={() => slideOut()} hitSlop={10}>
          <MaterialIcons name="close" size={18} color="#6b7280" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}
