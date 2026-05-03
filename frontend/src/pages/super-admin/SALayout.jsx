import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'

export default function SALayout({ user, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(true)
      else setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [location.pathname])

  if (!user || user.role !== 'super-admin') {
    return <Navigate to="/dashboard" replace />
  }

  const navItems = [
    { label: 'Platform Overview', path: '/super-admin',          icon: 'chart-pie' },
    { label: 'User Management',   path: '/super-admin/users',    icon: 'users-gear' },
    { label: 'Payments',          path: '/super-admin/payments', icon: 'credit-card' },
  ]

  const activeLabel = navItems.find(n => n.path === location.pathname)?.label || 'Super Admin'

  const handleNavClick = (path) => {
    navigate(path)
    if (isMobile) setSidebarOpen(false)
  }

  return (
    <div style={{ background: '#f0f6ff', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans',sans-serif", overflowX: 'hidden' }}>

      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          zIndex: 999, backdropFilter: 'blur(2px)',
        }} />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0,
        width: '255px', height: '100vh',
        background: '#fff', borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column',
        zIndex: 1000, transition: 'transform 0.3s ease',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        overflowY: 'auto',
        boxShadow: '2px 0 12px rgba(14,165,233,.07)',
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: 900, flexShrink: 0, boxShadow: '0 4px 12px rgba(14,165,233,.3)' }}>
            <i className="fa-solid fa-shield-halved" />
          </div>
          <div>
            <div style={{ color: '#1e293b', fontWeight: 800, fontSize: '14px', lineHeight: 1.1 }}>Master Control</div>
            <div style={{ color: '#0ea5e9', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', marginTop: '2px' }}>SUPER ADMIN</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          <div style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 8px 10px' }}>Navigation</div>
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <div key={item.path} onClick={() => handleNavClick(item.path)}
                style={{
                  padding: '11px 14px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', gap: '11px',
                  cursor: 'pointer', transition: 'all 0.18s', marginBottom: '3px',
                  background: isActive ? '#e0f2fe' : 'transparent',
                  color: isActive ? '#0ea5e9' : '#64748b',
                  fontWeight: isActive ? 700 : 500, fontSize: '13.5px',
                  boxShadow: isActive ? 'inset 3px 0 0 #0ea5e9' : 'none',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.color = '#0ea5e9' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' } }}
              >
                <i className={`fa-solid fa-${item.icon}`} style={{ width: '18px', fontSize: '14px', textAlign: 'center' }} />
                <span>{item.label}</span>
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '14px 12px', borderTop: '1px solid #e2e8f0' }}>
          <div onClick={() => navigate('/dashboard')}
            style={{ padding: '10px 14px', borderRadius: '9px', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '6px', transition: 'all .18s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
          >
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '12px' }} /> Back to Dashboard
          </div>
          <button onClick={onLogout}
            style={{ width: '100%', padding: '10px', borderRadius: '9px', background: '#fee2e2', color: '#dc2626', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
            <i className="fa-solid fa-right-from-bracket" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Topbar — fixed at top */}
      <header style={{
        position: 'fixed', top: 0, right: 0,
        left: (!isMobile && sidebarOpen) ? '255px' : 0,
        transition: 'left 0.3s ease',
        padding: '14px 24px', background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 90, boxShadow: '0 1px 4px rgba(0,0,0,.06)',
        height: '60px', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', width: '34px', height: '34px', borderRadius: '8px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-bars" />
          </button>
          <div>
            <h2 style={{ color: '#1e293b', fontSize: '17px', fontWeight: 800, lineHeight: 1 }}>{activeLabel}</h2>
            <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>WholesalePro Super Admin Panel</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', background: '#f0f9ff', borderRadius: '99px', border: '1px solid #bae6fd' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 800 }}>
            <i className="fa-solid fa-user-shield" />
          </div>
          <div style={{ color: '#1e293b', fontSize: '13px', fontWeight: 700 }}>Super Admin</div>
        </div>
      </header>

      {/* Main content */}
      <main style={{
        marginLeft: (!isMobile && sidebarOpen) ? '255px' : 0,
        marginTop: '60px',
        transition: 'margin-left 0.3s ease',
        padding: isMobile ? '12px 10px' : '24px',
        minHeight: 'calc(100vh - 60px)',
        background: '#f0f6ff',
      }}>
        <Outlet />
      </main>
    </div>
  )
}
