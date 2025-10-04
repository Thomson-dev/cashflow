# CashFlow API Documentation

Complete API reference for testing with Postman.

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require:
```
Authorization: Bearer <cognito-jwt-token>
```

---

## 🔓 Unprotected Endpoints

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "uptime": 123.456,
  "timestamp": "2024-10-03T10:17:13.158Z"
}
```

### 2. Hello World
```http
GET /
```

**Response:**
```json
{
  "message": "Hello World from Express.js with TypeScript!"
}
```

### 3. API Hello
```http
GET /api/hello
```

**Response:**
```json
{
  "message": "Hello from API endpoint!",
  "timestamp": "2024-10-03T10:17:13.158Z",
  "method": "GET",
  "url": "/api/hello"# CashFlow API Documentation

Complete API reference for testing with Postman.

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require:
```
Authorization: Bearer <cognito-jwt-token>
```

---

## 🔓 Unprotected Endpoints

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "uptime": 123.456,
  "timestamp": "2024-10-03T10:17:13.158Z"
}
```

### 2. Hello World
```http
GET /
```

**Response:**
```json
{
  "message": "Hello World from Express.js with TypeScript!"
}
```

### 3. API Hello
```http
GET /api/hello
```

**Response:**
```json
{
  "message": "Hello from API endpoint!",
  "timestamp": "2024-10-03T10:17:13.158Z",
  "method": "GET",
  "url": "/api/hello"
}
```

### 4. Database Status
```http
GET /api/db-status
```

**Response:**
```json
{
  "success": true,
  "database": {
    "type": "DynamoDB",
    "region": "us-east-1",
    "status": "connected"
  },
  "timestamp": "2024-10-03T10:17:13.158Z"
}
```

---

## 🔐 Authentication Endpoints

### 5. Create User Profile
```http
POST /api/auth/register
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
  "email": "john@business.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "businessName": "Doe Consulting",
  "businessType": "Consulting",
  "businessLocation": "New York, NY",
  "monthlyRevenue": 15000,
  "teamSize": 5,
  "startingBalance": 50000,
  "expectedMonthlyExpense": 8000,
  "expectedMonthlyIncome": 15000,
  "financialGoals": ["Increase revenue by 20%", "Reduce expenses"],
  "notificationPreference": "email"
}
```

**Response:**
```json
{
  "message": "User profile created successfully",
  "user": {
    "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
    "email": "john@business.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "businessName": "Doe Consulting",
    "businessType": "Consulting",
    "startingBalance": 50000
  }
}
```

### 6. Get User Profile
```http
GET /api/auth/user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
    "email": "john@business.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "businessName": "Doe Consulting",
    "businessType": "Consulting",
    "businessLocation": "New York, NY",
    "monthlyRevenue": 15000,
    "teamSize": 5,
    "startingBalance": 52000,
    "expectedMonthlyExpense": 8000,
    "expectedMonthlyIncome": 15000,
    "financialGoals": ["Increase revenue by 20%", "Reduce expenses"],
    "notificationPreference": "email"
  }
}
```

### 7. Update User Profile
```http
PUT /api/auth/user/profile
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "businessName": "Smith Consulting",
  "businessType": "Digital Marketing",
  "businessLocation": "Los Angeles, CA",
  "monthlyRevenue": 18000,
  "teamSize": 8,
  "startingBalance": 55000,
  "expectedMonthlyExpense": 9000,
  "expectedMonthlyIncome": 18000,
  "financialGoals": ["Expand team", "Increase profit margin"],
  "notificationPreference": "both"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "+1234567890",
    "businessName": "Smith Consulting",
    "businessType": "Digital Marketing",
    "startingBalance": 55000
  }
}
```

---

## 💰 Transaction Endpoints

### 8. Create Transaction
```http
POST /api/transactions
Content-Type: application/json
Authorization: Bearer <token>
```

**Income Transaction:**
```json
{
  "type": "income",
  "amount": 2500,
  "description": "Freelance project payment",
  "category": "Consulting",
  "date": "2024-10-03T10:00:00.000Z"
}
```

**Expense Transaction:**
```json
{
  "type": "expense",
  "amount": 500,
  "description": "Office supplies",
  "category": "Business Expenses",
  "date": "2024-10-03T11:00:00.000Z"
}
```

**Response:**
```json
{
  "message": "Transaction added successfully",
  "transaction": {
    "transactionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
    "amount": 2500,
    "description": "Freelance project payment",
    "category": "Consulting",
    "type": "income",
    "date": "2024-10-03T10:00:00.000Z",
    "createdAt": "2024-10-03T11:17:13.158Z",
    "updatedAt": "2024-10-03T11:17:13.158Z"
  },
  "currentBalance": 52500
}
```

### 9. Get All Transactions
```http
GET /api/transactions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "transactions": [
    {
      "transactionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
      "amount": 2500,
      "description": "Freelance project payment",
      "category": "Consulting",
      "type": "income",
      "date": "2024-10-03T10:00:00.000Z",
      "createdAt": "2024-10-03T11:17:13.158Z",
      "updatedAt": "2024-10-03T11:17:13.158Z"
    }
  ],
  "count": 1
}
```

### 10. Get Transactions by Period
```http
GET /api/transactions/period/7d
Authorization: Bearer <token>
```

**Available Periods:** `7d`, `30d`, `90d`, `1y`

**Response:**
```json
{
  "period": "30d",
  "dateRange": {
    "from": "2024-09-03T11:17:13.158Z",
    "to": "2024-10-03T11:17:13.158Z"
  },
  "summary": {
    "totalIncome": 5000,
    "totalExpenses": 2000,
    "netAmount": 3000,
    "transactionCount": 8
  },
  "transactions": [
    {
      "transactionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "amount": 2500,
      "description": "Freelance project payment",
      "type": "income",
      "date": "2024-10-03T10:00:00.000Z"
    }
  ],
  "count": 8
}
```

### 11. Delete Transaction
```http
DELETE /api/transactions/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Transaction deleted successfully",
  "transactionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "currentBalance": 50000
}
```

---

## 📊 Dashboard Endpoint

### 12. Get Dashboard Data
```http
GET /api/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "dashboard": {
    "monthlyIncome": {
      "value": 5000,
      "percentageChange": 15,
      "trend": "up"
    },
    "monthlyExpense": {
      "value": 3000,
      "percentageChange": -10,
      "trend": "down"
    },
    "currentBalance": {
      "value": 52000,
      "percentageChange": 4,
      "trend": "up"
    },
    "healthScore": {
      "value": 75,
      "percentageChange": 8,
      "trend": "up"
    }
  },
  "period": {
    "current": {
      "start": "2024-10-01T00:00:00.000Z",
      "end": "2024-10-31T23:59:59.000Z"
    },
    "previous": {
      "start": "2024-09-01T00:00:00.000Z",
      "end": "2024-09-30T23:59:59.000Z"
    }
  }
}
```

---

## 📁 File Upload Endpoints

### 13. Get Presigned Upload URL
```http
POST /api/file-upload/presigned-url
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fileName": "invoice_2024_10.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/bucket/presigned-url...",
    "fileName": "1696334233158_invoice_2024_10.pdf",
    "originalName": "invoice_2024_10.pdf",
    "s3Key": "users/34581428-e031-7092-6647-c29b5be1c4a9/uploads/1696334233158_invoice_2024_10.pdf",
    "fileId": "file-uuid-here"
  }
}
```

### 14. Confirm File Upload
```http
POST /api/file-upload/confirm-upload
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fileId": "file-uuid-here",
  "fileSize": 1024000
}
```

**Response:**
```json
{
  "success": true,
  "message": "File upload confirmed",
  "data": {
    "fileId": "file-uuid-here",
    "status": "uploaded",
    "fileSize": 1024000
  }
}
```

### 15. Get User Files
```http
GET /api/file-upload/files
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "fileId": "file-uuid-here",
      "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
      "originalName": "invoice_2024_10.pdf",
      "fileName": "1696334233158_invoice_2024_10.pdf",
      "s3Key": "users/34581428-e031-7092-6647-c29b5be1c4a9/uploads/1696334233158_invoice_2024_10.pdf",
      "fileType": "pdf",
      "fileSize": 1024000,
      "uploadedAt": "2024-10-03T11:17:13.158Z",
      "status": "uploaded"
    }
  ]
}
```

---

## 📊 Analytics Endpoint

### 17. Get Analytics Data
```http
GET /api/analytics/:period
Authorization: Bearer <token>
```

**Available Periods:** `7d`, `30d`, `90d`, `1y`

**Response:**
```json
{
  "period": "30d",
  "dateRange": {
    "from": "2024-09-04T08:00:48.213Z",
    "to": "2024-10-04T08:00:48.213Z"
  },
  "summary": {
    "totalIncome": 150000,
    "totalExpenses": 85000,
    "netAmount": 65000,
    "transactionCount": 24
  },
  "chartData": [
    {
      "date": "2024-09-04",
      "income": 25000,
      "expense": 8000,
      "net": 17000,
      "cumulativeBalance": 67000
    },
    {
      "date": "2024-09-05", 
      "income": 0,
      "expense": 12000,
      "net": -12000,
      "cumulativeBalance": 55000
    }
  ],
  "categoryBreakdown": {
    "income": [
      { "category": "Sales Revenue", "amount": 120000, "percentage": 80 },
      { "category": "Consulting", "amount": 30000, "percentage": 20 }
    ],
    "expense": [
      { "category": "Office Supplies", "amount": 35000, "percentage": 41 },
      { "category": "Marketing", "amount": 25000, "percentage": 29 },
      { "category": "Utilities", "amount": 25000, "percentage": 30 }
    ]
  }
}
```

### Frontend Integration:

**Analytics Dashboard Page:**
- Use `summary` data for KPI cards showing totals and trends
- Display `dateRange` to show the analysis period to users
- Create period selector buttons (7d, 30d, 90d, 1y) that call different endpoints

**Chart Components:**
- **Line Chart**: Use `chartData` array for daily income/expense trends over time
- **Balance Chart**: Use `cumulativeBalance` from `chartData` to show balance progression
- **Bar Chart**: Use daily `income` and `expense` values for comparative daily analysis
- **Area Chart**: Combine `income` and `expense` for stacked area visualization

**Category Analysis:**
- **Pie Charts**: Use `categoryBreakdown.income` and `categoryBreakdown.expense` arrays
- **Donut Charts**: Display category percentages with amounts as tooltips
- **Category Lists**: Show ranked categories with progress bars based on percentages
- **Comparison Views**: Side-by-side income vs expense category breakdowns

**Interactive Features:**
- **Period Switching**: Buttons to switch between 7d/30d/90d/1y views
- **Chart Filtering**: Toggle between income-only, expense-only, or combined views
- **Drill-down**: Click category segments to show individual transactions
- **Export Options**: Use data for PDF reports or CSV exports

**Performance Optimization:**
- Cache analytics data for frequently accessed periods
- Use loading states while fetching different period data
- Implement skeleton screens for chart components
- Consider pagination for very large datasets

---

### 16. Protected Test Endpoint
```http
GET /api/protected
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "This is a protected endpoint!",
  "user": {
    "id": "34581428-e031-7092-6647-c29b5be1c4a9",
    "email": "testuser@example.com"
  },
  "timestamp": "2024-10-03T11:17:13.158Z"
}
```

---

## 🔑 Getting Your JWT Token

### Step 1: Authenticate with Cognito
```bash
aws cognito-idp admin-initiate-auth \
  --user-pool-id us-east-1_DZU1jp4rL \
  --client-id 66n3m1oepfih6u05dgajf8eabm \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters USERNAME=testuser@example.com,PASSWORD=TestPassword123! \
  --region us-east-1
