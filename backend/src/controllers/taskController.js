import Task from '../models/task.model.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const documents = req.files?.map(file => `uploads/${file.filename}`) || [];

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      documents,
      createdBy: req.user._id
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get All Tasks (with filter, sort, pagination)
export const getAllTasks = async (req, res) => {
  try {
    const { status, priority, sortBy, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // If not admin, restrict to user's own tasks
    // if (req.user.role !== 'admin') {
    //   filter.assignedTo = req.user._id;
    // }

    const sortOptions = {};
    if (sortBy === 'dueDate') sortOptions.dueDate = 1;
    else if (sortBy === 'priority') sortOptions.priority = 1;
    else if (sortBy === 'status') sortOptions.status = 1;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'email')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.status(200).json({ total, page: +page, tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get Task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // // Restrict access
    // if (req.user.role !== 'admin' && !task.assignedTo.equals(req.user._id)) {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update Task
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // // Allow only admins or assigned user to update
    // if (req.user.role !== 'admin' && !task.assignedTo.equals(req.user._id)) {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    // Update fields if provided
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo 
      // && req.user.role === 'admin'
    ) task.assignedTo = assignedTo;

    if (req.files && req.files.length > 0) {
      const documents = req.files.map(file => file.path);
      task.documents = documents;
    }

    await task.save();

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete Task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    // if (req.user.role !== 'admin' && !task.assignedTo.equals(req.user._id)) {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }

    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// controllers/taskController.js

export const getUserTasksById = async (req, res) => {
  try {
    // 1. Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // 2. Get tasks assigned to this user
    const tasks = await Task.find({
      assignedTo: req.user._id
    })
    .populate('createdBy', 'name email') // who created the task
    .populate('assignedTo', 'name email') // who it's assigned to (should be you)
    .sort({ dueDate: 1 }); // sort by due date ascending

    // 3. Send response
    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (error) {
    console.error('Error getting user tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};