import { Router } from 'express';
import { verifyCognitoToken } from '../middleware/cognitoAuth';
import { getDashboard } from '../controllers/dashboardController';

const router = Router();

router.get('/', verifyCognitoToken, getDashboard);

export default router;
