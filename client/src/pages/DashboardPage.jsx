import { useMemo, useState, useEffect } from 'react';
import TaskModal from '../components/TaskModal.jsx';
import TaskList from '../components/TaskList.jsx';
import { useTasks } from '../hooks/useTasks.js';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { toast } from 'react-toastify';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx';

const DashboardPage = () => {
  const { 
    tasks, 
    status, 
    error, 
    createTask, 
    updateTask, 
    deleteTask, 
    upcomingTasks,
    syncOfflineTasks
  } = useTasks();
  
  const [editingTask, setEditingTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  
  // Handle network status changes and sync tasks when coming back online
  useEffect(() => {
    if (!isOnline) {
      setShowOfflineBanner(true);
    } else if (wasOffline) {
      // Start syncing when coming back online
      const syncTasks = async () => {
        try {
          await syncOfflineTasks();
          toast.success('Tasks synced successfully!');
        } catch (err) {
          console.error('Error syncing tasks:', err);
          toast.error('Failed to sync tasks. Some changes may not be saved.');
        } finally {
          // Keep showing the banner briefly after syncing
          const timer = setTimeout(() => {
            setShowOfflineBanner(false);
          }, 5000);
          return () => clearTimeout(timer);
        }
      };
      syncTasks();
    } else {
      setShowOfflineBanner(false);
    }
  }, [isOnline, wasOffline, syncOfflineTasks]);

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
    try {
      if (editingTask) {
        const result = await updateTask(editingTask._id, payload);
        if (result.success) {
          setEditingTask(null);
          setShowModal(false);
          if (!isOnline) {
            toast.info('Changes will be synced when you are back online');
          }
        } else if (!isOnline) {
          toast.error('Failed to save changes offline. Please try again when online.');
        }
        return result;
      }

      const result = await createTask(payload);
      if (result.success) {
        setShowModal(false);
        if (!isOnline) {
          toast.info('Task will be synced when you are back online');
        }
      } else if (!isOnline) {
        toast.error('Failed to create task offline. Please try again when online.');
      }
      return result;
    } catch (err) {
      console.error('Error saving task:', err);
      throw err;
    }
  };

  const handleDeleteRequest = (task) => {
    setDeleteTarget(task);
    setIsDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const result = await deleteTask(deleteTarget._id);

      if (result.success) {
        if (result.offline) {
          toast.info('Deletion queued. It will sync when you reconnect.');
        } else {
          toast.success('Task deleted successfully.');
        }
      } else {
        toast.error(result.error || 'Failed to delete task. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
      setIsDeleteModalOpen(false);
    }
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
    <div className="dashboard">
      {showOfflineBanner && (
        <div className="offline-banner" style={{
          background: isOnline ? '#d1fae5' : '#fef3c7',
          color: isOnline ? '#065f46' : '#92400e',
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center',
          fontWeight: 500
        }}>
          {isOnline 
            ? "Syncing your latest updates..." 
            : "You are currently offline. Recent drills and schedules you viewed are still available. Once you're back online, we will sync the latest updates automatically."}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
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

          <TaskList 
            tasks={upcomingTasks} 
            onEdit={handleEdit} 
            onDelete={handleDeleteRequest} 
            loading={status === 'loading'}
            error={error}
          />
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

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title="Delete training task"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete task"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default DashboardPage;
