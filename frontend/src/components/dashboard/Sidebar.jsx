import { useNavigate } from 'react-router-dom'

export default function Sidebar({ isOpen, activeNav, onNavClick, onLogout, user, settings }) {
  const navigate = useNavigate()

  // Get plan/fee info from user object
  const feeStatus = user?.feeStatus || 'Unknown'
  const expiryDate = user?.expiryDate || ''
  const planBadgeColor = feeStatus === 'Paid' ? { bg: '#dcfce7', color: '#16a34a', icon: 'circle-check' } : { bg: '#fee2e2', color: '#dc2626', icon: 'triangle-exclamation' }

  const daysLeft = (() => {
    if (!expiryDate) return null
    const diff = new Date(expiryDate) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  })()

  const navItems = [
    {
      group: 'Main',
      items: [
        { icon: 'gauge-high',           label: 'Dashboard',           path: '/dashboard' },
        { icon: 'box-open',             label: 'Product Management',  path: '/products' },
        { icon: 'cart-shopping',        label: 'Order Management',    path: '/orders' },
        { icon: 'store',                label: 'Shops Management',    path: '/shops' },
        { icon: 'hand-holding-dollar',  label: 'Udhar Management',    path: '/udhar' },
        { icon: 'user-tie',             label: 'Salesman Management', path: '/salesman' },
      ],
    },
    {
      group: 'Finance',
      items: [
        { icon: 'file-invoice',      label: 'Invoice System',  path: '/invoices' },
        { icon: 'clock-rotate-left', label: 'Invoice History', path: '/invoice-history' },
        { icon: 'chart-bar',         label: 'Reports',         path: '/reports' },
      ],
    },
    {
      group: 'System',
      items: [
        { icon: 'clock-rotate-left', label: 'Activity History', path: '/activity' },
        { icon: 'gear',              label: 'System Settings',  path: '/settings' },
      ],
    },
  ]

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0,
      width: '260px', height: '100vh',
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex', flexDirection: 'column',
      zIndex: 1000,
      transition: 'transform 0.3s ease',
      overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none',
      boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '22px 20px', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
        onClick={() => onNavClick('Dashboard', '/dashboard')}>
        <div style={{
          width: '38px', height: '38px',
          background: settings?.logoSrc ? 'transparent' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
          borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '17px', color: '#fff', fontWeight: 800,
          fontFamily: "'Outfit', sans-serif", flexShrink: 0,
          boxShadow: settings?.logoSrc ? 'none' : '0 4px 10px rgba(14,165,233,0.35)',
          overflow: 'hidden',
          border: settings?.logoSrc ? '1px solid #e2e8f0' : 'none',
        }}>
          {settings?.logoSrc ? (
            <img src={settings.logoSrc} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (settings?.brandName || 'WholesalePro').charAt(0).toUpperCase()
          )}
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '15px', color: '#1e293b', lineHeight: 1.1 }}>
          {settings?.brandName || 'WholesalePro'}
          <span style={{ display: 'block', color: '#0ea5e9', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', marginTop: '1px' }}>MANAGEMENT</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '14px 12px', flex: 1 }}>
        {navItems.map(({ group, items }) => (
          <div key={group}>
            <div style={{ fontSize: '9.5px', letterSpacing: '1.8px', color: '#94a3b8', fontWeight: 700, padding: '10px 8px 4px', textTransform: 'uppercase' }}>
              {group}
            </div>
            {items.map(({ icon, label, path }) => {
              const isActive = activeNav === label
              return (
                <a key={label} href="#"
                  onClick={e => { e.preventDefault(); onNavClick(label, path) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '11px',
                    padding: '9px 12px', borderRadius: '9px',
                    color: isActive ? (group === 'Super Control' ? '#4338ca' : '#0ea5e9') : '#64748b',
                    cursor: 'pointer', transition: 'all 0.18s', fontSize: '13px',
                    marginBottom: '2px', textDecoration: 'none', fontWeight: isActive ? 600 : 500,
                    background: isActive ? (group === 'Super Control' ? 'linear-gradient(135deg,#eef2ff,#e0e7ff)' : 'linear-gradient(135deg,#e0f2fe,#ede9fe)') : 'transparent',
                    boxShadow: isActive ? `inset 3px 0 0 ${group === 'Super Control' ? '#4338ca' : '#0ea5e9'}` : 'none',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.color = '#0ea5e9' } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' } }}
                >
                  <i className={`fa-solid fa-${icon}`} style={{ width: '17px', textAlign: 'center', fontSize: '13px' }} />
                  {label}
                </a>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User Status - Generic for Shop Managers */}
      <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
             {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
             <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
             <div style={{ fontSize: '10px', color: '#64748b' }}>Store Account</div>
          </div>
        </div>
      </div>

      {/* Plan Badge */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ background: planBadgeColor.bg, borderRadius: '10px', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
            <i className={`fa-solid fa-${planBadgeColor.icon}`} style={{ color: planBadgeColor.color, fontSize: '13px' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: planBadgeColor.color }}>
              Plan: {feeStatus}
            </span>
          </div>
          {expiryDate && (
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {daysLeft !== null && daysLeft > 0
                ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                : daysLeft !== null && daysLeft <= 0
                ? <span style={{ color: '#dc2626', fontWeight: 700 }}>Expired!</span>
                : `Expiry: ${expiryDate}`
              }
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0' }}>
        <a href="#" onClick={e => { e.preventDefault(); onLogout() }}
          style={{
            display: 'flex', alignItems: 'center', gap: '11px',
            padding: '9px 12px', borderRadius: '9px',
            color: '#ef4444', cursor: 'pointer', fontSize: '13px',
            textDecoration: 'none', fontWeight: 500,
          }}
        >
          <i className="fa-solid fa-right-from-bracket" style={{ width: '17px', textAlign: 'center' }} />
          Logout
        </a>
      </div>
    </aside>
  )
}