```

### Step 2: Use the IdToken
Copy the `IdToken` from the response and use it in the `Authorization` header:
```
Authorization: Bearer eyJraWQiOiIwWlQwMDl1M3pMOTF3WW5WZmc4eFBJb2k0cE1pMStzdFI5Y29TcW1WeTRVPSIsImFsZyI6IlJTMjU2In0...
```

---

## 📋 Postman Collection Setup

### Environment Variables
Create a Postman environment with:
- `base_url`: `http://localhost:3000`
- `auth_token`: `<your-jwt-token>`

### Headers Template
For protected endpoints, add:
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

---

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 400 Bad Request
```json
{
  "error": "Amount must be a positive number"
}
```

### 404 Not Found
```json
{
  "error": "Transaction not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📝 Testing Checklist

- [ ] Health check works
- [ ] Authentication token is valid
- [ ] Create user profile
- [ ] Get user profile
- [ ] Update user profile
- [ ] Create income transaction
- [ ] Create expense transaction
- [ ] Get all transactions
- [ ] Get transactions by period (7d, 30d, 90d, 1y)
- [ ] Delete transaction
- [ ] Get dashboard data
- [ ] Get analytics data (7d, 30d, 90d, 1y)
- [ ] File upload flow
- [ ] Error handling for invalid requests

---

## 💡 Tips for Testing

1. **Start with unprotected endpoints** to verify server is running
2. **Get your JWT token** using the Cognito CLI command
3. **Test authentication** with the protected test endpoint first
4. **Create some transactions** before testing dashboard and period endpoints
5. **Check balance updates** after creating/deleting transactions
6. **Test error cases** with invalid data to verify error handling

}
```

