import { useEffect } from 'react';
import TaskForm from './TaskForm.jsx';

const TaskModal = ({ isOpen, initialValues, onClose, onSubmit, submitLabel }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxWidth: '500px',
          width: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>

        {/* Form Title */}
        <h2 style={{ fontSize: '1.5rem', marginTop: 0, marginBottom: '1.5rem', color: '#1f2937' }}>
          {initialValues ? 'Update training task' : 'Create a new training task'}
        </h2>

        {/* Form */}
        <div style={{ marginTop: '1.5rem' }}>
          <TaskForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitLabel={submitLabel}
          />
        </div>
      </div>
    </>
  );
};

export default TaskModal;
