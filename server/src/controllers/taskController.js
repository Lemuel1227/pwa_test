import Task from '../models/Task.js';
import { emitTaskEvent } from '../utils/socket.js';

const sanitizeTask = (task) => task?.toSafeJSON?.() ?? null;

export const listTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
    return res.json({ tasks: tasks.map(sanitizeTask) });
  } catch (error) {
    return next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, dueDate, sport } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      status,
      dueDate,
      sport,
      owner: req.user.id,
    });

    const serialized = sanitizeTask(task);
    emitTaskEvent(req.user.id, 'task:created', serialized);
    return res.status(201).json({ task: serialized });
  } catch (error) {
    return next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.owner;

    const task = await Task.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      updates,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const serialized = sanitizeTask(task);
    emitTaskEvent(req.user.id, 'task:updated', serialized);
    return res.json({ task: serialized });
  } catch (error) {
    return next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, owner: req.user.id });

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    emitTaskEvent(req.user.id, 'task:deleted', { id });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
