# 💰 CashFlow - AI-Powered Business Finance Management

A comprehensive business finance management platform with AI-powered insights, real-time notifications, and intelligent financial advisory features.

## 🚀 Overview

CashFlow is a modern financial management API built for small to medium businesses. It combines traditional financial tracking with cutting-edge AI technology to provide personalized insights, automated alerts, and intelligent financial advice.

## ✨ Key Features

### 📊 **Core Financial Management**
- **Transaction Management**: Create, read, update, delete income and expense transactions
- **Real-time Balance Tracking**: Automatic balance calculations and updates
- **Category-based Organization**: Organize transactions by business categories
- **Multi-period Analytics**: View financial data across 7d, 30d, 90d, and yearly periods

### 🤖 **AI-Powered Intelligence**
- **Financial Insights**: AI-generated recommendations using AWS Bedrock (Claude 3 Haiku)
- **Spending Pattern Analysis**: Automated analysis of expense trends and patterns
- **Cash Flow Optimization**: AI suggestions for improving business cash flow
- **Growth Recommendations**: Personalized business growth strategies

### 💬 **Intelligent Chatbot**
- **Context-Aware Assistant**: AI chatbot that knows your financial data
- **Natural Language Queries**: Ask questions about your finances in plain English
- **Real-time Advice**: Get instant financial advice based on your actual data
- **Business-Specific Guidance**: Tailored advice for your business type and size

### 🔔 **Smart Notifications**
- **Automated Alerts**: Email and SMS notifications when expenses approach income levels
- **Threshold Monitoring**: Alerts when expense-to-income ratio exceeds 80%
- **Multi-channel Delivery**: Email, SMS, or both based on user preference
- **Auto-subscription**: Automatic enrollment in alerts upon registration

### 📈 **Advanced Analytics**
- **Dashboard Metrics**: Monthly income, expenses, balance, and health score
- **Trend Analysis**: Percentage changes and trend indicators
- **Chart-ready Data**: Daily breakdowns with cumulative balance tracking
- **Category Breakdowns**: Detailed spending analysis by category with percentages

### 🔐 **Enterprise Security**
- **AWS Cognito Authentication**: Secure user authentication and authorization
- **JWT Token Management**: Stateless authentication with secure token handling
- **User Isolation**: Complete data separation between users
- **IAM Role-based Access**: Fine-grained AWS service permissions

### 📁 **File Management**
- **S3 Integration**: Secure file storage with presigned URLs
- **Document Upload**: Support for PDF and CSV file uploads
- **User-specific Storage**: Organized file storage per user
- **Metadata Tracking**: Complete file lifecycle management

## 🏗️ Architecture

### **Technology Stack**
- **Runtime**: Node.js 18 with TypeScript
- **Framework**: Express.js with CORS support
- **Authentication**: AWS Cognito User Pools
- **Database**: Amazon DynamoDB (NoSQL)
- **AI/ML**: AWS Bedrock (Claude 3 Haiku)
- **Storage**: Amazon S3
- **Notifications**: Amazon SNS
- **Deployment**: AWS ECS Fargate with Application Load Balancer
- **Container**: Docker with Alpine Linux

### **AWS Services Used**
- **Amazon Cognito**: User authentication and management
- **Amazon DynamoDB**: Primary database for all application data
- **Amazon S3**: File storage and document management
- **Amazon Bedrock**: AI-powered insights and chatbot functionality
- **Amazon SNS**: Email and SMS notifications
- **Amazon ECS**: Container orchestration and deployment
- **Amazon ECR**: Container image registry
- **Application Load Balancer**: Traffic distribution and SSL termination
- **AWS IAM**: Security and access management

### **Database Schema**
```
Users Table (cashflow-users)
├── userId (PK) - Unique user identifier
├── email - User email address
├── businessInfo - Company details and preferences
├── financialSettings - Budget and goal configurations
└── notificationPreferences - Alert settings

Transactions Table (cashflow-transactions)
├── transactionId (PK) - Unique transaction identifier
├── userId (GSI) - User association
├── amount - Transaction amount
├── type - Income or expense
├── category - Business category
├── date - Transaction date
└── metadata - Additional transaction details

File Uploads Table (cashflow-file-uploads)
├── fileId (PK) - Unique file identifier
├── userId (GSI) - User association
├── s3Key - S3 storage location
├── metadata - File information
└── status - Upload status tracking
```

## 🔌 API Endpoints

### **Authentication Endpoints**
```http
POST /api/auth/register          # Create user profile
GET  /api/auth/user/profile      # Get user profile
PUT  /api/auth/user/profile      # Update user profile
```

### **Transaction Management**
```http
GET    /api/transactions                    # Get all transactions
POST   /api/transactions                    # Create transaction
DELETE /api/transactions/:id                # Delete transaction
GET    /api/transactions/period/:period     # Get transactions by period (7d, 30d, 90d, 1y)
```

