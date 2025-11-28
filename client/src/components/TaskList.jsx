import dayjs from '../utils/dayjs.js';

const statusLabels = {
  'in-progress': 'In progress',
  pending: 'Pending',
  completed: 'Completed',
};

const TaskList = ({ tasks, onEdit, onDelete }) => {
  if (!tasks.length) {
    return (
      <div className="empty-state">
        <h3>No drills yet</h3>
        <p>Create your first training task to stay ahead of the game.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
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
            <button type="button" className="btn btn--small" onClick={() => onEdit(task)}>
              Edit
            </button>
            <button type="button" className="btn btn--small btn--danger" onClick={() => onDelete(task)}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default TaskList;
