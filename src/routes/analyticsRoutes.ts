import { Router } from 'express';
import { verifyCognitoToken } from '../middleware/cognitoAuth';
import { getAnalytics } from '../controllers/analyticsController';

const router = Router();

router.get('/:period', verifyCognitoToken, getAnalytics);

export default router;
