import { defineFunction } from '@aws-amplify/backend';

export const classifyRecord = defineFunction({
  name: 'classify-record',
  entry: './handler.ts',
  timeoutSeconds: 30,
});
