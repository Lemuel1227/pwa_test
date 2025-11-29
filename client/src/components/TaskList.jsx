import { useEffect, useState } from 'react';
import dayjs from '../utils/dayjs.js';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const statusLabels = {
  'in-progress': 'In progress',
  pending: 'Pending',
  completed: 'Completed',
};

const TaskList = ({ tasks: initialTasks, onEdit, onDelete, loading = false, error = null }) => {
  const [localTasks, setLocalTasks] = useState(initialTasks || []);
  const { isOnline } = useNetworkStatus();

  // Keep local tasks in sync with parent component
  useEffect(() => {
    setLocalTasks(initialTasks || []);
  }, [initialTasks]);

  if (loading) {
    return (
      <div className="empty-state">
        <div className="loading-spinner"></div>
        <p>Loading your training tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state error">
        <h3>Error loading tasks</h3>
        <p>{isOnline ? 'Unable to load tasks. Please try again.' : 'You are currently offline. Some tasks may not be up to date.'}</p>
      </div>
    );
  }

  const displayTasks = localTasks.length > 0 ? localTasks : [];

  if (displayTasks.length === 0) {
    return (
      <div className="empty-state">
        <h3>No drills yet</h3>
        <p>Create your first training task to stay ahead of the game.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {!isOnline && (
        <div className="offline-banner">
          <span>Offline Mode - Some features may be limited</span>
        </div>
      )}
      {displayTasks.map((task) => (
        <article key={task._id} className="task-card">
          <div className="task-card__header">
            <h3 className="task-card__title">{task.title}</h3>
            <span className="status-pill" data-status={task.status}>
              {statusLabels[task.status] ?? task.status}
            </span>
          </div>
          {task.description ? <p>{task.description}</p> : null}
          <div className="task-card__meta">
            {task.sport ? <span>Sport focus: {task.sport}</span> : null}
            {task.dueDate ? <span>Due {dayjs(task.dueDate).format('MMM D, YYYY')}</span> : null}
            <span>Last updated {dayjs(task.updatedAt).fromNow()}</span>
          </div>
          <div className="task-card__actions">
            <button 
              type="button" 
              className="btn btn--small" 
              onClick={() => onEdit(task)}
            >
              Edit
            </button>
            <button 
              type="button" 
              className="btn btn--small btn--danger" 
              onClick={() => onDelete(task)}
            >
              Delete
            </button>
          </div>
          {!isOnline ? (
            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>
              Changes will sync when you reconnect.
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
};

export default TaskList;
