import { Request, Response } from 'express';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TABLES } from '../config/dynamodb';
import { bedrockClient, DEFAULT_MODEL } from '../config/bedrock';

// Build financial context from user data
const buildFinancialContext = async (userId: string) => {
  console.log('📊 Building financial context for user:', userId);
  
  // Get user profile
  const userResult = await dynamoDb.send(new GetCommand({
    TableName: TABLES.USERS,
    Key: { userId }
  }));

  const user = userResult.Item;
  if (!user) {
    throw new Error('User not found');
  }

  // Get last 90 days of transactions
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  
  const transactionsResult = await dynamoDb.send(new QueryCommand({
    TableName: TABLES.TRANSACTIONS,
    IndexName: 'UserIdIndex',
    KeyConditionExpression: 'userId = :userId',
    FilterExpression: '#date >= :startDate',
    ExpressionAttributeNames: {
      '#date': 'date'
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':startDate': ninetyDaysAgo
    }
  }));

  const transactions = transactionsResult.Items || [];

  // Calculate financial metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown
  const categoryTotals: { [key: string]: number } = {};
  transactions.forEach(t => {
    if (t.type === 'expense') {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));

  return {
    businessInfo: {
      name: user.businessName || 'Business',
      type: user.businessType || 'General',
      teamSize: user.teamSize || 1,
      location: user.businessLocation || 'Unknown'
    },
    financials: {
      currentBalance: user.startingBalance || 0,
      monthlyIncome: Math.round(totalIncome / 3), // 90 days average
      monthlyExpenses: Math.round(totalExpenses / 3),
      netCashFlow: Math.round((totalIncome - totalExpenses) / 3),
      topExpenseCategories: topCategories,
      transactionCount: transactions.length
    },
    goals: user.financialGoals || [],
    expectedIncome: user.expectedMonthlyIncome || 0,
    expectedExpenses: user.expectedMonthlyExpense || 0
  };
};

// Generate AI insights using Bedrock
const generateInsights = async (context: any) => {
  console.log('🤖 Generating AI insights...');
  
  const prompt = `You are a financial advisor AI. Analyze this business financial data and provide actionable insights.

BUSINESS CONTEXT:
- Business: ${context.businessInfo.name} (${context.businessInfo.type})
- Team Size: ${context.businessInfo.teamSize}
- Location: ${context.businessInfo.location}

FINANCIAL DATA (Last 90 days average):
- Current Balance: $${context.financials.currentBalance.toLocaleString()}
- Monthly Income: $${context.financials.monthlyIncome.toLocaleString()}
- Monthly Expenses: $${context.financials.monthlyExpenses.toLocaleString()}
- Net Cash Flow: $${context.financials.netCashFlow.toLocaleString()}
- Transaction Count: ${context.financials.transactionCount}

TOP EXPENSE CATEGORIES:
${context.financials.topExpenseCategories.map((cat: any) => `- ${cat.category}: $${cat.amount.toLocaleString()}`).join('\n')}

FINANCIAL GOALS:
${context.goals.length > 0 ? context.goals.map((goal: any) => `- ${goal}`).join('\n') : '- No specific goals set'}

EXPECTATIONS:
- Expected Monthly Income: $${context.expectedIncome.toLocaleString()}
- Expected Monthly Expenses: $${context.expectedExpenses.toLocaleString()}

Please provide:
1. 3 specific, actionable financial recommendations
2. 2 spending pattern insights
3. 1 cash flow optimization tip
4. 1 business growth suggestion

Format as JSON:
{
  "recommendations": [
    {"title": "Title", "description": "Detailed advice", "priority": "high|medium|low", "category": "savings|spending|growth|cash-flow"}
  ],
  "spendingInsights": [
    {"insight": "Pattern observation", "impact": "positive|negative|neutral", "suggestion": "What to do about it"}
  ],
  "cashFlowTip": {
    "title": "Tip title",
    "description": "Detailed explanation",
    "potentialSavings": "Estimated monthly savings"
  },
  "growthSuggestion": {
    "title": "Growth opportunity",
    "description": "How to implement",
    "timeframe": "short|medium|long term"
  }
}`;

  try {
    const command = new InvokeModelCommand({
      modelId: DEFAULT_MODEL,
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    console.log('📤 Sending request to Bedrock...');
    const response = await bedrockClient.send(command);
    
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('📥 Received response from Bedrock');
    
    // Extract the content from Claude's response
    const aiResponse = responseBody.content[0].text;
    
    // Try to parse JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Could not parse JSON from AI response');
    }
  } catch (error: any) {
    console.error('❌ Bedrock API error:', error);
    
    // Fallback insights if AI fails
    return {
      recommendations: [
        {
          title: "Monitor Cash Flow",
          description: `Your current net cash flow is $${context.financials.netCashFlow.toLocaleString()}/month. ${context.financials.netCashFlow > 0 ? 'Consider investing surplus funds.' : 'Focus on reducing expenses or increasing income.'}`,
          priority: "high",
          category: "cash-flow"
        }
      ],
      spendingInsights: [
        {
          insight: `Your top expense category is ${context.financials.topExpenseCategories[0]?.category || 'Unknown'}`,
          impact: "neutral",
          suggestion: "Review if this spending aligns with your business goals"
        }
      ],
      cashFlowTip: {
        title: "Expense Tracking",
        description: "Continue monitoring your expenses to identify optimization opportunities",
        potentialSavings: "5-10% of monthly expenses"
      },
      growthSuggestion: {
        title: "Revenue Diversification",
        description: "Consider adding new revenue streams to reduce dependency on current income sources",
        timeframe: "medium term"
      }
    };
  }
};

export const getInsights = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    console.log('🚀 Starting AI insights generation for user:', userId);

    // Build financial context
    const context = await buildFinancialContext(userId);
    console.log('📊 Financial context built:', JSON.stringify(context, null, 2));

    // Generate AI insights
    const insights = await generateInsights(context);
    console.log('🤖 AI insights generated:', JSON.stringify(insights, null, 2));

    res.json({
      success: true,
      data: {
        insights,
        context: {
          analysisDate: new Date().toISOString(),
          dataRange: '90 days',
          transactionCount: context.financials.transactionCount
        }
      }
    });
  } catch (error: any) {
    console.error('💥 Error generating insights:', error);
    res.status(500).json({ 
      error: 'Failed to generate insights',
      message: error.message 
    });
  }
};
