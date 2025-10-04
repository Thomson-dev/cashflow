import { Request, Response } from 'express';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TABLES } from '../config/dynamodb';
import { bedrockClient, DEFAULT_MODEL } from '../config/bedrock';

// Build user financial context for chat
const buildChatContext = async (userId: string) => {
  try {
    // Get user profile
    const userResult = await dynamoDb.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { userId }
    }));

    const user = userResult.Item;
    if (!user) return null;

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const transactionsResult = await dynamoDb.send(new QueryCommand({
      TableName: TABLES.TRANSACTIONS,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#date >= :startDate',
      ExpressionAttributeNames: { '#date': 'date' },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':startDate': thirtyDaysAgo
      },
      Limit: 10
    }));

    const transactions = transactionsResult.Items || [];
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return {
      businessName: user.businessName || 'Your Business',
      businessType: user.businessType || 'Business',
      currentBalance: user.startingBalance || 0,
      recentIncome: totalIncome,
      recentExpenses: totalExpenses,
      transactionCount: transactions.length
    };
  } catch (error) {
    console.error('❌ Error building chat context:', error);
    return null;
  }
};

// Generate chat response
const generateChatResponse = async (userMessage: string, context: any) => {
  const systemPrompt = `You are a helpful financial advisor for ${context?.businessName || 'a business'}.

FINANCIAL CONTEXT:
- Business: ${context?.businessName} (${context?.businessType})
- Current Balance: $${context?.currentBalance?.toLocaleString() || '0'}
- Recent Income (30 days): $${context?.recentIncome?.toLocaleString() || '0'}
- Recent Expenses (30 days): $${context?.recentExpenses?.toLocaleString() || '0'}

GUIDELINES:
- Be helpful and conversational
- Reference actual financial data when relevant
- Keep responses under 150 words
- Focus on practical advice
- Don't give investment or tax advice

USER QUESTION: ${userMessage}

Response:`;

  try {
    const command = new InvokeModelCommand({
      modelId: DEFAULT_MODEL,
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 300,
        messages: [{ role: "user", content: systemPrompt }]
      })
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  } catch (error: any) {
    console.error('❌ Bedrock chat error:', error);
    return `I'm here to help with your financial questions! Based on your account, you have $${context?.currentBalance?.toLocaleString() || '0'} available. What would you like to know?`;
  }
};

export const sendMessage = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { message } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('💬 Chat message from user:', userId);
    console.log('📝 Message:', message);

    // Build context and generate response
    const context = await buildChatContext(userId);
    const aiResponse = await generateChatResponse(message, context);

    res.json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('💥 Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: error.message 
    });
  }
};
