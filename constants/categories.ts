import type { RecordCategory } from '@/types';

export const CATEGORY_COLORS: Record<RecordCategory, { bg: string; text: string }> = {
  TASK:     { bg: 'bg-gray-100',   text: 'text-gray-700'   },
  HABIT:    { bg: 'bg-green-100',  text: 'text-green-700'  },
  SKILL:    { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  ATTITUDE: { bg: 'bg-purple-100', text: 'text-purple-700' },
  PROJECT:  { bg: 'bg-amber-100',  text: 'text-amber-700'  },
};
