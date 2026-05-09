export type RecordCategory = 'HABIT' | 'SKILL' | 'ATTITUDE' | 'PROJECT' | 'TASK';
export type RecordStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
export type AlarmType = 'TIME' | 'GEOFENCE' | 'SMART';
export type MessageChannel = 'PUSH' | 'IN_APP' | 'VOICE';
export type MessageStatus = 'PENDING' | 'DELIVERED' | 'READ' | 'DISMISSED';
export type LifeArea =
  | 'WORK'
  | 'HEALTH'
  | 'HOME'
  | 'FINANCE'
  | 'PERSONAL_GROWTH'
  | 'RELATIONSHIPS'
  | 'OTHER';

export interface User {
  id: string;
  email: string;
  preferredLanguage: 'en' | 'es';
  lifeAreas: LifeArea[];
}

export interface BacuyRecord {
  id: string;
  rawInput: string;
  category: RecordCategory;
  title: string;
  description?: string;
  status: RecordStatus;
  lifeArea?: LifeArea;
  priority?: number;
  dueDate?: string;
  parentId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Alarm {
  id: string;
  recordId: string;
  type: AlarmType;
  scheduledAt?: string;
  geofenceId?: string;
  /** Structured rule string, e.g. "BUSINESS_DAY_BEFORE:15:MONTHLY" */
  smartRule?: string;
  isActive: boolean;
}

export interface HabitEntry {
  id: string;
  recordId: string;
  completedAt: string;
  location?: string;
  mood?: string;
  companions?: string[];
  notes?: string;
}

export interface MessageQueueEntry {
  id: string;
  recordId?: string;
  /** What caused this message to fire */
  trigger: string;
  /** What the message is meant to achieve */
  goal: string;
  /** Higher number = shown first when multiple are pending */
  priority: number;
  channel: MessageChannel;
  content: string;
  status: MessageStatus;
  scheduledAt: string;
  deliveredAt?: string;
}

export type AIClassification = {
  category: RecordCategory;
  title: string;
  description?: string;
  lifeArea?: LifeArea;
  priority?: number;
  dueDate?: string;
  tags?: string[];
};
