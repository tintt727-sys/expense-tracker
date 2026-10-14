import { Router } from 'express';
import {
  adminLogin,
  getAdminDashboardStats,
  getAllTransactions,
  adminUpdateTransaction,
  adminDeleteTransaction,
  backupDatabase,
  resetDatabase,
  changeAdminPassword
} from '../controllers/adminController.js';
import {
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';

const router = Router();

// Public Admin Login
router.post('/login', adminLogin);

// Protected Admin Routes
router.use(authenticateAdmin);

router.get('/dashboard-stats', getAdminDashboardStats);
router.get('/transactions', getAllTransactions);
router.put('/transactions/:id', adminUpdateTransaction);
router.delete('/transactions/:id', adminDeleteTransaction);

// Category Admin Controls
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Database Controls
router.get('/database/backup', backupDatabase);
router.post('/database/reset', resetDatabase);

// Admin Password Update
router.put('/password', changeAdminPassword);

export default router;
