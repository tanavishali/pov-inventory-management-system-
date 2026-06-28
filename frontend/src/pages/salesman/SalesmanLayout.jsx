import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useGetProductsQuery } from '../../store/slices/productsApiSlice'
import GlobalLoader from '../../components/ui/GlobalLoader'

export default function SalesmanLayout({ user, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef(null)

  // Live stock alerts from the backend (was previously bound to an empty constant
  // so the bell never showed anything).
  const { data: dbProducts = [] } = useGetProductsQuery()

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

  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
    }
    if (bellOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [bellOpen])

  if (!user || user.role !== 'salesman') {
    return <Navigate to="/dashboard" replace />
  }

  const thresholdOf = p => (p.threshold !== undefined && p.threshold !== null ? Number(p.threshold) : 10)
  const outOfStock = dbProducts.filter(p => p.stock === 0)
  const lowStock = dbProducts.filter(p => p.stock > 0 && p.stock <= thresholdOf(p))
  const allAlerts = dbProducts.filter(p => p.stock === 0 || p.stock <= thresholdOf(p))

  const navItems = [
    { label: 'Dashboard',     path: '/salesman',         icon: 'gauge-high' },
    { label: 'New Order',     path: '/salesman/order',   icon: 'cart-plus' },
    { label: 'Order History', path: '/salesman/history', icon: 'clock-rotate-left' },
    { label: 'Udhar',         path: '/salesman/udhar',   icon: 'hand-holding-dollar' },
  ]

  const activeLabel = navItems.find(n => n.path === location.pathname)?.label || 'Salesman Panel'

  const handleNav = (path) => {
    navigate(path)
    if (isMobile) setSidebarOpen(false)
  }

  return (
    <div style={{ background: '#f0f4f8', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans',sans-serif", overflowX: 'hidden' }}>
      <GlobalLoader />

      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          zIndex: 999, backdropFilter: 'blur(2px)',
        }} />
      )}

      <aside style={{
        position: 'fixed', top: 0, left: 0,
        width: '260px', height: '100vh',
        background: '#fff', borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column',
        zIndex: 1000, transition: 'transform 0.3s ease',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        overflowY: 'auto', boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '22px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', color: '#fff', fontWeight: 800, flexShrink: 0, boxShadow: '0 4px 10px rgba(14,165,233,0.35)' }}>W</div>
          <div style={{ fontWeight: 800, fontSize: '15px', color: '#1e293b', lineHeight: 1.1 }}>
            WholesalePro
            <span style={{ display: 'block', color: '#0ea5e9', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', marginTop: '1px' }}>SALESMAN PANEL</span>
          </div>
        </div>

        <nav style={{ padding: '14px 12px', flex: 1 }}>
          <div style={{ fontSize: '9.5px', letterSpacing: '1.8px', color: '#94a3b8', fontWeight: 700, padding: '10px 8px 4px', textTransform: 'uppercase' }}>Navigation</div>
          {navItems.map(({ icon, label, path }) => {
            const isActive = location.pathname === path
            return (
              <div key={path} onClick={() => handleNav(path)} style={{
                display: 'flex', alignItems: 'center', gap: '11px',
                padding: '10px 12px', borderRadius: '9px',
                color: isActive ? '#0ea5e9' : '#64748b',
                cursor: 'pointer', transition: 'all 0.18s', fontSize: '13px',
                marginBottom: '2px', fontWeight: isActive ? 600 : 500,
                background: isActive ? 'linear-gradient(135deg,#e0f2fe,#ede9fe)' : 'transparent',
                boxShadow: isActive ? 'inset 3px 0 0 #0ea5e9' : 'none',
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.color = '#0ea5e9' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' } }}
              >
                <i className={`fa-solid fa-${icon}`} style={{ width: '17px', textAlign: 'center', fontSize: '13px' }} />
                {label}
              </div>
            )
          })}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Salesman'}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Salesman</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0' }}>
          <div onClick={onLogout} style={{
            display: 'flex', alignItems: 'center', gap: '11px',
            padding: '9px 12px', borderRadius: '9px', color: '#ef4444',
            cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all .18s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ width: '17px', textAlign: 'center' }} />
            Logout
          </div>
        </div>
      </aside>

      {/* Fixed Topbar */}
      <header style={{
        position: 'fixed', top: 0, right: 0,
        left: (!isMobile && sidebarOpen) ? '260px' : 0,
        transition: 'left 0.3s ease',
        padding: '14px 20px', background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 90, boxShadow: '0 1px 4px rgba(0,0,0,.06)',
        height: '60px', boxSizing: 'border-box',
      }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', width: '34px', height: '34px', borderRadius: '8px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-bars" />
            </button>
            <div>
              <h2 style={{ color: '#1e293b', fontSize: '17px', fontWeight: 800, lineHeight: 1 }}>{activeLabel}</h2>
              <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>WholesalePro Salesman Panel</div>
            </div>
          </div>

          {/* Only Bell - No Account Chip */}
          <div ref={bellRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setBellOpen(v => !v)}
              style={{ position: 'relative', width: '36px', height: '36px', background: bellOpen ? '#fef9c3' : '#f1f5f9', border: 'none', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: allAlerts.length > 0 ? '#f59e0b' : '#94a3b8', fontSize: '15px', cursor: 'pointer', transition: 'all .18s' }}
            >
              <i className="fa-solid fa-bell" />
              {allAlerts.length > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', background: '#ef4444', color: '#fff', borderRadius: '50%', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                  {allAlerts.length}
                </span>
              )}
            </button>

            {bellOpen && (
              <div style={{
                position: 'absolute', top: '44px', right: 0,
                width: '300px', background: '#fff', borderRadius: '14px',
                boxShadow: '0 12px 40px rgba(0,0,0,.18)', border: '1px solid #e2e8f0',
                zIndex: 999, overflow: 'hidden',
              }}>
                <div style={{ padding: '13px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbeb' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: '#f59e0b', marginRight: '7px' }} />
                    Stock Alerts
                  </div>
                  {allAlerts.length > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', borderRadius: '99px', fontSize: '11px', fontWeight: 700, padding: '2px 8px' }}>
                      {allAlerts.length}
                    </span>
                  )}
                </div>

                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {allAlerts.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      <i className="fa-solid fa-circle-check" style={{ fontSize: '28px', color: '#10b981', display: 'block', marginBottom: '8px' }} />
                      All products ka stock theek hai!
                    </div>
                  ) : (
                    <>
                      {outOfStock.length > 0 && (
                        <div>
                          <div style={{ padding: '7px 16px', background: '#fee2e2', fontSize: '10px', fontWeight: 700, color: '#dc2626', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            <i className="fa-solid fa-circle-xmark" style={{ marginRight: '5px' }} /> Out of Stock ({outOfStock.length})
                          </div>
                          {outOfStock.map(p => (
                            <div key={p.id} style={{ padding: '9px 16px', borderBottom: '1px solid #fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{p.name}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.cat}</div>
                              </div>
                              <span style={{ background: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '11px', fontWeight: 700, padding: '2px 8px', flexShrink: 0 }}>Out</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {lowStock.length > 0 && (
                        <div>
                          <div style={{ padding: '7px 16px', background: '#fef9c3', fontSize: '10px', fontWeight: 700, color: '#b45309', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '5px' }} /> Low Stock ({lowStock.length})
                          </div>
                          {lowStock.map(p => (
                            <div key={p.id} style={{ padding: '9px 16px', borderBottom: '1px solid #fefce8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{p.name}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.cat}</div>
                              </div>
                              <span style={{ background: '#fef9c3', color: '#b45309', borderRadius: '6px', fontSize: '11px', fontWeight: 700, padding: '2px 8px', flexShrink: 0 }}>{p.stock} baki</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div style={{ padding: '8px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                  Only in-stock products can be ordered
                </div>
              </div>
            )}
          </div>
      </header>

      {/* Main content */}
      <main style={{
        marginLeft: (!isMobile && sidebarOpen) ? '260px' : 0,
        marginTop: '60px',
        transition: 'margin-left 0.3s ease',
        padding: isMobile ? '12px 10px' : '24px',
        minHeight: 'calc(100vh - 60px)',
        background: '#f0f4f8',
      }}>
        <Outlet context={{ user, isMobile }} />
      </main>
    </div>
  )
}
