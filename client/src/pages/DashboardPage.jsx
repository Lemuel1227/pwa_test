import { useMemo, useState } from 'react';
import TaskModal from '../components/TaskModal.jsx';
import TaskList from '../components/TaskList.jsx';
import { useTasks } from '../hooks/useTasks.js';

const DashboardPage = () => {
  const { tasks, status, error, createTask, updateTask, deleteTask, upcomingTasks } = useTasks();
  const [editingTask, setEditingTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const inProgress = tasks.filter((task) => task.status === 'in-progress').length;
    const pending = total - completed - inProgress;
    return { total, completed, inProgress, pending };
  }, [tasks]);

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSubmit = async (payload) => {
    if (editingTask) {
      const result = await updateTask(editingTask._id, payload);
      if (result.success) {
        setEditingTask(null);
        setShowModal(false);
      }
      return result;
    }

    const result = await createTask(payload);
    if (result.success) {
      setShowModal(false);
    }
    return result;
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    await deleteTask(task._id);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setShowModal(false);
  };

  const statCards = [
    { label: 'Total drills', value: stats.total, color: '#1e3a8a' },
    { label: 'Completed', value: stats.completed, color: '#059669' },
    { label: 'In progress', value: stats.inProgress, color: '#d97706' },
    { label: 'Upcoming', value: upcomingTasks.length, color: '#dc2626' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'grid', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#1f2937' }}>Dashboard</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>Manage your training tasks and monitor progress</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {statCards.map((stat) => (
          <div key={stat.label} style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            borderLeft: `4px solid ${stat.color}`,
          }}>
            <p style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>
              {stat.label}
            </p>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div style={{ display: 'grid', gap: '2rem' }}>
          {error ? <div className="alert" style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>{error}</div> : null}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1f2937' }}>
              {status === 'loading' ? 'Loading tasks...' : `Tasks (${tasks.length})`}
            </h2>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '0.65rem 1.25rem',
                background: '#1e3a8a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => e.target.style.background = '#1e2d7b'}
              onMouseLeave={(e) => e.target.style.background = '#1e3a8a'}
            >
              + New Task
            </button>
          </div>

          <TaskList tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        <div style={{ display: 'grid', gap: '2rem' }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
              Upcoming
            </h3>
            {upcomingTasks.length ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                {upcomingTasks.slice(0, 5).map((task) => (
                  <li key={task._id} style={{
                    fontSize: '0.9rem',
                    padding: '0.75rem',
                    background: '#f3f4f6',
                    borderRadius: '6px',
                    borderLeft: '3px solid #d97706',
                  }}>
                    <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>
                      {task.title}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                      in {task.dueInDays} day{task.dueInDays === 1 ? '' : 's'}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>No upcoming tasks</p>
            )}
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={showModal}
        initialValues={editingTask}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitLabel={editingTask ? 'Update' : 'Create'}
      />
    </div>
  );
};

export default DashboardPage;
