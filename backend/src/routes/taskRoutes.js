import express from 'express';
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  getUserTasksById,
  updateTask
} from '../controllers/taskController.js';

import { isAdmin, protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Admin can create task with max 3 PDF uploads
router.post('/', protect, isAdmin, upload.array('documents', 3), createTask);

// All authenticated users
router.get('/', protect, getAllTasks);
// router.get('/mytasks', getUserTasks);
router.get('/:id',  getTaskById);
router.patch('/:id',  upload.array('documents', 3), updateTask);
router.delete('/:id',protect,  deleteTask);
// Get tasks for logged-in user
// router.get('/me', protect, getMyTasks);

// Admin route to get tasks for any user
router.get('/user/:userId', protect, getUserTasksById);


export default router;
