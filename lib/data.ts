import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import type {
  BacuyRecord,
  RecordCategory,
  RecordStatus,
  LifeArea,
} from '@/types';

export const client = generateClient<Schema>();

export function toRecord(item: Schema['BacuyRecord']['type']): BacuyRecord {
  return {
    id: item.id,
    rawInput: item.rawInput,
    category: item.category as RecordCategory,
    title: item.title,
    description: item.description ?? undefined,
    status: (item.status ?? 'PENDING') as RecordStatus,
    lifeArea: (item.lifeArea ?? undefined) as LifeArea | undefined,
    priority: item.priority ?? undefined,
    dueDate: item.dueDate ?? undefined,
    parentId: item.parentId ?? undefined,
    tags: (item.tags?.filter(Boolean) ?? []) as string[],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
