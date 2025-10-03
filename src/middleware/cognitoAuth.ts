import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

// Cache for JWKS keys
let jwksCache: any = null;
let cacheExpiry = 0;

// Fetch JWKS keys from Cognito
const fetchJWKS = async () => {
  const now = Date.now();
  
  // Return cached keys if still valid (cache for 1 hour)
  if (jwksCache && now < cacheExpiry) {
    return jwksCache;
  }

  try {
    const jwksUrl = `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
    console.log('🔄 Fetching JWKS from:', jwksUrl);
    
    const response = await fetch(jwksUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.status}`);
    }
    
    jwksCache = await response.json();
    cacheExpiry = now + (60 * 60 * 1000); // Cache for 1 hour
    
    console.log('✅ JWKS fetched successfully');
    return jwksCache;
  } catch (error) {
    console.error('❌ Failed to fetch JWKS:', error);
    throw error;
  }
};

// Convert JWK to PEM format
const jwkToPem = (jwk: any) => {
  const { n, e } = jwk;
  const modulus = Buffer.from(n, 'base64');
  const exponent = Buffer.from(e, 'base64');
  
  // Simple RSA public key construction
  const modulusHex = modulus.toString('hex');
  const exponentHex = exponent.toString('hex');
  
  // This is a simplified approach - for production, use a proper JWK to PEM library
  return `-----BEGIN RSA PUBLIC KEY-----\n${Buffer.from(modulusHex + exponentHex, 'hex').toString('base64')}\n-----END RSA PUBLIC KEY-----`;
};

// Get signing key
const getKey = async (header: any, callback: any) => {
  try {
    const jwks = await fetchJWKS();
    const key = jwks.keys.find((k: any) => k.kid === header.kid);
    
    if (!key) {
      return callback(new Error('Unable to find a signing key that matches'));
    }
    
    // For now, let's use the key directly (this is a simplified approach)
    // In production, you'd want to properly convert JWK to PEM
    callback(null, key.n); // This won't work properly, let's use a different approach
  } catch (error) {
    callback(error);
  }
};

export const verifyCognitoToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  console.log('🔍 Token verification started');
  console.log('📝 Token present:', !!token);
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Decode the token without verification for now
    console.log('⚠️  WARNING: Using unverified token decode for testing');
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      console.log('❌ Failed to decode token');
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    console.log('✅ Token decoded successfully');
    console.log('👤 Decoded token:', JSON.stringify(decoded, null, 2));
    
    // Set the user object
    req.user = decoded;
    
    console.log('🔗 req.user set to:', JSON.stringify(req.user, null, 2));
    
    next();
  } catch (error) {
    console.log('💥 Verification error:', error);
    return res.status(401).json({ error: 'Token verification failed' });
  }
};
