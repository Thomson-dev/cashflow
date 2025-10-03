# Cognito Authentication Integration

This document explains the AWS Cognito authentication system added to the backend.

## Overview

The backend now supports **dual authentication**:
- **Existing JWT auth** - Your original authentication system (unchanged)
- **AWS Cognito auth** - New cloud-based authentication for scalable user management

## Files Added/Modified

### New Files
- `src/middleware/cognitoAuth.ts` - Cognito JWT token verification middleware
- `.env` - Added Cognito environment variables

### Modified Files
- `src/index.ts` - Added Cognito protected route example
- `package.json` - Added JWT and JWKS dependencies

## How Cognito Authentication Works

### 1. User Flow
```
User → Frontend → Cognito User Pool → JWT Tokens → Backend Verification
```

### 2. Token Verification Process
1. Frontend sends JWT token in `Authorization: Bearer <token>` header
2. Backend fetches Cognito's public keys from JWKS endpoint
3. JWT signature is verified using Cognito's public key
4. If valid, user info is extracted and added to `req.user`

### 3. Backend Middleware
```typescript
// Protect any route with Cognito auth
app.get('/api/protected', verifyCognitoToken, (req, res) => {
  // req.user contains: { sub, email, ... }
});
```

## Environment Setup

### Required Environment Variables
```bash
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx  # From Terraform output
```

### Terraform Setup
Create your Cognito User Pool with the provided `cognito.tf` file, then update `.env` with the outputs.

## API Endpoints

### Existing Routes (Unchanged)
- `POST /api/auth/register` - Uses existing auth system
- `POST /api/auth/login` - Uses existing auth system
- `GET /api/auth/user/profile` - Uses existing auth middleware

### New Cognito Routes
- `GET /api/protected` - **Example Cognito-protected endpoint**

## Usage Examples

### Protecting New Routes with Cognito
```typescript
import { verifyCognitoToken } from './middleware/cognitoAuth';

// Any new route that needs Cognito auth
app.get('/api/user-data', verifyCognitoToken, (req, res) => {
  res.json({
    message: 'User data',
    userId: req.user.sub,
    email: req.user.email
  });
});
```

### Frontend Integration
```typescript
// After user signs in with Cognito
const token = cognitoResult.getIdToken().getJwtToken();

// Make authenticated requests
fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## When to Use Each Auth System

### Use Existing Auth For:
- Current user management
- Existing mobile/web apps
- Custom user workflows

### Use Cognito Auth For:
- New features requiring scalable auth
- Integration with other AWS services
- Advanced security features (MFA, password policies)
- Social login integration
- Federated identity

## Security Features

- **JWT signature verification** using Cognito's rotating keys
- **Automatic token expiration** (typically 1 hour)
- **No secrets stored** in backend (uses public key verification)
- **Scalable** - handles millions of users

## Testing

1. **Start server**: `npm run dev`
2. **Test unprotected**: `curl http://localhost:3000/api/hello`
3. **Test protected** (will fail without token): `curl http://localhost:3000/api/protected`
4. **Test with token**: `curl -H "Authorization: Bearer <cognito-jwt>" http://localhost:3000/api/protected`

## Next Steps

1. Deploy Cognito User Pool with Terraform
2. Update `.env` with actual User Pool ID
3. Integrate frontend with Cognito SDK
4. Migrate routes to use `verifyCognitoToken` as needed
5. Consider removing existing auth system once fully migrated

## Dependencies Added

```json
{
  "jsonwebtoken": "^9.x.x",
  "jwks-client": "^3.x.x",
  "dotenv": "^16.x.x"
}
```
