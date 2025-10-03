import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.NODE_ENV === 'development' && {
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'
  })
});

export const dynamoDb = DynamoDBDocumentClient.from(client);

export const TABLES = {
  USERS: process.env.USERS_TABLE || 'cashflow-users',
  TRANSACTIONS: process.env.TRANSACTIONS_TABLE || 'cashflow-transactions',
  FILE_UPLOADS: process.env.FILE_UPLOADS_TABLE || 'cashflow-file-uploads'
};
