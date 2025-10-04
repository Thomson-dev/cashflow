import { Router } from 'express';
import { verifyCognitoToken } from '../middleware/cognitoAuth';
import { getInsights } from '../controllers/insightsController';

const router = Router();

router.get('/', verifyCognitoToken, getInsights);

export default router;