### 4. Database Status
```http
GET /api/db-status
```

**Response:**
```json
{
  "success": true,
  "database": {
    "type": "DynamoDB",
    "region": "us-east-1",
    "status": "connected"
  },
  "timestamp": "2024-10-03T10:17:13.158Z"
}
```

---

## 🔐 Authentication Endpoints

### 5. Create User Profile
```http
POST /api/auth/register
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
  "email": "john@business.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "businessName": "Doe Consulting",
  "businessType": "Consulting",
  "businessLocation": "New York, NY",
  "monthlyRevenue": 15000,
  "teamSize": 5,
  "startingBalance": 50000,
  "expectedMonthlyExpense": 8000,
  "expectedMonthlyIncome": 15000,
  "financialGoals": ["Increase revenue by 20%", "Reduce expenses"],
  "notificationPreference": "email"
}
```

**Response:**
```json
{
  "message": "User profile created successfully",
  "user": {
    "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
    "email": "john@business.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "businessName": "Doe Consulting",
    "businessType": "Consulting",
    "startingBalance": 50000
  }
}
```

### 6. Get User Profile
```http
GET /api/auth/user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
    "email": "john@business.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "businessName": "Doe Consulting",
    "businessType": "Consulting",
    "businessLocation": "New York, NY",
    "monthlyRevenue": 15000,
    "teamSize": 5,
    "startingBalance": 52000,
    "expectedMonthlyExpense": 8000,
    "expectedMonthlyIncome": 15000,
    "financialGoals": ["Increase revenue by 20%", "Reduce expenses"],
    "notificationPreference": "email"
  }
}
```

