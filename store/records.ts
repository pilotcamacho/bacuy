import { create } from 'zustand';
import type { BacuyRecord } from '@/types';
import { client, toRecord } from '@/lib/data';

interface RecordsState {
  records: BacuyRecord[];
  isLoading: boolean;
  error: string | null;
  setRecords: (records: BacuyRecord[]) => void;
  addRecord: (record: BacuyRecord) => void;
  updateRecord: (id: string, updates: Partial<BacuyRecord>) => void;
  removeRecord: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchRecords: () => Promise<void>;
  createRecord: (input: Omit<BacuyRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<BacuyRecord | null>;
  saveRecord: (id: string, updates: Partial<Omit<BacuyRecord, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useRecordsStore = create<RecordsState>()((set, get) => ({
  records: [],
  isLoading: false,
  error: null,

  setRecords: (records) => set({ records }),
  addRecord: (record) =>
    set((state) => ({ records: [record, ...state.records] })),
  updateRecord: (id, updates) =>
    set((state) => ({
      records: state.records.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  removeRecord: (id) =>
    set((state) => ({ records: state.records.filter((r) => r.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, errors } = await client.models.BacuyRecord.list();
      if (errors?.length) throw new Error(errors[0].message);
      set({ records: data.map(toRecord) });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load records' });
    } finally {
      set({ isLoading: false });
    }
  },

  createRecord: async (input) => {
    try {
      const { data, errors } = await client.models.BacuyRecord.create({
        rawInput: input.rawInput,
        category: input.category,
        title: input.title,
        description: input.description,
        status: input.status,
        lifeArea: input.lifeArea,
        priority: input.priority,
        dueDate: input.dueDate,
        parentId: input.parentId,
        tags: input.tags,
      });
      if (errors?.length) throw new Error(errors[0].message);
      if (!data) return null;
      const record = toRecord(data);
      get().addRecord(record);
      return record;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to create record' });
      return null;
    }
  },

  saveRecord: async (id, updates) => {
    try {
      const { errors } = await client.models.BacuyRecord.update({ id, ...updates });
      if (errors?.length) throw new Error(errors[0].message);
      get().updateRecord(id, updates);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to update record' });
    }
  },

  deleteRecord: async (id) => {
    try {
      const { errors } = await client.models.BacuyRecord.delete({ id });
      if (errors?.length) throw new Error(errors[0].message);
      get().removeRecord(id);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete record' });
    }
  },
}));
