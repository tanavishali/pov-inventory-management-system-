import { useSelector } from 'react-redux'

export default function GlobalLoader() {
  const isMutating = useSelector(state => {
    const mutations = state.api?.mutations ?? {}
    return Object.values(mutations).some(m => m?.status === 'pending')
  })

  if (!isMutating) return null

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(3px)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '28px 36px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        minWidth: '180px',
      }}>
        <div style={{ position: 'relative', width: '48px', height: '48px' }}>
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '3px solid #e2e8f0',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#0ea5e9',
            animation: 'gl-spin 0.75s linear infinite',
          }} />
        </div>
        <div style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: '14px',
          color: '#1e293b',
          letterSpacing: '.2px',
        }}>
          Processing...
        </div>
        <div style={{
          fontSize: '11.5px',
          color: '#94a3b8',
          fontFamily: "'Outfit', sans-serif",
        }}>
          Please wait a moment
        </div>
      </div>

      <style>{`
        @keyframes gl-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
