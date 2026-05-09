import { client } from './data';
import type { AIClassification, RecordCategory, LifeArea } from '@/types';

export async function classifyInput(rawInput: string): Promise<AIClassification> {
  const { data, errors } = await client.mutations.classifyInput({ rawInput });
  if (errors?.length) throw new Error(errors[0].message);
  if (!data) throw new Error('No classification returned');
  return {
    category: (data.category ?? 'TASK') as RecordCategory,
    title: data.title,
    description: data.description ?? undefined,
    lifeArea: (data.lifeArea ?? undefined) as LifeArea | undefined,
    priority: data.priority ?? undefined,
    dueDate: data.dueDate ?? undefined,
    tags: (data.tags?.filter(Boolean) ?? []) as string[],
  };
}
