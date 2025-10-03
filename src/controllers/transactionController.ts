import { Request, Response } from 'express';
import { PutCommand, QueryCommand, DeleteCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TABLES } from '../config/dynamodb';
import { Transaction } from '../models/Transaction';
import { randomUUID } from 'crypto';

// Categorize transaction based on type or description
function categorizeTransaction(description: string, amount: number, type: string): string {
  if (type === 'income') return 'General Income';
  if (type === 'expense') return 'General Expense';
  return 'Uncategorized';
}

export const createTransaction = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { type, amount, description, category, date } = req.body;
    const userId = req.user?.sub;

    // Input validation
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Invalid or missing transaction type' });
    }
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Description is required' });
    }

    const now = new Date().toISOString();
    const finalCategory = category || categorizeTransaction(description, amount, type);

    const transaction: Transaction = {
      transactionId: randomUUID(),
      userId,
      amount,
      description,
      category: finalCategory,
      type: type as 'income' | 'expense',
      date: date || now,
      createdAt: now,
      updatedAt: now
    };

    // Save transaction
    await dynamoDb.send(new PutCommand({
      TableName: TABLES.TRANSACTIONS,
      Item: transaction
    }));

    // Update user balance
    const balanceChange = type === 'income' ? amount : -amount;
    
    try {
      await dynamoDb.send(new UpdateCommand({
        TableName: TABLES.USERS,
        Key: { userId },
        UpdateExpression: 'ADD startingBalance :balanceChange SET updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':balanceChange': balanceChange,
          ':updatedAt': now
        },
        ConditionExpression: 'attribute_exists(userId)'
      }));
    } catch (balanceError) {
      // If user doesn't exist or doesn't have startingBalance, set it
      await dynamoDb.send(new UpdateCommand({
        TableName: TABLES.USERS,
        Key: { userId },
        UpdateExpression: 'SET startingBalance = if_not_exists(startingBalance, :zero) + :balanceChange, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':balanceChange': balanceChange,
          ':updatedAt': now
        }
      }));
    }

    // Get updated user balance
    const userResult = await dynamoDb.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { userId }
    }));

    const currentBalance = userResult.Item?.startingBalance || 0;

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction,
      currentBalance
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactions = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    const result = await dynamoDb.send(new QueryCommand({
      TableName: TABLES.TRANSACTIONS,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Most recent first
    }));

    res.json({
      transactions: result.Items || [],
      count: result.Count || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionsByPeriod = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { period } = req.params;

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

    // Calculate date range
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

    const result = await dynamoDb.send(new QueryCommand({
      TableName: TABLES.TRANSACTIONS,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#date >= :startDate',
      ExpressionAttributeNames: {
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':startDate': startDate.toISOString()
      },
      ScanIndexForward: false // Most recent first
    }));

    // Calculate summary
    const transactions = result.Items || [];
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      period,
      dateRange: {
        from: startDate.toISOString(),
        to: now.toISOString()
      },
      summary: {
        totalIncome: income,
        totalExpenses: expenses,
        netAmount: income - expenses,
        transactionCount: transactions.length
      },
      transactions,
      count: result.Count || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTransaction = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    if (!id) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    // First, get the transaction to verify ownership and get amount/type
    const getResult = await dynamoDb.send(new GetCommand({
      TableName: TABLES.TRANSACTIONS,
      Key: { transactionId: id }
    }));

    if (!getResult.Item) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Verify the transaction belongs to the user
    if (getResult.Item.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this transaction' });
    }

    const transaction = getResult.Item;
    const now = new Date().toISOString();

    // Delete the transaction
    await dynamoDb.send(new DeleteCommand({
      TableName: TABLES.TRANSACTIONS,
      Key: { transactionId: id }
    }));

    // Reverse the balance change
    const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
    
    await dynamoDb.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { userId },
      UpdateExpression: 'ADD startingBalance :balanceChange SET updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':balanceChange': balanceChange,
        ':updatedAt': now
      },
      ConditionExpression: 'attribute_exists(userId)'
    }));

    // Get updated user balance
    const userResult = await dynamoDb.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { userId }
    }));

    const currentBalance = userResult.Item?.startingBalance || 0;

    res.json({ 
      message: 'Transaction deleted successfully',
      transactionId: id,
      currentBalance
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};