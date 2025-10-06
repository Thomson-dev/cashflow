import { PublishCommand, SubscribeCommand } from '@aws-sdk/client-sns';
import { snsClient, SNS_TOPICS } from '../config/sns';

export interface NotificationData {
  userId: string;
  userEmail: string;
  phoneNumber?: string;
  businessName?: string;
  currentIncome: number;
  currentExpenses: number;
  expenseRatio: number;
  notificationPreference: 'email' | 'sms' | 'both';
}

// Calculate expense to income ratio
export const calculateExpenseRatio = (income: number, expenses: number): number => {
  if (income === 0) return expenses > 0 ? 100 : 0;
  return Math.round((expenses / income) * 100);
};

// Check if notification should be sent
export const shouldSendAlert = (expenseRatio: number): boolean => {
  return expenseRatio >= 80; // Alert when expenses are 80% or more of income
};

// Send email notification
const sendEmailNotification = async (data: NotificationData) => {
  const subject = `💰 Financial Alert: High Expense Ratio - ${data.businessName || 'Your Business'}`;
  
  const message = `
🚨 FINANCIAL ALERT

Hi there!

Your expenses are getting close to your income level:

📊 Current Status:
• Monthly Income: $${data.currentIncome.toLocaleString()}
• Monthly Expenses: $${data.currentExpenses.toLocaleString()}
• Expense Ratio: ${data.expenseRatio}%

⚠️ Your expenses represent ${data.expenseRatio}% of your income. Consider:
• Reviewing and reducing non-essential expenses
• Finding ways to increase revenue
• Setting up a budget to track spending

💡 Log into your CashFlow dashboard to see detailed analytics and AI recommendations.

Best regards,
CashFlow Team
`;

  try {
    await snsClient.send(new PublishCommand({
      TopicArn: SNS_TOPICS.FINANCIAL_ALERTS,
      Subject: subject,
      Message: message,
      MessageAttributes: {
        'notification_type': {
          DataType: 'String',
          StringValue: 'email'
        },
        'user_id': {
          DataType: 'String',
          StringValue: data.userId
        },
        'expense_ratio': {
          DataType: 'Number',
          StringValue: data.expenseRatio.toString()
        }
      }
    }));
    
    console.log('✅ Email notification sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to send email notification:', error);
    return false;
  }
};

// Send SMS notification
const sendSMSNotification = async (data: NotificationData) => {
  if (!data.phoneNumber) {
    console.log('⚠️ No phone number provided for SMS');
    return false;
  }

  const message = `🚨 CashFlow Alert: Your expenses (${data.expenseRatio}%) are close to your income. Income: $${data.currentIncome.toLocaleString()}, Expenses: $${data.currentExpenses.toLocaleString()}. Review your spending to maintain healthy cash flow.`;

  try {
    await snsClient.send(new PublishCommand({
      PhoneNumber: data.phoneNumber,
      Message: message,
      MessageAttributes: {
        'notification_type': {
          DataType: 'String',
          StringValue: 'sms'
        },
        'user_id': {
          DataType: 'String',
          StringValue: data.userId
        }
      }
    }));
    
    console.log('✅ SMS notification sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to send SMS notification:', error);
    return false;
  }
};

// Auto-subscribe user to SNS topic
export const subscribeUserToAlerts = async (email: string, phoneNumber?: string): Promise<boolean> => {
  console.log(`📧 Auto-subscribing user to financial alerts: ${email}`);
  
  try {
    // Subscribe email
    await snsClient.send(new SubscribeCommand({
      TopicArn: SNS_TOPICS.FINANCIAL_ALERTS,
      Protocol: 'email',
      Endpoint: email
    }));
    
    console.log('✅ Email subscription created');
    
    // Subscribe SMS if phone number provided
    if (phoneNumber) {
      // Format phone number (ensure it starts with +)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;
      
      await snsClient.send(new SubscribeCommand({
        TopicArn: SNS_TOPICS.FINANCIAL_ALERTS,
        Protocol: 'sms',
        Endpoint: formattedPhone
      }));
      
      console.log('✅ SMS subscription created');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to subscribe user to alerts:', error);
    return false;
  }
};

// Main notification function
export const sendFinancialAlert = async (data: NotificationData): Promise<boolean> => {
  console.log(`📢 Sending financial alert to user ${data.userId}`);
  console.log(`💰 Expense ratio: ${data.expenseRatio}%`);
  
  let success = false;
  
  try {
    switch (data.notificationPreference) {
      case 'email':
        success = await sendEmailNotification(data);
        break;
        
      case 'sms':
        success = await sendSMSNotification(data);
        break;
        
      case 'both':
        const emailSuccess = await sendEmailNotification(data);
        const smsSuccess = await sendSMSNotification(data);
        success = emailSuccess || smsSuccess; // Success if at least one works
        break;
        
      default:
        console.log('⚠️ No notification preference set, defaulting to email');
        success = await sendEmailNotification(data);
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error sending financial alert:', error);
    return false;
  }
};
