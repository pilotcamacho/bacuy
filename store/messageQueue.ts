import { create } from 'zustand';
import type { MessageQueueEntry } from '@/types';

interface MessageQueueState {
  entries: MessageQueueEntry[];
  pendingCount: number;
  addEntry: (entry: MessageQueueEntry) => void;
  markDelivered: (id: string) => void;
  markRead: (id: string) => void;
  dismissEntry: (id: string) => void;
  setEntries: (entries: MessageQueueEntry[]) => void;
}

const computePendingCount = (entries: MessageQueueEntry[]) =>
  entries.filter((e) => e.status === 'PENDING' || e.status === 'DELIVERED').length;

export const useMessageQueueStore = create<MessageQueueState>()((set) => ({
  entries: [],
  pendingCount: 0,
  addEntry: (entry) =>
    set((state) => {
      const entries = [entry, ...state.entries].sort((a, b) => b.priority - a.priority);
      return { entries, pendingCount: computePendingCount(entries) };
    }),
  markDelivered: (id) =>
    set((state) => {
      const entries = state.entries.map((e) =>
        e.id === id ? { ...e, status: 'DELIVERED' as const, deliveredAt: new Date().toISOString() } : e
      );
      return { entries, pendingCount: computePendingCount(entries) };
    }),
  markRead: (id) =>
    set((state) => {
      const entries = state.entries.map((e) =>
        e.id === id ? { ...e, status: 'READ' as const } : e
      );
      return { entries, pendingCount: computePendingCount(entries) };
    }),
  dismissEntry: (id) =>
    set((state) => {
      const entries = state.entries.map((e) =>
        e.id === id ? { ...e, status: 'DISMISSED' as const } : e
      );
      return { entries, pendingCount: computePendingCount(entries) };
    }),
  setEntries: (entries) =>
    set({ entries, pendingCount: computePendingCount(entries) }),
}));
