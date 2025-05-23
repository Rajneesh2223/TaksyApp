import express from 'express';
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTask,
} from '../controllers/taskController.js';

import { isAdmin, protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Admin can create task with max 3 PDF uploads
router.post('/', protect, isAdmin, upload.array('documents', 3), createTask);

// All authenticated users
router.get('/', protect, getAllTasks);
router.get('/:id',  getTaskById);
router.patch('/:id',  upload.array('documents', 3), updateTask);
router.delete('/:id',  deleteTask);

export default router;
