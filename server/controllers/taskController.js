const Task = require("../models/Task"); // Adjust path as needed

// Helper function to get date ranges
const getDateRange = (dateType) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  switch (dateType) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    case 'tomorrow':
      return {
        start: tomorrow,
        end: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    case 'overdue':
      return {
        start: new Date(0), // Very old date
        end: new Date(today.getTime() - 1)
      };
    default:
      return null;
  }
};

// Helper function to check if task should be included for today
const isTaskForToday = (task) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If task has no dates, consider it for today
  if (!task.scheduledDate && !task.dueDate) {
    return true;
  }
  
  // Check if scheduled for today
  if (task.scheduledDate) {
    const scheduledDate = new Date(task.scheduledDate);
    scheduledDate.setHours(0, 0, 0, 0);
    if (scheduledDate.getTime() === today.getTime()) {
      return true;
    }
  }
  
  // Check if due today
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate.getTime() === today.getTime()) {
      return true;
    }
  }
  
  return false;
};

// Helper function to check if task should be included for tomorrow
const isTaskForTomorrow = (task) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  // Check if scheduled for tomorrow
  if (task.scheduledDate) {
    const scheduledDate = new Date(task.scheduledDate);
    scheduledDate.setHours(0, 0, 0, 0);
    if (scheduledDate.getTime() === tomorrow.getTime()) {
      return true;
    }
  }
  
  // Check if due tomorrow
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate.getTime() === tomorrow.getTime()) {
      return true;
    }
  }
  
  return false;
};

// Helper function to check if task is overdue
const isTaskOverdue = (task) => {
  if (task.status === 'done') return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if scheduled date is overdue
  if (task.scheduledDate) {
    const scheduledDate = new Date(task.scheduledDate);
    scheduledDate.setHours(0, 0, 0, 0);
    if (scheduledDate.getTime() < today.getTime()) {
      return true;
    }
  }
  
  // Check if due date is overdue
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate.getTime() < today.getTime()) {
      return true;
    }
  }
  
  return false;
};

// Get all tasks 
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get tasks by date type (today, tomorrow, overdue)
const getTasksByDateType = async (req, res) => {
  try {
    const { dateType } = req.params; // 'today', 'tomorrow', 'overdue'
    
    if (!['today', 'tomorrow', 'overdue'].includes(dateType)) {
      return res.status(400).json({ message: "Invalid date type. Use 'today', 'tomorrow', or 'overdue'" });
    }
    
    // Get all user's tasks
    const allTasks = await Task.find({ user: req.user._id }).sort({ 
      scheduledDate: 1, 
      dueDate: 1, 
      createdAt: -1 
    });
    
    let filteredTasks = [];
    
    // Filter tasks based on date type
    switch (dateType) {
      case 'today':
        filteredTasks = allTasks.filter(isTaskForToday);
        break;
      case 'tomorrow':
        filteredTasks = allTasks.filter(isTaskForTomorrow);
        break;
      case 'overdue':
        filteredTasks = allTasks.filter(isTaskOverdue);
        break;
    }
    
    res.json({
      dateType,
      count: filteredTasks.length,
      tasks: filteredTasks
    });
  } catch (err) {
    console.error("Error fetching tasks by date type:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get tasks by specific date
const getTasksByDate = async (req, res) => {
  try {
    const { date } = req.params; // Expected format: YYYY-MM-DD
    const targetDate = new Date(date);
    
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find tasks scheduled or due on this date
    const tasks = await Task.find({
      user: req.user._id,
      $or: [
        { 
          scheduledDate: { $gte: startOfDay, $lte: endOfDay }
        },
        { 
          dueDate: { $gte: startOfDay, $lte: endOfDay }
        }
      ]
    }).sort({ 
      scheduledDate: 1, 
      dueDate: 1, 
      createdAt: -1 
    });
    
    res.json({
      date: date,
      count: tasks.length,
      tasks: tasks
    });
  } catch (err) {
    console.error("Error fetching tasks by date:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create task 
const createTask = async (req, res) => {
  const { 
    name, 
    description, 
    status, 
    color, 
    repeat, 
    repeatType, 
    tag,
    dueDate,
    scheduledDate
  } = req.body;
  
  console.log("🧾 req.user:", req.user);
  
  if (!name) return res.status(400).json({ message: "Task name is required" });
  
  try {
    const taskData = {
      user: req.user._id,
      name,
      description,
      status,
      color,
      repeat,
      repeatType,
      tag
    };
    
    // Add dates if provided
    if (dueDate) {
      taskData.dueDate = new Date(dueDate);
    }
    if (scheduledDate) {
      taskData.scheduledDate = new Date(scheduledDate);
    }
    
    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;
    
    // Handle date updates
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.scheduledDate) {
      updateData.scheduledDate = new Date(updateData.scheduledDate);
    }
    
    const task = await Task.findOneAndUpdate(
      { _id: taskId, user: req.user._id },
      updateData,
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(task);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Failed to update task" });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findOneAndDelete({ 
      _id: taskId, 
      user: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Failed to delete task" });
  }
};

// Get task statistics
const getTaskStats = async (req, res) => {
  try {
    const allTasks = await Task.find({ user: req.user._id });
    
    const stats = {
      total: allTasks.length,
      today: allTasks.filter(isTaskForToday).length,
      tomorrow: allTasks.filter(isTaskForTomorrow).length,
      overdue: allTasks.filter(isTaskOverdue).length,
      completed: allTasks.filter(task => task.status === 'done').length,
      inProgress: allTasks.filter(task => task.status === 'in-progress').length,
      todo: allTasks.filter(task => task.status === 'todo').length,
      byTag: {}
    };
    
    // Count tasks by tag
    allTasks.forEach(task => {
      if (task.tag) {
        stats.byTag[task.tag] = (stats.byTag[task.tag] || 0) + 1;
      }
    });
    
    res.json(stats);
  } catch (err) {
    console.error("Error fetching task stats:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getTasks,
  getTasksByDateType,
  getTasksByDate,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};