import { useCallback, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import dayjs from 'dayjs';
import api from '../api/client.js';
import { useAuthContext } from '../context/AuthContext.jsx';

const createSocket = (userId) => {
  const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
    withCredentials: true,
  });

  socket.on('connect', () => {
    socket.emit('join', userId);
  });

  return socket;
};

export const useTasks = () => {
  const { user } = useAuthContext();
  const storageKey = useMemo(() => `sports-task-coach-tasks-${user?.id || user?._id || 'guest'}`, [
    user,
  ]);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const updateTasksState = useCallback(
    (updater) => {
      setTasks((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (storageError) {
          console.warn('Failed to persist tasks', storageError);
        }
        return next;
      });
    },
    [storageKey]
  );

  const upsertTask = useCallback(
    (incomingTask, position = 'prepend') => {
      updateTasksState((prev) => {
        const index = prev.findIndex((item) => item._id === incomingTask._id);
        let next;
        if (index >= 0) {
          next = [...prev];
          next[index] = incomingTask;
        } else if (position === 'append') {
          next = [...prev, incomingTask];
        } else {
          next = [incomingTask, ...prev];
        }
        return next;
      });
    },
    [updateTasksState]
  );

  const fetchTasks = useCallback(async () => {
    setStatus('loading');
    try {
      const { data } = await api.get('/tasks');
      updateTasksState(data.tasks);
      setStatus('loaded');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks');

      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setTasks(parsed);
          setStatus('cached');
          return;
        }
      } catch (storageError) {
        console.warn('Failed to read cached tasks', storageError);
      }
      setStatus('error');
    }
  }, [storageKey, updateTasksState]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setStatus('idle');
      return undefined;
    }

    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setTasks(JSON.parse(cached));
      }
    } catch (storageError) {
      console.warn('Failed to load cached tasks', storageError);
    }

    fetchTasks();

    const socket = createSocket(user.id || user._id);

    socket.on('task:created', (task) => {
      upsertTask(task);
    });

    socket.on('task:updated', (task) => {
      upsertTask(task, 'append');
    });

    socket.on('task:deleted', (payload) => {
      updateTasksState((prev) => prev.filter((item) => item._id !== payload.id));
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchTasks, storageKey, updateTasksState, upsertTask, user]);

  const createTask = useCallback(
    async (task) => {
      try {
        const { data } = await api.post('/tasks', task);
        upsertTask(data.task);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.response?.data?.error || 'Failed to create task' };
      }
    },
    [upsertTask]
  );

  const updateTask = useCallback(async (id, updates) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, updates);
      upsertTask(data.task, 'append');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to update task' };
    }
  }, [upsertTask]);

  const deleteTask = useCallback(async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      updateTasksState((prev) => prev.filter((item) => item._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to delete task' };
    }
  }, [updateTasksState]);

  const upcomingTasks = tasks
    .filter((task) => task.dueDate)
    .map((task) => ({
      ...task,
      dueInDays: dayjs(task.dueDate).diff(dayjs(), 'day'),
    }))
    .sort((a, b) => a.dueInDays - b.dueInDays);

  return {
    tasks,
    status,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    upcomingTasks,
  };
};
