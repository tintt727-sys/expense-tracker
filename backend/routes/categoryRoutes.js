import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Publicly readable or accessible with auth
router.get('/', getCategories);

// Category modification requires authentication
router.post('/', authenticateUser, createCategory);
router.put('/:id', authenticateUser, updateCategory);
router.delete('/:id', authenticateUser, deleteCategory);

export default router;
