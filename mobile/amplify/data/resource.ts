import { a, defineData, type ClientSchema } from '@aws-amplify/backend';
import { classifyRecord } from '../functions/classify-record/resource';

const schema = a.schema({
  RecordCategory: a.enum(['HABIT', 'SKILL', 'ATTITUDE', 'PROJECT', 'TASK']),
  RecordStatus: a.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'ARCHIVED']),
  AlarmType: a.enum(['TIME', 'GEOFENCE', 'SMART']),
  MessageChannel: a.enum(['PUSH', 'IN_APP', 'VOICE']),
  MessageStatus: a.enum(['PENDING', 'DELIVERED', 'READ', 'DISMISSED']),
  LifeArea: a.enum([
    'WORK',
    'HEALTH',
    'HOME',
    'FINANCE',
    'PERSONAL_GROWTH',
    'RELATIONSHIPS',
    'OTHER',
  ]),

  BacuyRecord: a
    .model({
      rawInput: a.string().required(),
      category: a.ref('RecordCategory').required(),
      title: a.string().required(),
      description: a.string(),
      status: a.ref('RecordStatus').required(),
      lifeArea: a.ref('LifeArea'),
      priority: a.integer(),
      dueDate: a.string(),
      parentId: a.id(),
      tags: a.string().array(),
    })
    .authorization((allow) => [allow.owner()]),

  HabitEntry: a
    .model({
      recordId: a.id().required(),
      completedAt: a.string().required(),
      location: a.string(),
      mood: a.string(),
      companions: a.string().array(),
      notes: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  Alarm: a
    .model({
      recordId: a.id().required(),
      type: a.ref('AlarmType').required(),
      scheduledAt: a.string(),
      geofenceId: a.string(),
      smartRule: a.string(),
      isActive: a.boolean().required(),
    })
    .authorization((allow) => [allow.owner()]),

  MessageQueueEntry: a
    .model({
      recordId: a.id(),
      trigger: a.string().required(),
      goal: a.string().required(),
      priority: a.integer().required(),
      channel: a.ref('MessageChannel').required(),
      content: a.string().required(),
      status: a.ref('MessageStatus').required(),
      scheduledAt: a.string().required(),
      deliveredAt: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  // AI Classification output shape
  AIClassification: a.customType({
    category: a.string().required(),
    title: a.string().required(),
    description: a.string(),
    lifeArea: a.string(),
    priority: a.integer(),
    dueDate: a.string(),
    tags: a.string().array(),
  }),

  classifyInput: a
    .mutation()
    .arguments({ rawInput: a.string().required() })
    .returns(a.ref('AIClassification'))
    .authorization((allow) => allow.authenticated())
    .handler(a.handler.function(classifyRecord)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
