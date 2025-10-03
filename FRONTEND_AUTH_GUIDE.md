# Frontend Authentication Guide - AWS Cognito Integration

This guide explains how to implement authentication in your frontend application to work with the CashFlow backend API.

## Overview

The backend uses **AWS Cognito** for authentication. Your frontend needs to:
1. Handle user registration and login via Cognito
2. Store and manage JWT tokens
3. Include tokens in API requests
4. Handle token refresh and logout

## Architecture Flow

```
Frontend App → AWS Cognito → Backend API → DynamoDB
     ↑              ↓
   User UI      JWT Tokens
```

## Required Environment Variables

Add these to your frontend environment:

```bash
# Cognito Configuration
REACT_APP_COGNITO_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
REACT_APP_COGNITO_CLIENT_ID=your-client-id

# API Configuration
REACT_APP_API_BASE_URL=https://your-api-domain.com
```

## Installation

### For React/Next.js
```bash
npm install amazon-cognito-identity-js
```


## Implementation

### 1. Cognito Configuration

Create `src/config/cognito.js`:

```javascript
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID
};

export const userPool = new CognitoUserPool(poolData);
```

### 2. Authentication Service

Create `src/services/authService.js`:

```javascript
import { userPool } from '../config/cognito';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

class AuthService {
  // Sign Up
  signUp(email, password, firstName, lastName) {
    return new Promise((resolve, reject) => {
      const attributeList = [
        {
          Name: 'email',
          Value: email
        },
        {
          Name: 'given_name',
          Value: firstName
        },
        {
          Name: 'family_name',
          Value: lastName
        }
      ];

      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  // Confirm Sign Up (Email verification)
  confirmSignUp(email, verificationCode) {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  // Sign In
  signIn(email, password) {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          const tokens = {
            accessToken: result.getAccessToken().getJwtToken(),
            idToken: result.getIdToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken()
          };
          
          // Store tokens
          localStorage.setItem('cognitoTokens', JSON.stringify(tokens));
          
          // Create user profile in your backend
          this.createUserProfile(result.getIdToken().payload);
          
          resolve(tokens);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  }

  // Create user profile in backend after Cognito signup
  async createUserProfile(tokenPayload) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getIdToken()}`
        },
        body: JSON.stringify({
          userId: tokenPayload.sub,
          email: tokenPayload.email,
          firstName: tokenPayload.given_name,
          lastName: tokenPayload.family_name
        })
      });
      
      if (!response.ok) {
        console.error('Failed to create user profile');
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  // Get stored tokens
  getTokens() {
    const tokens = localStorage.getItem('cognitoTokens');
    return tokens ? JSON.parse(tokens) : null;
  }

  // Get ID token for API calls
  getIdToken() {
    const tokens = this.getTokens();
    return tokens ? tokens.idToken : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getIdToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // Get current user info from token
  getCurrentUser() {
    const token = this.getIdToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name
      };
    } catch {
      return null;
    }
  }

  // Sign Out
  signOut() {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    localStorage.removeItem('cognitoTokens');
  }

  // Refresh tokens
  refreshTokens() {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) {
        reject(new Error('No current user'));
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
          return;
        }

        if (session.isValid()) {
          const tokens = {
            accessToken: session.getAccessToken().getJwtToken(),
            idToken: session.getIdToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken()
          };
          
          localStorage.setItem('cognitoTokens', JSON.stringify(tokens));
          resolve(tokens);
        } else {
          reject(new Error('Session invalid'));
        }
      });
    });
  }
}

export default new AuthService();
```

### 3. API Client with Authentication

Create `src/services/apiClient.js`:

```javascript
import authService from './authService';

class ApiClient {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const token = authService.getIdToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      // Handle token expiration
      if (response.status === 401) {
        try {
          await authService.refreshTokens();
          // Retry request with new token
          config.headers.Authorization = `Bearer ${authService.getIdToken()}`;
          return fetch(`${this.baseURL}${endpoint}`, config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          authService.signOut();
          window.location.href = '/login';
          throw new Error('Session expired');
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Convenience methods
  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

export default new ApiClient();
```

### 4. React Components Examples

#### Login Component
```jsx
import React, { useState } from 'react';
import authService from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.signIn(email, password);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </form>
  );
};

export default Login;
```

#### Protected Route Component
```jsx
import React from 'react';
import authService from '../services/authService';

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    window.location.href = '/login';
    return null;
  }

  return children;
};

export default ProtectedRoute;
```

#### Using API Client
```jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await apiClient.get('/api/transactions');
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData) => {
    try {
      const response = await apiClient.post('/api/transactions', transactionData);
      if (response.ok) {
        fetchTransactions(); // Refresh list
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Transactions</h2>
      {transactions.map(transaction => (
        <div key={transaction.transactionId}>
          {transaction.description}: ${transaction.amount}
        </div>
      ))}
    </div>
  );
};

export default Transactions;
```

## User Flow Implementation

### 1. Registration Flow
```
1. User fills signup form
2. Call authService.signUp()
3. Show "Check your email" message
4. User enters verification code
5. Call authService.confirmSignUp()
6. Redirect to login or auto-login
```

### 2. Login Flow
```
1. User enters credentials
2. Call authService.signIn()
3. Tokens stored automatically
4. User profile created in backend
5. Redirect to dashboard
```

### 3. API Calls
```
1. Use apiClient for all API calls
2. Tokens included automatically
3. Auto-refresh on expiration
4. Auto-redirect to login if refresh fails
```

## Error Handling

### Common Cognito Errors
```javascript
// Handle specific Cognito errors
const handleAuthError = (error) => {
  switch (error.code) {
    case 'UserNotConfirmedException':
      return 'Please verify your email address';
    case 'NotAuthorizedException':
      return 'Invalid email or password';
    case 'UserNotFoundException':
      return 'User not found';
    case 'InvalidPasswordException':
      return 'Password does not meet requirements';
    default:
      return error.message;
  }
};
```

## Security Best Practices

1. **Token Storage**: Use secure storage (not localStorage in production)
2. **HTTPS Only**: Always use HTTPS in production
3. **Token Validation**: Check token expiration before API calls
4. **Auto Logout**: Clear tokens on app close/refresh
5. **Error Handling**: Don't expose sensitive error details

## Testing

### Test with Real Cognito
1. Deploy Cognito User Pool via Terraform
2. Update environment variables
3. Test signup/login flow
4. Verify API calls work with tokens

### Mock for Development
```javascript
// For development/testing without Cognito
const mockAuthService = {
  signIn: () => Promise.resolve({ idToken: 'mock-token' }),
  isAuthenticated: () => true,
  getCurrentUser: () => ({ userId: 'test-user', email: 'test@example.com' })
};
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Cognito User Pool deployed
- [ ] CORS configured on backend
- [ ] HTTPS enabled
- [ ] Error boundaries implemented
- [ ] Loading states handled
- [ ] Token refresh implemented
- [ ] Logout functionality working

## API Endpoints Available

Once authenticated, your frontend can call:

- `GET /api/auth/user/profile` - Get user profile
- `PUT /api/auth/user/profile` - Update user profile
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - Get user transactions
- `POST /api/file-upload/presigned-url` - Get S3 upload URL
- `GET /api/file-upload/files` - Get user files

All endpoints require `Authorization: Bearer <id-token>` header.

## Support

For backend-related issues, contact the backend team. For Cognito configuration, refer to AWS documentation or contact DevOps team.
