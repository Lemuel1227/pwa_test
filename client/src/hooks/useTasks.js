import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const dedupeTasksById = (tasks) => {
  if (!Array.isArray(tasks)) {
    return tasks;
  }

  const seen = new Set();
  const result = [];

  for (const task of tasks) {
    const identifier = task?._id || task?.id;
    if (identifier && seen.has(identifier)) {
      continue;
    }
    if (identifier) {
      seen.add(identifier);
    }
    result.push(task);
  }

  return result;
};

const applyOfflineQueueSnapshot = (baseTasks = [], queue = []) => {
  let result = Array.isArray(baseTasks) ? [...baseTasks] : [];

  if (!queue.length) {
    return result;
  }

  const deleteIds = new Set();
  const updateMap = new Map();
  const createTasks = [];

  queue.forEach((entry) => {
    if (entry.type === 'delete') {
      deleteIds.add(entry.id);
    } else if (entry.type === 'update') {
      const existing = updateMap.get(entry.id) || {};
      updateMap.set(entry.id, { ...existing, ...entry.payload });
    } else if (entry.type === 'create') {
      createTasks.push(entry.task);
    }
  });

  if (deleteIds.size) {
    result = result.filter((task) => !deleteIds.has(task?._id || task?.id));
  }

  if (updateMap.size) {
    result = result.map((task) => {
      const identifier = task?._id || task?.id;
      if (identifier && updateMap.has(identifier)) {
        return { ...task, ...updateMap.get(identifier) };
      }
      return task;
    });
  }

  if (createTasks.length) {
    const createIds = new Set(createTasks.map((task) => task?._id || task?.id));
    result = result.filter((task) => !createIds.has(task?._id || task?.id));
    result = [...createTasks, ...result];
  }

  return dedupeTasksById(result);
};

