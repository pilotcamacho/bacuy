import { useEffect, useRef, useState } from 'react';
import { client, toEntry } from '@/lib/data';
import { requestNotificationPermissions, scheduleLocalNotification } from '@/lib/notifications';
import { useAuthStore, useMessageQueueStore, useRecordsStore } from '@/store';
import type { BacuyRecord, MessageQueueEntry } from '@/types';

async function evaluateDueRecords(
  records: BacuyRecord[],
  existingEntries: MessageQueueEntry[],
  createEntry: (input: Omit<MessageQueueEntry, 'id'>) => Promise<MessageQueueEntry | null>
): Promise<void> {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const todayStr = today.toISOString().split('T')[0];

  const candidates = records.filter((r) => {
    if (!r.dueDate || r.status === 'DONE' || r.status === 'ARCHIVED') return false;
    const due = new Date(r.dueDate);
    return due >= today && due < dayAfter;
  });

  for (const record of candidates) {
    const alreadyQueued = existingEntries.some(
      (e) =>
        e.recordId === record.id &&
        (e.status === 'PENDING' || e.status === 'DELIVERED') &&
        e.scheduledAt.startsWith(todayStr)
    );
    if (alreadyQueued) continue;

    const dueDate = new Date(record.dueDate!);
    const isToday = dueDate < tomorrow;
    const when = isToday ? 'today' : 'tomorrow';

    await createEntry({
      recordId: record.id,
      trigger: 'DUE_DATE',
      goal: 'complete_on_time',
      priority: record.priority ?? 3,
      channel: 'IN_APP',
      content: `"${record.title}" is due ${when}`,
      status: 'PENDING',
      scheduledAt: now.toISOString(),
    });

    // Schedule a local push notification at 8 am on the due date
    const notifTime = new Date(dueDate);
    notifTime.setHours(8, 0, 0, 0);
    if (notifTime > now) {
      scheduleLocalNotification(
        `due-${record.id}`,
        'Bacuy',
        `"${record.title}" is due ${when}`,
        notifTime
      ).catch(() => {});
    }
  }
}

export function useMessageQueueSync() {
  const { isAuthenticated } = useAuthStore();
  const { entries, fetchEntries, createEntry, addEntry } = useMessageQueueStore();
  const { records, fetchRecords } = useRecordsStore();
  const [bannerEntry, setBannerEntry] = useState<MessageQueueEntry | null>(null);
  const evaluated = useRef(false);

  // Load entries + records on first auth
  useEffect(() => {
    if (!isAuthenticated) {
      evaluated.current = false;
      return;
    }
    fetchEntries();
    requestNotificationPermissions().catch(() => {});
    if (records.length === 0) fetchRecords();
  }, [isAuthenticated]);

  // Real-time AppSync subscription for new entries
  useEffect(() => {
    if (!isAuthenticated) return;
    const sub = client.models.MessageQueueEntry.onCreate().subscribe({
      next: (raw) => {
        const entry = toEntry(raw);
        addEntry(entry);
        if (entry.channel === 'IN_APP') {
          setBannerEntry(entry);
        }
      },
      error: (err) => console.error('[MQ] subscription error', err),
    });
    return () => sub.unsubscribe();
  }, [isAuthenticated]);

  // Due-date evaluation — once per session, after records are loaded
  useEffect(() => {
    if (!isAuthenticated || evaluated.current || records.length === 0) return;
    evaluated.current = true;
    evaluateDueRecords(records, entries, createEntry);
  }, [isAuthenticated, records.length]);

  return {
    bannerEntry,
    dismissBanner: () => setBannerEntry(null),
  };
}
