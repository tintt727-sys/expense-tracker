import { Router } from 'express';
import {
  getTransactions,
  getDashboardSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportCSV
} from '../controllers/transactionController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// All user transaction routes require user authentication
router.use(authenticateUser);

router.get('/', getTransactions);
router.get('/summary', getDashboardSummary);
router.get('/export/csv', exportCSV);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
