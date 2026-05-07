import { create } from 'zustand';
import type { BacuyRecord } from '@/types';

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
}

export const useRecordsStore = create<RecordsState>()((set) => ({
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
}));
