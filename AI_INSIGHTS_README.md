# AI Insights Integration Guide

Complete guide for integrating AI-powered financial insights into your frontend application.

## Overview

The AI Insights feature uses AWS Bedrock (Claude 3 Haiku) to analyze user financial data and provide personalized recommendations, spending insights, cash flow tips, and growth suggestions.

## API Endpoint

### Get AI Insights
```http
GET /api/insights
Authorization: Bearer <cognito-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "insights": {
      "recommendations": [
        {
          "title": "Optimize Office Supplies Spending",
          "description": "Your office supplies represent 30% of monthly expenses ($800). Consider bulk purchasing or finding alternative suppliers to reduce costs by 15-20%.",
          "priority": "high",
          "category": "spending"
        },
        {
          "title": "Build Emergency Fund",
          "description": "With $3,000 monthly surplus, allocate $1,000 to emergency savings to reach 6 months of expenses coverage.",
          "priority": "medium", 
          "category": "savings"
        },
        {
          "title": "Invest Surplus Cash",
          "description": "Your consistent positive cash flow suggests opportunity for low-risk investments to grow wealth.",
          "priority": "low",
          "category": "growth"
        }
      ],
      "spendingInsights": [
        {
          "insight": "Marketing expenses increased 40% this month compared to average",
          "impact": "negative",
          "suggestion": "Review marketing ROI and optimize campaigns with lower cost-per-acquisition"
        },
        {
          "insight": "Office supplies spending is 25% above industry average for your business size",
          "impact": "negative", 
          "suggestion": "Implement inventory management and bulk purchasing to reduce per-unit costs"
        }
      ],
      "cashFlowTip": {
        "title": "Optimize Payment Terms",
        "description": "Negotiate 30-day payment terms with clients and 45-day terms with suppliers to improve cash flow timing",
        "potentialSavings": "$500-800 monthly in improved cash flow"
      },
      "growthSuggestion": {
        "title": "Service Diversification",
        "description": "Your consulting income is stable. Consider adding digital products or courses to create passive revenue streams",
        "timeframe": "medium term"
      }
    },
    "context": {
      "analysisDate": "2024-10-04T12:36:57.730Z",
      "dataRange": "90 days",
      "transactionCount": 24
    }
  }
}
```

## Frontend Integration

### 1. API Service

```javascript
// services/insightsService.js
class InsightsService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async getInsights() {
    try {
      const response = await this.apiClient.get('/api/insights');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      throw error;
    }
  }
}

export default InsightsService;
```

### 2. React Hook

```javascript
// hooks/useInsights.js
import { useState, useEffect } from 'react';
import { insightsService } from '../services';

export const useInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await insightsService.getInsights();
      setInsights(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return { insights, loading, error, refetch: fetchInsights };
};
```

### 3. Insights Dashboard Component

```jsx
// components/InsightsDashboard.jsx
import React from 'react';
import { useInsights } from '../hooks/useInsights';

const InsightsDashboard = () => {
  const { insights, loading, error } = useInsights();

  if (loading) return <InsightsLoader />;
  if (error) return <InsightsError error={error} />;
  if (!insights) return null;

  return (
    <div className="insights-dashboard">
      <div className="insights-header">
        <h2>AI Financial Insights</h2>
        <p>Analysis based on {insights.context.transactionCount} transactions over {insights.context.dataRange}</p>
      </div>

      <div className="insights-grid">
        <RecommendationsCard recommendations={insights.insights.recommendations} />
        <SpendingInsightsCard insights={insights.insights.spendingInsights} />
        <CashFlowTipCard tip={insights.insights.cashFlowTip} />
        <GrowthSuggestionCard suggestion={insights.insights.growthSuggestion} />
      </div>
    </div>
  );
};
```

### 4. Individual Insight Components

