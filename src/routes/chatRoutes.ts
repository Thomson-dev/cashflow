import { Router } from 'express';
import { verifyCognitoToken } from '../middleware/cognitoAuth';
import { sendMessage } from '../controllers/chatController';

const router = Router();

router.post('/message', verifyCognitoToken, sendMessage);

export default router;
