import { Router } from 'express';
import { verifyCognitoToken } from '../middleware/cognitoAuth';
import * as transactionController from '../controllers/transactionController';

const router = Router();

router.post('/', verifyCognitoToken, transactionController.createTransaction);
router.get('/', verifyCognitoToken, transactionController.getTransactions);
router.get('/period/:period', verifyCognitoToken, transactionController.getTransactionsByPeriod);
router.delete('/:id', verifyCognitoToken, transactionController.deleteTransaction);
// router.get('/:id', verifyCognitoToken, transactionController.getTransaction);
// router.put('/:id', verifyCognitoToken, transactionController.updateTransaction);

export default router;