### 7. Update User Profile
```http
PUT /api/auth/user/profile
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "businessName": "Smith Consulting",
  "businessType": "Digital Marketing",
  "businessLocation": "Los Angeles, CA",
  "monthlyRevenue": 18000,
  "teamSize": 8,
  "startingBalance": 55000,
  "expectedMonthlyExpense": 9000,
  "expectedMonthlyIncome": 18000,
  "financialGoals": ["Expand team", "Increase profit margin"],
  "notificationPreference": "both"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "+1234567890",
    "businessName": "Smith Consulting",
    "businessType": "Digital Marketing",
    "startingBalance": 55000
  }
}
```

---

## 💰 Transaction Endpoints

### 8. Create Transaction
```http
POST /api/transactions
Content-Type: application/json
Authorization: Bearer <token>
```

**Income Transaction:**
```json
{
  "type": "income",
  "amount": 2500,
  "description": "Freelance project payment",
  "category": "Consulting",
  "date": "2024-10-03T10:00:00.000Z"
}
```

**Expense Transaction:**
```json
{
  "type": "expense",
  "amount": 500,
  "description": "Office supplies",
  "category": "Business Expenses",
  "date": "2024-10-03T11:00:00.000Z"
}
```

**Response:**
```json
{
  "message": "Transaction added successfully",
  "transaction": {
    "transactionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
    "amount": 2500,
    "description": "Freelance project payment",
    "category": "Consulting",
    "type": "income",
    "date": "2024-10-03T10:00:00.000Z",
    "createdAt": "2024-10-03T11:17:13.158Z",
    "updatedAt": "2024-10-03T11:17:13.158Z"
  },
  "currentBalance": 52500
}
```

### 9. Get All Transactions
```http
GET /api/transactions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "transactions": [
    {
      "transactionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
      "amount": 2500,
      "description": "Freelance project payment",
      "category": "Consulting",
      "type": "income",
      "date": "2024-10-03T10:00:00.000Z",
      "createdAt": "2024-10-03T11:17:13.158Z",
      "updatedAt": "2024-10-03T11:17:13.158Z"
    }
  ],
  "count": 1
}
```

