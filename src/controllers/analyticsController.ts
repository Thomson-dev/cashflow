import { Request, Response } from 'express';
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TABLES } from '../config/dynamodb';

// Get date ranges for specified period
const getDateRanges = (period: string) => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return {
    start: startDate.toISOString(),
    end: now.toISOString()
  };
};

// Group transactions by date
const groupTransactionsByDate = (transactions: any[]) => {
  const grouped: { [key: string]: { income: number; expense: number; transactions: any[] } } = {};

  transactions.forEach(transaction => {
    const date = transaction.date.split('T')[0]; // Get YYYY-MM-DD
    
    if (!grouped[date]) {
      grouped[date] = { income: 0, expense: 0, transactions: [] };
    }

    if (transaction.type === 'income') {
      grouped[date].income += transaction.amount;
    } else {
      grouped[date].expense += transaction.amount;
    }
    
    grouped[date].transactions.push(transaction);
  });

  return grouped;
};

// Generate chart data with cumulative balance
const generateChartData = (groupedData: any, startingBalance: number) => {
  const sortedDates = Object.keys(groupedData).sort();
  let cumulativeBalance = startingBalance;
  
  return sortedDates.map(date => {
    const dayData = groupedData[date];
    const net = dayData.income - dayData.expense;
    cumulativeBalance += net;

    return {
      date,
      income: dayData.income,
      expense: dayData.expense,
      net,
      cumulativeBalance
    };
  });
};

// Calculate category breakdown
const calculateCategoryBreakdown = (transactions: any[]) => {
  const incomeCategories: { [key: string]: number } = {};
  const expenseCategories: { [key: string]: number } = {};

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      incomeCategories[transaction.category] = (incomeCategories[transaction.category] || 0) + transaction.amount;
      totalIncome += transaction.amount;
    } else {
      expenseCategories[transaction.category] = (expenseCategories[transaction.category] || 0) + transaction.amount;
      totalExpenses += transaction.amount;
    }
  });

  const formatCategories = (categories: { [key: string]: number }, total: number) => {
    return Object.entries(categories)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  return {
    income: formatCategories(incomeCategories, totalIncome),
    expense: formatCategories(expenseCategories, totalExpenses)
  };
};

export const getAnalytics = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { period = '30d' } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    // Validate period
    const validPeriods = ['7d', '30d', '90d', '1y'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ 
        error: 'Invalid period. Use: 7d, 30d, 90d, or 1y' 
      });
    }

    const dateRange = getDateRanges(period);

    // Get user's current balance
    const userResult = await dynamoDb.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { userId }
    }));

    const currentBalance = userResult.Item?.startingBalance || 0;

    // Get transactions for the period
    const result = await dynamoDb.send(new QueryCommand({
      TableName: TABLES.TRANSACTIONS,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#date BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':startDate': dateRange.start,
        ':endDate': dateRange.end
      }
    }));

    const transactions = result.Items || [];

    // Calculate summary
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netAmount = totalIncome - totalExpenses;

    // Generate chart data
    const groupedData = groupTransactionsByDate(transactions);
    const chartData = generateChartData(groupedData, currentBalance - netAmount);

    // Calculate category breakdown
    const categoryBreakdown = calculateCategoryBreakdown(transactions);

    res.json({
      period,
      dateRange: {
        from: dateRange.start,
        to: dateRange.end
      },
      summary: {
        totalIncome,
        totalExpenses,
        netAmount,
        transactionCount: transactions.length
      },
      chartData,
      categoryBreakdown
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
