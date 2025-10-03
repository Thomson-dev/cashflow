import { Router } from 'express';

import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { verifyCognitoToken } from '../middleware/cognitoAuth';

const router = Router();

router.post('/register', verifyCognitoToken, register);
router.post('/login', login);
router.get('/user/profile', verifyCognitoToken, getProfile);
router.put('/user/profile', verifyCognitoToken, updateProfile);

export default router;