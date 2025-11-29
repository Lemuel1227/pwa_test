import { useEffect } from 'react';

const ConfirmDeleteModal = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isProcessing = false,
  emphasisColor = '#dc2626',
}) => {
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
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(2px)',
          zIndex: 998,
        }}
        onClick={isProcessing ? undefined : onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          zIndex: 999,
          maxWidth: '420px',
          width: '90vw',
          padding: '2rem',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <header style={{ marginBottom: '1rem' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '9999px',
                background: emphasisColor,
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              !
            </span>
            {title}
          </h2>
        </header>
        {description ? (
          <p
            style={{
              margin: '0 0 1.5rem 0',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: '#4b5563',
            }}
          >
            {description}
          </p>
        ) : null}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#1f2937',
              fontWeight: 600,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.6 : 1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: emphasisColor,
              color: '#ffffff',
              fontWeight: 600,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.8 : 1,
            }}
          >
            {isProcessing ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmDeleteModal;
