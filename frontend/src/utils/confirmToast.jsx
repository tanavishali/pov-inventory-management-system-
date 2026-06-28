import { toast } from 'react-toastify'

export function confirmToast(message, { confirmLabel = 'Yes, Delete', confirmColor = '#ef4444' } = {}) {
  return new Promise((resolve) => {
    toast.warn(
      ({ closeToast }) => (
        <div>
          <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '13px', color: '#1e293b', lineHeight: 1.4 }}>
            {message}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { resolve(true); closeToast() }}
              style={{ flex: 1, padding: '7px 10px', borderRadius: '7px', background: confirmColor, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '12.5px' }}
            >
              {confirmLabel}
            </button>
            <button
              onClick={() => { resolve(false); closeToast() }}
              style={{ flex: 1, padding: '7px 10px', borderRadius: '7px', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600, cursor: 'pointer', fontSize: '12.5px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false, closeButton: false, icon: '⚠️' }
    )
  })
}
