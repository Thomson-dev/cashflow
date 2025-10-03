import { Request, Response } from 'express';
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TABLES } from '../config/dynamodb';

// Calculate health score based on income vs expenses
const calculateHealthScore = (income: number, expenses: number): number => {
  if (income === 0) return expenses === 0 ? 100 : 0;
  const ratio = (income - expenses) / income;
  return Math.max(0, Math.min(100, Math.round((ratio + 1) * 50)));
};

// Get date ranges for current and previous month
const getMonthRanges = () => {
  const now = new Date();
  
  // Current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  // Previous month
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  
  return {
    current: {
      start: currentMonthStart.toISOString(),
      end: currentMonthEnd.toISOString()
    },
    previous: {
      start: prevMonthStart.toISOString(),
      end: prevMonthEnd.toISOString()
    }
  };
};

// Calculate percentage change
const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const getDashboard = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    const ranges = getMonthRanges();

    // Get user profile for current balance
    const userResult = await dynamoDb.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { userId }
    }));

    const currentBalance = userResult.Item?.startingBalance || 0;

    // Get current month transactions
    const currentMonthResult = await dynamoDb.send(new QueryCommand({
      TableName: TABLES.TRANSACTIONS,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#date BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':startDate': ranges.current.start,
        ':endDate': ranges.current.end
      }
    }));

    // Get previous month transactions
    const previousMonthResult = await dynamoDb.send(new QueryCommand({
      TableName: TABLES.TRANSACTIONS,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#date BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':startDate': ranges.previous.start,
        ':endDate': ranges.previous.end
      }
    }));

    // Calculate current month metrics
    const currentTransactions = currentMonthResult.Items || [];
    const currentIncome = currentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const currentExpenses = currentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate previous month metrics
    const previousTransactions = previousMonthResult.Items || [];
    const previousIncome = previousTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const previousExpenses = previousTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate health scores
    const currentHealthScore = calculateHealthScore(currentIncome, currentExpenses);
    const previousHealthScore = calculateHealthScore(previousIncome, previousExpenses);

    // Calculate percentage changes
    const incomeChange = calculatePercentageChange(currentIncome, previousIncome);
    const expenseChange = calculatePercentageChange(currentExpenses, previousExpenses);
    const healthScoreChange = calculatePercentageChange(currentHealthScore, previousHealthScore);

    // For balance change, we'll compare current balance to what it was at start of month
    // This is simplified - in reality you'd track historical balances
    const estimatedPreviousBalance = currentBalance - (currentIncome - currentExpenses);
    const balanceChange = calculatePercentageChange(currentBalance, estimatedPreviousBalance);

    res.json({
      dashboard: {
        monthlyIncome: {
          value: currentIncome,
          percentageChange: incomeChange,
          trend: incomeChange >= 0 ? 'up' : 'down'
        },
        monthlyExpense: {
          value: currentExpenses,
          percentageChange: expenseChange,
          trend: expenseChange >= 0 ? 'up' : 'down'
        },
        currentBalance: {
          value: currentBalance,
          percentageChange: balanceChange,
          trend: balanceChange >= 0 ? 'up' : 'down'
        },
        healthScore: {
          value: currentHealthScore,
          percentageChange: healthScoreChange,
          trend: healthScoreChange >= 0 ? 'up' : 'down'
        }
      },
      period: {
        current: ranges.current,
        previous: ranges.previous
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
