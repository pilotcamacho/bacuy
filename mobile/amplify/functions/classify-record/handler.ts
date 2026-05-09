import { BedrockRuntimeClient, ConverseCommand, type ContentBlock } from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION ?? 'us-east-1' });

// const MODEL_ID = 'us.anthropic.claude-3-haiku-20240307-v1:0';
const MODEL_ID = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';


const SYSTEM_PROMPT =
  'You are the intelligence layer of Bacuy, a personal productivity app. ' +
  'Analyze the user\'s free-form text and classify it into a structured record. ' +
  'Use the record_classification tool to return your answer. ' +
  'Always keep title and description in the same language as the input.';

const TOOL_SCHEMA = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['TASK', 'HABIT', 'SKILL', 'ATTITUDE', 'PROJECT'],
      description:
        'TASK=one-off action, HABIT=recurring behavior to build, ' +
        'SKILL=learning goal with progress, ATTITUDE=mindset principle to internalize, ' +
        'PROJECT=multi-step goal with sub-tasks',
    },
    title: {
      type: 'string',
      description: 'Short, action-oriented title, max 60 chars, same language as input',
    },
    description: {
      type: 'string',
      description: 'Optional brief elaboration, same language as input',
    },
    lifeArea: {
      type: 'string',
      enum: ['WORK', 'HEALTH', 'HOME', 'FINANCE', 'PERSONAL_GROWTH', 'RELATIONSHIPS', 'OTHER'],
    },
    priority: {
      type: 'integer',
      minimum: 1,
      maximum: 5,
      description: '1=low, 3=medium, 5=urgent. Default 3 if unclear.',
    },
    dueDate: {
      type: 'string',
      description: 'ISO 8601 date (YYYY-MM-DD) only if a date is explicitly or implicitly mentioned',
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: '1-3 short lowercase English keywords',
    },
  },
  required: ['category', 'title'],
};

export const handler = async (event: { arguments: { rawInput: string } }) => {
  const { rawInput } = event.arguments;

  const response = await bedrock.send(
    new ConverseCommand({
      modelId: MODEL_ID,
      system: [{ text: SYSTEM_PROMPT }],
      messages: [{ role: 'user', content: [{ text: rawInput }] }],
      toolConfig: {
        tools: [
          {
            toolSpec: {
              name: 'record_classification',
              description: 'Structured classification of the user input',
              inputSchema: { json: TOOL_SCHEMA },
            },
          },
        ],
        toolChoice: { tool: { name: 'record_classification' } },
      },
    })
  );

  const content: ContentBlock[] = response.output?.message?.content ?? [];
  const toolUse = content.find(
    (b): b is ContentBlock & { toolUse: NonNullable<ContentBlock['toolUse']> } =>
      'toolUse' in b && b.toolUse?.name === 'record_classification'
  );
  if (!toolUse?.toolUse?.input) {
    throw new Error('Model did not return a classification');
  }

  return toolUse.toolUse.input;
};