```jsx
// components/RecommendationsCard.jsx
const RecommendationsCard = ({ recommendations }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'spending': return '💰';
      case 'savings': return '🏦';
      case 'growth': return '📈';
      case 'cash-flow': return '💸';
      default: return '💡';
    }
  };

  return (
    <div className="insight-card">
      <h3>💡 Recommendations</h3>
      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <div key={index} className="recommendation-item">
            <div className="recommendation-header">
              <span className="category-icon">{getCategoryIcon(rec.category)}</span>
              <h4>{rec.title}</h4>
              <span className={`priority-badge ${getPriorityColor(rec.priority)}`}>
                {rec.priority}
              </span>
            </div>
            <p className="recommendation-description">{rec.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// components/SpendingInsightsCard.jsx
const SpendingInsightsCard = ({ insights }) => {
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '📊';
    }
  };

  return (
    <div className="insight-card">
      <h3>📊 Spending Insights</h3>
      <div className="insights-list">
        {insights.map((insight, index) => (
          <div key={index} className="insight-item">
            <div className="insight-header">
              <span className="impact-icon">{getImpactIcon(insight.impact)}</span>
              <span className={`impact-text ${getImpactColor(insight.impact)}`}>
                {insight.insight}
              </span>
            </div>
            <p className="insight-suggestion">💡 {insight.suggestion}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// components/CashFlowTipCard.jsx
const CashFlowTipCard = ({ tip }) => (
  <div className="insight-card">
    <h3>💸 Cash Flow Optimization</h3>
    <div className="tip-content">
      <h4>{tip.title}</h4>
      <p>{tip.description}</p>
      <div className="potential-savings">
        <span className="savings-label">Potential Impact:</span>
        <span className="savings-amount">{tip.potentialSavings}</span>
      </div>
    </div>
  </div>
);

// components/GrowthSuggestionCard.jsx
const GrowthSuggestionCard = ({ suggestion }) => {
  const getTimeframeColor = (timeframe) => {
    switch (timeframe) {
      case 'short term': return 'text-green-600 bg-green-50';
      case 'medium term': return 'text-yellow-600 bg-yellow-50';
      case 'long term': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="insight-card">
      <h3>🚀 Growth Opportunity</h3>
      <div className="growth-content">
        <div className="growth-header">
          <h4>{suggestion.title}</h4>
          <span className={`timeframe-badge ${getTimeframeColor(suggestion.timeframe)}`}>
            {suggestion.timeframe}
          </span>
        </div>
        <p>{suggestion.description}</p>
      </div>
    </div>
  );
};
```

### 5. Loading and Error States

```jsx
// components/InsightsLoader.jsx
const InsightsLoader = () => (
  <div className="insights-loader">
    <div className="loader-content">
      <div className="ai-icon">🤖</div>
      <h3>Analyzing Your Financial Data</h3>
      <p>Our AI is reviewing your transactions and generating personalized insights...</p>
      <div className="loading-spinner"></div>
    </div>
  </div>
);

// components/InsightsError.jsx
const InsightsError = ({ error, onRetry }) => (
  <div className="insights-error">
    <div className="error-content">
      <div className="error-icon">⚠️</div>
      <h3>Unable to Generate Insights</h3>
      <p>{error || 'Something went wrong while analyzing your data.'}</p>
      <button onClick={onRetry} className="retry-button">
        Try Again
      </button>
    </div>
  </div>
);
```

## CSS Styling

```css
/* styles/insights.css */
.insights-dashboard {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.insights-header {
  margin-bottom: 32px;
  text-align: center;
}

.insights-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.insights-header p {
  color: #6b7280;
  font-size: 14px;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.insight-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.insight-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommendation-item {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
}

.recommendation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.recommendation-header h4 {
  font-weight: 600;
  color: #1f2937;
  flex: 1;
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.recommendation-description {
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
}

.insight-item {
  padding: 12px;
  border-left: 3px solid #e5e7eb;
  margin-bottom: 12px;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.insight-suggestion {
  color: #4b5563;
  font-size: 14px;
  font-style: italic;
}

.potential-savings {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f0fdf4;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.savings-amount {
  font-weight: 600;
  color: #16a34a;
}

.timeframe-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.insights-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loader-content {
  text-align: center;
}

.ai-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 16px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.insights-error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 16px;
}

.retry-button:hover {
  background: #2563eb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .insights-grid {
    grid-template-columns: 1fr;
  }
  
  .insights-dashboard {
    padding: 16px;
  }
  
  .recommendation-header {
    flex-wrap: wrap;
  }
}
```

