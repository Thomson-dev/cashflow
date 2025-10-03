export interface User {
  userId: string;        // Cognito sub (Primary Key)
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  
  // Business Information
  businessName?: string;
  businessType?: string;
  businessLocation?: string;
  monthlyRevenue?: number;
  teamSize?: number;
  startingBalance?: number;
  expectedMonthlyExpense?: number;
  expectedMonthlyIncome?: number;
  financialGoals?: string[];
  notificationPreference?: 'email' | 'sms' | 'both';
  
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  businessName?: string;
  businessType?: string;
  businessLocation?: string;
  monthlyRevenue?: number;
  teamSize?: number;
  startingBalance?: number;
  expectedMonthlyExpense?: number;
  expectedMonthlyIncome?: number;
  financialGoals?: string[];
  notificationPreference?: 'email' | 'sms' | 'both';
}
