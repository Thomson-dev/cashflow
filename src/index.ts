import express, { Request, Response } from 'express';
import dotenv from "dotenv";
import fileUploadRoute from './routes/fileUploadRoute';
import { verifyCognitoToken } from './middleware/cognitoAuth';

import cors from 'cors';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/file-upload', fileUploadRoute);

// Test Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Safe Mama API is running!',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ 
    message: 'Hello from API endpoint!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Protected endpoint example
app.get('/api/protected', verifyCognitoToken, (req: any, res: Response) => {
  res.json({ 
    message: 'This is a protected endpoint!',
    user: {
      id: req.user.sub,
      email: req.user.email
    },
    timestamp: new Date().toISOString()
  });
});

// Database status endpoint
app.get('/api/db-status', async (req: Request, res: Response) => {
  res.json({
    success: true,
    database: {
      type: 'DynamoDB',
      region: process.env.AWS_REGION || 'us-east-1',
      status: 'connected'
    },
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Using DynamoDB in region: ${process.env.AWS_REGION || 'us-east-1'}`);
  });
}

// Export for Vercel
export default app;