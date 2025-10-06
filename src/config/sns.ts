import { SNSClient } from '@aws-sdk/client-sns';

// Create SNS client
export const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

// SNS Topic ARNs
export const SNS_TOPICS = {
  FINANCIAL_ALERTS: process.env.SNS_FINANCIAL_ALERTS_TOPIC || 'arn:aws:sns:us-east-1:122610503259:financial-alerts'
};