### **Analytics & Insights**
```http
GET /api/dashboard              # Dashboard hero metrics with trends
GET /api/analytics/:period      # Detailed analytics with charts and breakdowns
GET /api/insights              # AI-powered financial recommendations
```

### **AI Chatbot**
```http
POST /api/chat/message         # Send message to financial assistant
```

### **File Management**
```http
POST /api/file-upload/presigned-url    # Get presigned upload URL
POST /api/file-upload/confirm-upload   # Confirm file upload
GET  /api/file-upload/files            # List user files
```

### **System Endpoints**
```http
GET /health                    # Health check
GET /api/hello                # API status
GET /api/db-status            # Database connectivity
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18 or higher
- AWS Account with appropriate permissions
- AWS CLI configured
- Docker (for containerization)

### **Local Development Setup**

1. **Clone the repository**
```bash
git clone <repository-url>
cd cashflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your AWS configuration
```

4. **Set up AWS resources**
```bash
# Create DynamoDB tables
aws dynamodb create-table --cli-input-json file://dynamodb-tables.json

# Create S3 bucket
aws s3 mb s3://your-cashflow-bucket

# Create SNS topic
aws sns create-topic --name financial-alerts

# Create Cognito User Pool (via AWS Console)
```

5. **Run development server**
```bash
npm run dev
```

### **Environment Variables**
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# AWS Configuration
AWS_REGION=us-east-1

# Cognito Configuration
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX

# DynamoDB Tables
USERS_TABLE=cashflow-users
TRANSACTIONS_TABLE=cashflow-transactions
FILE_UPLOADS_TABLE=cashflow-file-uploads

# S3 Configuration
S3_BUCKET_NAME=your-cashflow-bucket

# SNS Configuration
SNS_FINANCIAL_ALERTS_TOPIC=arn:aws:sns:us-east-1:ACCOUNT:financial-alerts
```

## 🐳 Docker Deployment

### **Build and Run Locally**
```bash
# Build Docker image
docker build -t cashflow-api .

# Run with environment file
docker run -d -p 3000:3000 --env-file .env cashflow-api

# Test the deployment
curl http://localhost:3000/health
```

### **Deploy to AWS ECR**
```bash
# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create ECR repository
aws ecr create-repository --repository-name cashflow-api --region us-east-1

# Build and tag image
docker build -t cashflow-api .
docker tag cashflow-api:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cashflow-api:latest

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cashflow-api:latest
```

## ☁️ AWS ECS Deployment

### **ECS Task Definition**
- **Launch Type**: AWS Fargate
- **CPU**: 256 (.25 vCPU)
- **Memory**: 512 MB
- **Port**: 3000
- **Health Check**: `/health` endpoint

### **ECS Service Configuration**
- **Desired Count**: 1 (scalable)
- **Load Balancer**: Application Load Balancer
- **Auto Scaling**: Based on CPU/memory utilization
- **Rolling Updates**: Zero-downtime deployments

### **Security Configuration**
- **VPC**: Private subnets with NAT Gateway
- **Security Groups**: Port 3000 from ALB only
- **IAM Roles**: Task execution and task roles with minimal permissions
- **Secrets**: Environment variables via ECS task definition

## 🤖 AI Features Deep Dive

### **Financial Insights**
The AI insights feature analyzes user financial data and provides:
- **Spending Recommendations**: Based on category analysis and trends
- **Cash Flow Optimization**: Suggestions for improving business cash flow
- **Growth Opportunities**: AI-identified areas for business expansion
- **Risk Alerts**: Early warning for potential financial issues

### **Intelligent Chatbot**
The financial assistant chatbot offers:
- **Context Awareness**: Knows user's current financial situation
- **Natural Conversations**: Understands financial questions in plain English
- **Real-time Analysis**: Provides instant insights based on actual data
- **Personalized Advice**: Tailored recommendations for specific business types

### **AI Model Configuration**
- **Model**: Claude 3 Haiku (cost-optimized)
- **Provider**: AWS Bedrock
- **Token Limits**: 300-2000 tokens per request
- **Cost**: ~$0.001-0.005 per interaction
- **Fallback**: Graceful degradation with static responses

## 📊 Analytics & Reporting

### **Dashboard Metrics**
- **Monthly Income**: Current month income with percentage change
- **Monthly Expenses**: Current month expenses with trend analysis
- **Current Balance**: Real-time account balance with growth indicators
- **Health Score**: Financial health rating (0-100) with trend

### **Advanced Analytics**
- **Chart Data**: Daily income/expense breakdown with cumulative balance
- **Category Analysis**: Spending breakdown by category with percentages
- **Trend Analysis**: Period-over-period comparisons and growth rates
- **Predictive Insights**: AI-powered forecasting and recommendations

### **Export Capabilities**
- **CSV Export**: Transaction data export for external analysis
- **PDF Reports**: Formatted financial reports with charts and insights
- **API Integration**: RESTful endpoints for third-party integrations

## 🔔 Notification System