### 10. Get Transactions by Period
```http
GET /api/transactions/period/7d
Authorization: Bearer <token>
```

**Available Periods:** `7d`, `30d`, `90d`, `1y`

**Response:**
```json
{
  "period": "30d",
  "dateRange": {
    "from": "2024-09-03T11:17:13.158Z",
    "to": "2024-10-03T11:17:13.158Z"
  },
  "summary": {
    "totalIncome": 5000,
    "totalExpenses": 2000,
    "netAmount": 3000,
    "transactionCount": 8
  },
  "transactions": [
    {
      "transactionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "amount": 2500,
      "description": "Freelance project payment",
      "type": "income",
      "date": "2024-10-03T10:00:00.000Z"
    }
  ],
  "count": 8
}
```

### 11. Delete Transaction
```http
DELETE /api/transactions/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Transaction deleted successfully",
  "transactionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "currentBalance": 50000
}
```

---

## 📊 Dashboard Endpoint

### 12. Get Dashboard Data
```http
GET /api/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "dashboard": {
    "monthlyIncome": {
      "value": 5000,
      "percentageChange": 15,
      "trend": "up"
    },
    "monthlyExpense": {
      "value": 3000,
      "percentageChange": -10,
      "trend": "down"
    },
    "currentBalance": {
      "value": 52000,
      "percentageChange": 4,
      "trend": "up"
    },
    "healthScore": {
      "value": 75,
      "percentageChange": 8,
      "trend": "up"
    }
  },
  "period": {
    "current": {
      "start": "2024-10-01T00:00:00.000Z",
      "end": "2024-10-31T23:59:59.000Z"
    },
    "previous": {
      "start": "2024-09-01T00:00:00.000Z",
      "end": "2024-09-30T23:59:59.000Z"
    }
  }
}
```

---

## 📁 File Upload Endpoints

### 13. Get Presigned Upload URL
```http
POST /api/file-upload/presigned-url
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fileName": "invoice_2024_10.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/bucket/presigned-url...",
    "fileName": "1696334233158_invoice_2024_10.pdf",
    "originalName": "invoice_2024_10.pdf",
    "s3Key": "users/34581428-e031-7092-6647-c29b5be1c4a9/uploads/1696334233158_invoice_2024_10.pdf",
    "fileId": "file-uuid-here"
  }
}
```

### 14. Confirm File Upload
```http
POST /api/file-upload/confirm-upload
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fileId": "file-uuid-here",
  "fileSize": 1024000
}
```

**Response:**
```json
{
  "success": true,
  "message": "File upload confirmed",
  "data": {
    "fileId": "file-uuid-here",
    "status": "uploaded",
    "fileSize": 1024000
  }
}
```

### 15. Get User Files
```http
GET /api/file-upload/files
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "fileId": "file-uuid-here",
      "userId": "34581428-e031-7092-6647-c29b5be1c4a9",
      "originalName": "invoice_2024_10.pdf",
      "fileName": "1696334233158_invoice_2024_10.pdf",
      "s3Key": "users/34581428-e031-7092-6647-c29b5be1c4a9/uploads/1696334233158_invoice_2024_10.pdf",
      "fileType": "pdf",
      "fileSize": 1024000,
      "uploadedAt": "2024-10-03T11:17:13.158Z",
      "status": "uploaded"
    }
  ]
}
```

---

## 📊 Analytics Endpoint

### 17. Get Analytics Data
```http
GET /api/analytics/:period
Authorization: Bearer <token>
```

**Available Periods:** `7d`, `30d`, `90d`, `1y`

**Response:**
```json
{
  "period": "30d",
  "dateRange": {
    "from": "2024-09-04T08:00:48.213Z",
    "to": "2024-10-04T08:00:48.213Z"
  },
  "summary": {
    "totalIncome": 150000,
    "totalExpenses": 85000,
    "netAmount": 65000,
    "transactionCount": 24
  },
  "chartData": [
    {
      "date": "2024-09-04",
      "income": 25000,
      "expense": 8000,
      "net": 17000,
      "cumulativeBalance": 67000
    },
    {
      "date": "2024-09-05", 
      "income": 0,
      "expense": 12000,
      "net": -12000,
      "cumulativeBalance": 55000
    }
  ],
  "categoryBreakdown": {
    "income": [
      { "category": "Sales Revenue", "amount": 120000, "percentage": 80 },
      { "category": "Consulting", "amount": 30000, "percentage": 20 }
    ],
    "expense": [
      { "category": "Office Supplies", "amount": 35000, "percentage": 41 },
      { "category": "Marketing", "amount": 25000, "percentage": 29 },
      { "category": "Utilities", "amount": 25000, "percentage": 30 }
    ]
  }
}
```

