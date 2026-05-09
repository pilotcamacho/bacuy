import { create } from 'zustand';
import { client, toEntry } from '@/lib/data';
import type { MessageQueueEntry } from '@/types';

type CreateEntryInput = Omit<MessageQueueEntry, 'id'>;

interface MessageQueueState {
  entries: MessageQueueEntry[];
  pendingCount: number;
  isLoading: boolean;
  addEntry: (entry: MessageQueueEntry) => void;
  setEntries: (entries: MessageQueueEntry[]) => void;
  fetchEntries: () => Promise<void>;
  createEntry: (input: CreateEntryInput) => Promise<MessageQueueEntry | null>;
  markDelivered: (id: string) => void;
  markRead: (id: string) => void;
  dismissEntry: (id: string) => void;
}

const computePendingCount = (entries: MessageQueueEntry[]) =>
  entries.filter((e) => e.status === 'PENDING' || e.status === 'DELIVERED').length;

export const useMessageQueueStore = create<MessageQueueState>()((set, get) => ({
  entries: [],
  pendingCount: 0,
  isLoading: false,

  setEntries: (entries) =>
    set({ entries, pendingCount: computePendingCount(entries) }),

  addEntry: (entry) =>
    set((state) => {
      const entries = [entry, ...state.entries].sort((a, b) => b.priority - a.priority);
      return { entries, pendingCount: computePendingCount(entries) };
    }),

  fetchEntries: async () => {
    set({ isLoading: true });
    try {
      const { data, errors } = await client.models.MessageQueueEntry.list();
      if (errors?.length) throw new Error(errors[0].message);
      const entries = (data ?? [])
        .map(toEntry)
        .sort((a, b) => b.priority - a.priority);
      set({ entries, pendingCount: computePendingCount(entries) });
    } catch (e) {
      console.error('[MQ] fetchEntries failed', e);
    } finally {
      set({ isLoading: false });
    }
  },

  createEntry: async (input) => {
    try {
      const { data, errors } = await client.models.MessageQueueEntry.create({
        recordId: input.recordId,
        trigger: input.trigger,
        goal: input.goal,
        priority: input.priority,
        channel: input.channel,
        content: input.content,
        status: input.status,
        scheduledAt: input.scheduledAt,
        deliveredAt: input.deliveredAt,
      });
      if (errors?.length || !data) return null;
      const entry = toEntry(data);
      get().addEntry(entry);
      return entry;
    } catch (e) {
      console.error('[MQ] createEntry failed', e);
      return null;
    }
  },

  markDelivered: (id) => {
    const deliveredAt = new Date().toISOString();
    set((state) => {
      const entries = state.entries.map((e) =>
        e.id === id ? { ...e, status: 'DELIVERED' as const, deliveredAt } : e
      );
      return { entries, pendingCount: computePendingCount(entries) };
    });
    client.models.MessageQueueEntry.update({ id, status: 'DELIVERED', deliveredAt }).catch(
      console.error
    );
  },

  markRead: (id) => {
    set((state) => {
      const entries = state.entries.map((e) =>
        e.id === id ? { ...e, status: 'READ' as const } : e
      );
      return { entries, pendingCount: computePendingCount(entries) };
    });
    client.models.MessageQueueEntry.update({ id, status: 'READ' }).catch(console.error);
  },

  dismissEntry: (id) => {
    set((state) => {
      const entries = state.entries.map((e) =>
        e.id === id ? { ...e, status: 'DISMISSED' as const } : e
      );
      return { entries, pendingCount: computePendingCount(entries) };
    });
    client.models.MessageQueueEntry.update({ id, status: 'DISMISSED' }).catch(console.error);
  },
}));
