import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

// Create Bedrock client
export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

// Available models
export const BEDROCK_MODELS = {
  CLAUDE_3_SONNET: 'anthropic.claude-3-sonnet-20240229-v1:0',
  CLAUDE_3_HAIKU: 'anthropic.claude-3-haiku-20240307-v1:0',
  TITAN_TEXT: 'amazon.titan-text-express-v1'
};

// Default model for insights
export const DEFAULT_MODEL = BEDROCK_MODELS.CLAUDE_3_HAIKU; // Cheaper option
