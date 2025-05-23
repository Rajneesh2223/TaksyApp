import express from 'express';
import {
  deleteUser,
  getAllUsers,
  updateUser,
} from '../controllers/userController.js';
import { isAdmin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin can see all users
router.get('/', protect, isAdmin, getAllUsers);

// Admin can update any user
router.put('/:id', protect, isAdmin, updateUser);

// Admin can delete any user
router.delete('/:id', protect, isAdmin, deleteUser);

export default router;
