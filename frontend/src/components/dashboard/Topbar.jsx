import { useState } from 'react'

export default function Topbar({ sidebarOpen, onToggle, pageTitle, period, onPeriodChange, isMobile, showPeriodTabs = true, lowStockItems = [] }) {
  const periods = ['Daily', 'Weekly', 'Monthly']
  const [showNotif, setShowNotif] = useState(false)
  const count = lowStockItems.length

  return (
    <header style={{
      position: 'fixed', top: 0,
      left: (!isMobile && sidebarOpen) ? '260px' : 0,
      right: 0, height: '60px',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', zIndex: 900,
      transition: 'left 0.3s ease',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Left: Hamburger + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button onClick={onToggle} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#1e293b', fontSize: '18px', padding: '8px', borderRadius: '8px',
          transition: 'background .2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#f5f7fa'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <i className="fa-solid fa-bars" />
        </button>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '17px', color: '#1e293b', marginLeft: '8px' }}>
          {pageTitle}
        </div>
      </div>

      {/* Right: Period tabs + Notification Bell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {!isMobile && showPeriodTabs && (
          <div style={{
            display: 'flex', gap: '3px',
            background: '#f5f7fa', padding: '3px', borderRadius: '9px',
            border: '1px solid #e2e8f0',
          }}>
            {periods.map(p => (
              <button key={p} onClick={() => onPeriodChange(p.toLowerCase())}
                style={{
                  padding: '6px 16px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                  fontSize: '12.5px', fontWeight: period === p.toLowerCase() ? 700 : 500,
                  background: period === p.toLowerCase() ? '#ffffff' : 'transparent',
                  color: period === p.toLowerCase() ? '#0ea5e9' : '#94a3b8',
                  boxShadow: period === p.toLowerCase() ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.18s',
                }}
              >{p}</button>
            ))}
          </div>
        )}

        {/* ─── Notification Bell ─── */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotif(v => !v)}
            style={{
              position: 'relative',
              background: count > 0 ? '#fef3c7' : '#f5f7fa',
              border: count > 0 ? '1.5px solid #fde68a' : '1.5px solid #e2e8f0',
              borderRadius: '10px', width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all .2s', fontSize: '16px',
              color: count > 0 ? '#b45309' : '#64748b',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = count > 0 ? '#fde68a' : '#e2e8f0' }}
            onMouseLeave={e => { e.currentTarget.style.background = count > 0 ? '#fef3c7' : '#f5f7fa' }}
            title="Stock Notifications"
          >
            <i className="fa-solid fa-bell" />
            {count > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                background: '#ef4444', color: '#fff',
                borderRadius: '999px', minWidth: '18px', height: '18px',
                fontSize: '10px', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px', border: '2px solid #fff',
                fontFamily: "'Outfit',sans-serif",
                boxShadow: '0 2px 6px rgba(239,68,68,.4)',
                animation: 'notifPop .3s ease',
              }}>
                {count}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotif && (
            <>
              <div onClick={() => setShowNotif(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000 }} />
              <div style={{
                position: 'absolute', top: '46px', right: 0,
                background: '#fff', border: '1px solid #e2e8f0',
                borderRadius: '14px', width: '300px',
                boxShadow: '0 12px 40px rgba(0,0,0,.14)',
                zIndex: 1001, overflow: 'hidden',
                animation: 'notifSlide .18s ease',
              }}>
                {/* Header */}
                <div style={{
                  padding: '14px 16px 10px', borderBottom: '1px solid #f1f5f9',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>
                    <i className="fa-solid fa-bell" style={{ color: '#f59e0b', marginRight: '7px' }} />
                    Stock Alerts
                  </div>
                  <span style={{
                    background: count > 0 ? '#fef3c7' : '#f1f5f9',
                    color: count > 0 ? '#b45309' : '#94a3b8',
                    borderRadius: '999px', padding: '2px 8px', fontSize: '11px', fontWeight: 700,
                  }}>
                    {count} alert{count !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Items */}
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {count === 0 ? (
                    <div style={{ textAlign: 'center', padding: '28px 16px', color: '#94a3b8' }}>
                      <i className="fa-solid fa-circle-check" style={{ fontSize: '30px', color: '#10b981', marginBottom: '8px', display: 'block' }} />
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Sab theek hai!</div>
                      <div style={{ fontSize: '11.5px', marginTop: '3px' }}>Koi bhi product low stock nahi</div>
                    </div>
                  ) : (
                    lowStockItems.map((p, i) => {
                      const isOut = p.stock === 0
                      return (
                        <div key={p.id} style={{
                          padding: '11px 16px',
                          borderBottom: i < lowStockItems.length - 1 ? '1px solid #f8fafc' : 'none',
                          display: 'flex', alignItems: 'center', gap: '10px',
                          background: '#fff', transition: 'background .15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        >
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                            background: isOut ? '#fee2e2' : '#fef3c7',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', color: isOut ? '#dc2626' : '#b45309',
                          }}>
                            <i className={`fa-solid fa-${isOut ? 'circle-xmark' : 'triangle-exclamation'}`} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '11px', marginTop: '2px', color: isOut ? '#dc2626' : '#b45309', fontWeight: 600 }}>
                              {isOut ? '⚠ Out of Stock' : `Stock: ${p.stock} / Min: ${p.threshold}`}
                            </div>
                          </div>
                          <span style={{
                            padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800,
                            background: isOut ? '#fee2e2' : '#fef9c3',
                            color: isOut ? '#dc2626' : '#b45309',
                            whiteSpace: 'nowrap', flexShrink: 0,
                          }}>
                            {isOut ? 'OUT' : 'LOW'}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Footer */}
                <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                    <i className="fa-solid fa-box" style={{ marginRight: '5px', color: '#0ea5e9' }} />
                    Product Management mein stock update karein
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes notifPop { from { transform: scale(0); } to { transform: scale(1); } }
        @keyframes notifSlide { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: translateY(0); } }
      `}</style>
    </header>
  )
}