### Frontend Integration:

**Analytics Dashboard Page:**
- Use `summary` data for KPI cards showing totals and trends
- Display `dateRange` to show the analysis period to users
- Create period selector buttons (7d, 30d, 90d, 1y) that call different endpoints

**Chart Components:**
- **Line Chart**: Use `chartData` array for daily income/expense trends over time
- **Balance Chart**: Use `cumulativeBalance` from `chartData` to show balance progression
- **Bar Chart**: Use daily `income` and `expense` values for comparative daily analysis
- **Area Chart**: Combine `income` and `expense` for stacked area visualization

**Category Analysis:**
- **Pie Charts**: Use `categoryBreakdown.income` and `categoryBreakdown.expense` arrays
- **Donut Charts**: Display category percentages with amounts as tooltips
- **Category Lists**: Show ranked categories with progress bars based on percentages
- **Comparison Views**: Side-by-side income vs expense category breakdowns

**Interactive Features:**
- **Period Switching**: Buttons to switch between 7d/30d/90d/1y views
- **Chart Filtering**: Toggle between income-only, expense-only, or combined views
- **Drill-down**: Click category segments to show individual transactions
- **Export Options**: Use data for PDF reports or CSV exports

**Performance Optimization:**
- Cache analytics data for frequently accessed periods
- Use loading states while fetching different period data
- Implement skeleton screens for chart components
- Consider pagination for very large datasets

---

### 16. Protected Test Endpoint
```http
GET /api/protected
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "This is a protected endpoint!",
  "user": {
    "id": "34581428-e031-7092-6647-c29b5be1c4a9",
    "email": "testuser@example.com"
  },
  "timestamp": "2024-10-03T11:17:13.158Z"
}
```

---

## 🔑 Getting Your JWT Token

### Step 1: Authenticate with Cognito
```bash
aws cognito-idp admin-initiate-auth \
  --user-pool-id us-east-1_DZU1jp4rL \
  --client-id 66n3m1oepfih6u05dgajf8eabm \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters USERNAME=testuser@example.com,PASSWORD=TestPassword123! \
  --region us-east-1
```

### Step 2: Use the IdToken
Copy the `IdToken` from the response and use it in the `Authorization` header:
```
Authorization: Bearer eyJraWQiOiIwWlQwMDl1M3pMOTF3WW5WZmc4eFBJb2k0cE1pMStzdFI5Y29TcW1WeTRVPSIsImFsZyI6IlJTMjU2In0...
```

---

## 📋 Postman Collection Setup

### Environment Variables
Create a Postman environment with:
- `base_url`: `http://localhost:3000`
- `auth_token`: `<your-jwt-token>`

### Headers Template
For protected endpoints, add:
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

---

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 400 Bad Request
```json
{
  "error": "Amount must be a positive number"
}
```

### 404 Not Found
```json
{
  "error": "Transaction not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📝 Testing Checklist

- [ ] Health check works
- [ ] Authentication token is valid
- [ ] Create user profile
- [ ] Get user profile
- [ ] Update user profile
- [ ] Create income transaction
- [ ] Create expense transaction
- [ ] Get all transactions
- [ ] Get transactions by period (7d, 30d, 90d, 1y)
- [ ] Delete transaction
- [ ] Get dashboard data
- [ ] Get analytics data (7d, 30d, 90d, 1y)
- [ ] File upload flow
- [ ] Error handling for invalid requests

---

## 💡 Tips for Testing

1. **Start with unprotected endpoints** to verify server is running
2. **Get your JWT token** using the Cognito CLI command
3. **Test authentication** with the protected test endpoint first
4. **Create some transactions** before testing dashboard and period endpoints
5. **Check balance updates** after creating/deleting transactions
6. **Test error cases** with invalid data to verify error handling