### **Alert Types**
- **Expense Threshold**: When expenses reach 80% of income
- **Budget Overruns**: Category-specific budget alerts
- **Cash Flow Warnings**: Low balance or negative cash flow alerts
- **Goal Tracking**: Progress updates on financial goals

### **Delivery Channels**
- **Email**: Detailed notifications with actionable insights
- **SMS**: Concise alerts for immediate attention
- **In-App**: Dashboard notifications and alerts

### **Automation**
- **Auto-subscription**: Users automatically enrolled upon registration
- **Smart Timing**: Notifications sent at optimal times
- **Frequency Control**: Prevents notification spam with intelligent throttling

## 🔒 Security & Compliance

### **Authentication & Authorization**
- **AWS Cognito**: Enterprise-grade user authentication
- **JWT Tokens**: Stateless authentication with secure token handling
- **Role-based Access**: Fine-grained permissions using AWS IAM
- **Session Management**: Secure session handling with automatic expiration

### **Data Protection**
- **Encryption in Transit**: All API communications encrypted with TLS
- **Encryption at Rest**: DynamoDB and S3 data encrypted
- **Data Isolation**: Complete separation of user data
- **Access Logging**: Comprehensive audit trails for all operations

### **Privacy & Compliance**
- **Data Minimization**: Only collect necessary financial data
- **User Consent**: Explicit consent for data processing and notifications
- **Data Retention**: Configurable data retention policies
- **GDPR Ready**: Privacy-by-design architecture

## 📈 Performance & Scalability

### **Performance Optimizations**
- **Connection Pooling**: Efficient database connection management
- **Caching Strategy**: Strategic caching for frequently accessed data
- **Async Processing**: Non-blocking operations for better throughput
- **Optimized Queries**: Efficient DynamoDB query patterns

### **Scalability Features**
- **Horizontal Scaling**: ECS auto-scaling based on demand
- **Database Scaling**: DynamoDB on-demand scaling
- **CDN Integration**: CloudFront for static asset delivery
- **Load Balancing**: Application Load Balancer with health checks

### **Monitoring & Observability**
- **Health Checks**: Comprehensive application health monitoring
- **Logging**: Structured logging with CloudWatch integration
- **Metrics**: Custom metrics for business and technical KPIs
- **Alerting**: Automated alerts for system issues

## 💰 Cost Optimization

### **AWS Cost Management**
- **DynamoDB**: On-demand billing for variable workloads
- **S3**: Intelligent tiering for cost-effective storage
- **Bedrock**: Cost-optimized AI model selection (Claude 3 Haiku)
- **ECS Fargate**: Pay-per-use container execution

### **Estimated Monthly Costs (1000 users)**
- **ECS Fargate**: $30-50
- **DynamoDB**: $20-40
- **S3 Storage**: $5-15
- **Bedrock AI**: $50-150
- **SNS Notifications**: $5-20
- **Total**: $110-275/month

## 🧪 Testing

### **API Testing**
```bash
# Health check
curl http://localhost:3000/health

# Authentication test
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/auth/user/profile

# Transaction creation
curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"type":"income","amount":1000,"description":"Test","category":"Sales"}' \
  http://localhost:3000/api/transactions
```

### **Load Testing**
- **Artillery.js**: API load testing
- **AWS Load Testing**: CloudFormation-based load testing
- **Performance Benchmarks**: Response time and throughput metrics

## 📚 Documentation

### **API Documentation**
- **Comprehensive API Guide**: Complete endpoint documentation with examples
- **Postman Collection**: Ready-to-use API testing collection
- **OpenAPI Specification**: Machine-readable API documentation

### **Integration Guides**
- **Frontend Integration**: React component examples and hooks
- **Mobile Integration**: React Native integration patterns
- **Third-party Integration**: Webhook and API integration examples

### **Deployment Guides**
- **AWS Deployment**: Step-by-step ECS deployment guide
- **Local Development**: Development environment setup
- **CI/CD Pipeline**: Automated deployment configuration

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Automated code formatting
- **Conventional Commits**: Standardized commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Documentation**
- **API Documentation**: `/docs/API_DOCUMENTATION.md`
- **Deployment Guide**: `/docs/DEPLOYMENT.md`
- **Integration Examples**: `/docs/INTEGRATION_EXAMPLES.md`

### **Community**
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for community support
- **Wiki**: Comprehensive guides and tutorials

## 🚀 Roadmap

### **Upcoming Features**
- **Budget Management**: Category-based budget tracking and alerts
- **Financial Goals**: Goal setting and progress tracking
- **Multi-currency Support**: International business support
- **Advanced Reporting**: Custom report builder with visualizations
- **Mobile App**: React Native mobile application
- **API Webhooks**: Real-time event notifications for integrations

### **Long-term Vision**
- **Machine Learning**: Advanced predictive analytics and forecasting
- **Marketplace Integration**: Connect with accounting software and banks
- **Team Collaboration**: Multi-user business account management
- **Advanced AI**: GPT-4 integration for enhanced financial advisory

---

**Built with ❤️ for modern businesses seeking intelligent financial management.**
