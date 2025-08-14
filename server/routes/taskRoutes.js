
const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTasksByDateType,
  getTasksByDate,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController'); 

// Import  auth middleware
const auth = require('../middleware/authMiddleware'); 

// GET /api/tasks - Get all tasks
router.get('/', auth, getTasks);

// GET /api/tasks/stats - Get task statistics
router.get('/stats', auth, getTaskStats);

// GET /api/tasks/date-type/:dateType - Get tasks by date type (today, tomorrow, overdue)
router.get('/date-type/:dateType', auth, getTasksByDateType);

// GET /api/tasks/date/:date - Get tasks by specific date (YYYY-MM-DD)
router.get('/date/:date', auth, getTasksByDate);

// POST /api/tasks - Create new task
router.post('/', auth, createTask);

// PATCH /api/tasks/:taskId - Update task
router.patch('/:taskId', auth, updateTask);

// DELETE /api/tasks/:taskId - Delete task
router.delete('/:taskId', auth, deleteTask);

module.exports = router;