## Integration Steps

### 1. Add to Dashboard
```jsx
// pages/Dashboard.jsx
import InsightsDashboard from '../components/InsightsDashboard';

const Dashboard = () => (
  <div className="dashboard">
    <DashboardHeader />
    <MetricsCards />
    <InsightsDashboard />  {/* Add here */}
    <RecentTransactions />
  </div>
);
```

### 2. Add Insights Tab
```jsx
// components/Navigation.jsx
const tabs = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Transactions', href: '/transactions' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'AI Insights', href: '/insights' },  // New tab
  { name: 'Settings', href: '/settings' }
];
```

### 3. Standalone Insights Page
```jsx
// pages/InsightsPage.jsx
import React from 'react';
import InsightsDashboard from '../components/InsightsDashboard';

const InsightsPage = () => (
  <div className="page-container">
    <div className="page-header">
      <h1>AI Financial Insights</h1>
      <p>Personalized recommendations powered by artificial intelligence</p>
    </div>
    <InsightsDashboard />
  </div>
);

export default InsightsPage;
```

## Error Handling

### Common Errors
- **No Data**: User has insufficient transaction history
- **Bedrock Access**: AI model access not enabled
- **Rate Limiting**: Too many requests to AI service
- **Network Issues**: API connectivity problems

### Error Messages
```javascript
const ERROR_MESSAGES = {
  NO_DATA: 'Add more transactions to get personalized insights',
  ACCESS_DENIED: 'AI insights temporarily unavailable',
  RATE_LIMIT: 'Please wait before requesting new insights',
  NETWORK_ERROR: 'Check your internet connection'
};
```

## Performance Optimization

### Caching Strategy
```javascript
// Cache insights for 1 hour
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const getCachedInsights = () => {
  const cached = localStorage.getItem('ai_insights');
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  return null;
};

const setCachedInsights = (data) => {
  localStorage.setItem('ai_insights', JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};
```

### Loading States
- Show skeleton loading for better UX
- Display progress indicators for AI processing
- Implement retry mechanisms for failed requests

## Testing

### Unit Tests
```javascript
// __tests__/InsightsDashboard.test.js
import { render, screen } from '@testing-library/react';
import InsightsDashboard from '../components/InsightsDashboard';

test('displays recommendations correctly', () => {
  const mockInsights = {
    insights: {
      recommendations: [
        { title: 'Test Rec', description: 'Test desc', priority: 'high', category: 'spending' }
      ]
    }
  };
  
  render(<InsightsDashboard insights={mockInsights} />);
  expect(screen.getByText('Test Rec')).toBeInTheDocument();
});
```

### Integration Tests
```javascript
// Test API integration
test('fetches insights from API', async () => {
  const mockResponse = { data: { insights: {...} } };
  jest.spyOn(api, 'get').mockResolvedValue(mockResponse);
  
  const { result } = renderHook(() => useInsights());
  await waitFor(() => expect(result.current.insights).toBeTruthy());
});
```

## Deployment Notes

### Environment Variables
```bash
# Required for AI insights
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

### Feature Flags
```javascript
// Enable/disable AI insights
const FEATURES = {
  AI_INSIGHTS: process.env.REACT_APP_ENABLE_AI_INSIGHTS === 'true'
};
```

### Monitoring
- Track insight generation success/failure rates
- Monitor API response times
- Log user engagement with recommendations

## Cost Management

### Usage Optimization
- Cache insights for 1-24 hours
- Batch process multiple users
- Use cheaper models for simple insights
- Implement usage quotas per user

### Estimated Costs
- **Per insight request**: ~$0.002-0.005
- **1000 users/month**: ~$10-25
- **Heavy usage (daily insights)**: ~$50-150/month

Your AI insights feature is now ready for frontend integration! 🚀
