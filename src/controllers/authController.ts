import { Request, Response } from 'express';
import { PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TABLES } from '../config/dynamodb';
import { User, UserProfile } from '../models/User';
import { subscribeUserToAlerts } from '../services/notificationService';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Register a new user (Cognito handles actual registration)
export const register = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      firstName, 
      lastName, 
      phoneNumber,
      businessName,
      businessType,
      businessLocation,
      monthlyRevenue,
      teamSize,
      startingBalance,
      expectedMonthlyExpense,
      expectedMonthlyIncome,
      financialGoals,
      notificationPreference
    } = req.body;

    // Debug: Log the entire user object from token
    console.log('🔍 Full req.user object:', JSON.stringify(req.user, null, 2));
    
    // Get userId from JWT token - try different possible fields
    const userId = req.user?.sub || req.user?.cognito?.username || req.user?.username;
    
    console.log('👤 Extracted userId:', userId);

    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID not found in token',
        debug: {
          userObject: req.user,
          availableFields: Object.keys(req.user || {})
        }
      });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const now = new Date().toISOString();
    const user: User = {
      userId,
      email,
      firstName,
      lastName,
      phoneNumber,
      businessName,
      businessType,
      businessLocation,
      monthlyRevenue,
      teamSize,
      startingBalance,
      expectedMonthlyExpense,
      expectedMonthlyIncome,
      financialGoals,
      notificationPreference,
      createdAt: now,
      updatedAt: now
    };

    await dynamoDb.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: user,
      ConditionExpression: 'attribute_not_exists(userId)'
    }));

    // Auto-subscribe user to financial alerts
    try {
      await subscribeUserToAlerts(user.email, user.phoneNumber);
      console.log('✅ User auto-subscribed to financial alerts');
    } catch (subscriptionError) {
      console.error('⚠️ Failed to auto-subscribe user:', subscriptionError);
      // Don't fail registration if subscription fails
    }

    res.status(201).json({
      message: 'User profile created successfully',
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        businessName: user.businessName,
        businessType: user.businessType,
        startingBalance: user.startingBalance
      }
    });
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return res.status(400).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Login user (Cognito handles actual login)
export const login = async (req: Request, res: Response) => {
  // This endpoint is no longer needed as Cognito handles authentication
  // But keeping it for compatibility - it can return user info
  res.json({
    message: 'Please use Cognito authentication. This endpoint is deprecated.',
    info: 'Use AWS Cognito SDK to authenticate users'
  });
};

// Get user profile
export const getProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.sub;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    const result = await dynamoDb.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { userId }
    }));

    if (!result.Item) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userProfile: UserProfile = {
      userId: result.Item.userId,
      email: result.Item.email,
      firstName: result.Item.firstName,
      lastName: result.Item.lastName,
      phoneNumber: result.Item.phoneNumber,
      businessName: result.Item.businessName,
      businessType: result.Item.businessType,
      businessLocation: result.Item.businessLocation,
      monthlyRevenue: result.Item.monthlyRevenue,
      teamSize: result.Item.teamSize,
      startingBalance: result.Item.startingBalance,
      expectedMonthlyExpense: result.Item.expectedMonthlyExpense,
      expectedMonthlyIncome: result.Item.expectedMonthlyIncome,
      financialGoals: result.Item.financialGoals,
      notificationPreference: result.Item.notificationPreference
    };

    res.json({ user: userProfile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { 
      firstName, 
      lastName, 
      phoneNumber,
      businessName,
      businessType,
      businessLocation,
      monthlyRevenue,
      teamSize,
      startingBalance,
      expectedMonthlyExpense,
      expectedMonthlyIncome,
      financialGoals,
      notificationPreference
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    const now = new Date().toISOString();
    
    await dynamoDb.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { userId },
      UpdateExpression: `SET 
        firstName = :firstName, 
        lastName = :lastName, 
        phoneNumber = :phoneNumber,
        businessName = :businessName,
        businessType = :businessType,
        businessLocation = :businessLocation,
        monthlyRevenue = :monthlyRevenue,
        teamSize = :teamSize,
        startingBalance = :startingBalance,
        expectedMonthlyExpense = :expectedMonthlyExpense,
        expectedMonthlyIncome = :expectedMonthlyIncome,
        financialGoals = :financialGoals,
        notificationPreference = :notificationPreference,
        updatedAt = :updatedAt`,
      ExpressionAttributeValues: {
        ':firstName': firstName,
        ':lastName': lastName,
        ':phoneNumber': phoneNumber,
        ':businessName': businessName,
        ':businessType': businessType,
        ':businessLocation': businessLocation,
        ':monthlyRevenue': monthlyRevenue,
        ':teamSize': teamSize,
        ':startingBalance': startingBalance,
        ':expectedMonthlyExpense': expectedMonthlyExpense,
        ':expectedMonthlyIncome': expectedMonthlyIncome,
        ':financialGoals': financialGoals,
        ':notificationPreference': notificationPreference,
        ':updatedAt': now
      },
      ConditionExpression: 'attribute_exists(userId)'
    }));

    res.json({ 
      message: 'Profile updated successfully',
      user: { 
        userId, 
        firstName, 
        lastName, 
        phoneNumber, 
        businessName,
        businessType,
        startingBalance
      }
    });
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
};