export const useTasks = () => {
  const { user } = useAuthContext();
  const storageKey = useMemo(() => `sports-task-coach-tasks-${user?.id || user?._id || 'guest'}`, [
    user,
  ]);
  const queueKey = useMemo(
    () => `sports-task-coach-task-queue-${user?.id || user?._id || 'guest'}`,
    [user]
  );
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState([]);

  const offlineQueueRef = useRef([]);
  const applyOfflineQueue = useCallback(
    (tasksToProcess = []) => applyOfflineQueueSnapshot(tasksToProcess, offlineQueueRef.current),
    []
  );

  const updateTasksState = useCallback(
    (updater) => {
      setTasks((prev) => {
        const computed = typeof updater === 'function' ? updater(prev) : updater;
        const next = dedupeTasksById(computed);
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

  const mergeWithOfflineCreates = useCallback((serverTasks) => {
    if (!offlineQueueRef.current.length) {
      return serverTasks;
    }

    const pendingCreates = offlineQueueRef.current
      .filter((entry) => entry.type === 'create')
      .map((entry) => entry.task);

    const serverTaskIds = new Set((serverTasks || []).map((task) => task._id));
    const uniquePending = pendingCreates.filter((task) => !serverTaskIds.has(task._id));

    return [...uniquePending, ...(serverTasks || [])];
  }, []);

  const persistQueue = useCallback(
    (queue) => {
      try {
        localStorage.setItem(queueKey, JSON.stringify(queue));
      } catch (storageError) {
        console.warn('Failed to persist offline queue', storageError);
      }
    },
    [queueKey]
  );

  const updateQueueState = useCallback(
    (updater) => {
      setOfflineQueue((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        offlineQueueRef.current = next;
        persistQueue(next);
        return next;
      });
    },
    [persistQueue]
  );

  const fetchTasks = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const { data } = await api.get('/tasks');
      const mergedTasks = applyOfflineQueue(data.tasks);
      updateTasksState(mergedTasks);
      setStatus('loaded');
    } catch (err) {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const withQueueApplied = applyOfflineQueue(parsed);
          setTasks(withQueueApplied);
          setStatus('cached');
          setError(null);
          return;
        }
      } catch (storageError) {
        console.warn('Failed to read cached tasks', storageError);
      }
      setError(err.response?.data?.error || 'Failed to load tasks');
      setStatus('error');
    }
  }, [applyOfflineQueue, storageKey, updateTasksState]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setStatus('idle');
      setOfflineQueue([]);
      offlineQueueRef.current = [];
      return undefined;
    }

    try {
      const storedQueue = localStorage.getItem(queueKey);
      if (storedQueue) {
        const parsedQueue = JSON.parse(storedQueue);
        setOfflineQueue(parsedQueue);
        offlineQueueRef.current = parsedQueue;
      } else {
        setOfflineQueue([]);
        offlineQueueRef.current = [];
      }
    } catch (queueError) {
      console.warn('Failed to load offline queue', queueError);
      setOfflineQueue([]);
      offlineQueueRef.current = [];
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
  }, [fetchTasks, queueKey, storageKey, updateTasksState, upsertTask, user]);

  const createTask = useCallback(
    async (task) => {
      if (!navigator.onLine) {
        const tempId = `temp-${Date.now()}`;
        const timestamp = new Date().toISOString();
        const optimisticTask = {
          ...task,
          _id: tempId,
          isOffline: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        updateTasksState((prev) => [optimisticTask, ...prev]);
        updateQueueState((prev) => [
          ...prev,
          {
            id: tempId,
            type: 'create',
            payload: task,
            task: optimisticTask,
          },
        ]);

        return { success: true, offline: true, tempId };
      }

      try {
        const { data } = await api.post('/tasks', task);
        upsertTask(data.task);
        return { success: true, offline: false };
      } catch (err) {
        return { success: false, error: err.response?.data?.error || 'Failed to create task' };
      }
    },
    [updateQueueState, updateTasksState, upsertTask]
  );

  const updateTask = useCallback(async (id, updates) => {
    if (!navigator.onLine) {
      const timestamp = new Date().toISOString();

      updateTasksState((prev) =>
        prev.map((task) =>
          task._id === id
            ? { ...task, ...updates, isOffline: true, updatedAt: timestamp }
            : task
        )
      );

      updateQueueState((prev) => {
        const next = [...prev];
        const createIndex = next.findIndex((entry) => entry.type === 'create' && entry.id === id);
        if (createIndex >= 0) {
          next[createIndex] = {
            ...next[createIndex],
            payload: { ...next[createIndex].payload, ...updates },
            task: { ...next[createIndex].task, ...updates, updatedAt: timestamp },
          };
          return next;
        }

        const updateIndex = next.findIndex((entry) => entry.type === 'update' && entry.id === id);
        if (updateIndex >= 0) {
          next[updateIndex] = {
            ...next[updateIndex],
            payload: { ...next[updateIndex].payload, ...updates },
            updatedAt: timestamp,
          };
          return next;
        }

        next.push({ id, type: 'update', payload: updates, updatedAt: timestamp });
        return next;
      });

      return { success: true, offline: true };
    }

    try {
      const { data } = await api.put(`/tasks/${id}`, updates);
      upsertTask(data.task, 'append');
      return { success: true, offline: false };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to update task' };
    }
  }, [updateQueueState, updateTasksState, upsertTask]);

  const deleteTask = useCallback(async (id) => {
    if (!navigator.onLine) {
      updateTasksState((prev) => prev.filter((item) => item._id !== id));
      updateQueueState((prev) => {
        let next = prev.filter((entry) => !(entry.type === 'create' && entry.id === id));
        next = next.filter((entry) => !(entry.type === 'update' && entry.id === id));

        const hadCreate = prev.some((entry) => entry.type === 'create' && entry.id === id);

        if (!hadCreate) {
          const alreadyPendingDelete = next.some(
            (entry) => entry.type === 'delete' && entry.id === id
          );
          if (!alreadyPendingDelete) {
            next.push({ id, type: 'delete' });
          }
        }

        return next;
      });

      return { success: true, offline: true };
    }

    try {
      await api.delete(`/tasks/${id}`);
      updateTasksState((prev) => prev.filter((item) => item._id !== id));
      return { success: true, offline: false };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to delete task' };
    }
  }, [updateQueueState, updateTasksState]);

  const upcomingTasks = tasks
    .filter((task) => task.dueDate)
    .map((task) => ({
      ...task,
      dueInDays: dayjs(task.dueDate).diff(dayjs(), 'day'),
    }))
    .sort((a, b) => a.dueInDays - b.dueInDays);

  const syncOfflineTasks = useCallback(async () => {
    const queueSnapshot = [...offlineQueueRef.current];

    if (!navigator.onLine || !queueSnapshot.length) {
      return { synced: false, pendingCount: queueSnapshot.length, processed: 0 };
    }

    const remaining = [];
    let syncedAny = false;
    let processed = 0;

    for (const entry of queueSnapshot) {
      if (entry.type === 'create') {
        try {
          const { data } = await api.post('/tasks', entry.payload);
          syncedAny = true;
          processed += 1;

          updateTasksState((prev) => {
            const withoutTemp = prev.filter((task) => {
              const identifier = task._id || task.id;
              return identifier !== entry.id && identifier !== data.task._id;
            });
            return [data.task, ...withoutTemp];
          });
        } catch (err) {
          remaining.push(entry);
        }
      } else if (entry.type === 'update') {
        try {
          const { data } = await api.put(`/tasks/${entry.id}`, entry.payload);
          syncedAny = true;
          processed += 1;
          upsertTask(data.task, 'append');
        } catch (err) {
          remaining.push(entry);
        }
      } else if (entry.type === 'delete') {
        try {
          await api.delete(`/tasks/${entry.id}`);
          syncedAny = true;
          processed += 1;
          updateTasksState((prev) => prev.filter((task) => task._id !== entry.id));
        } catch (err) {
          remaining.push(entry);
        }
      } else {
        remaining.push(entry);
      }
    }

    updateQueueState(remaining);

    return {
      synced: syncedAny && remaining.length === 0,
      pendingCount: remaining.length,
      processed,
    };
  }, [updateQueueState, updateTasksState, upsertTask]);

  return {
    tasks,
    status,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    upcomingTasks,
    offlineQueue,
    syncOfflineTasks,
  };
};
