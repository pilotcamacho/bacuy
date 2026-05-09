import { defineBackend } from '@aws-amplify/backend';
import { aws_iam as iam } from 'aws-cdk-lib';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { classifyRecord } from './functions/classify-record/resource';

const backend = defineBackend({ auth, data, classifyRecord });

backend.classifyRecord.resources.lambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: ['*'],
  })
);
