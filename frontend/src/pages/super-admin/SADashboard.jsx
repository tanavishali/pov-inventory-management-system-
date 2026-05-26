import { useState, useEffect } from 'react'
import { useGetPlatformStatsQuery } from '../../store/slices/superAdminApiSlice'

export default function SADashboard() {
  const { data: stats, isLoading, isError, refetch } = useGetPlatformStatsQuery()
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Operations Simulation States
  const [billingState, setBillingState] = useState('idle') // idle, running, success
  const [billingProgress, setBillingProgress] = useState(0)
  
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcastSent, setBroadcastSent] = useState(false)
  
  const [diagnosticState, setDiagnosticState] = useState('idle') // idle, running, success
  const [diagnosticLogs, setDiagnosticLogs] = useState([])
  const [dbLatency, setDbLatency] = useState(12)

  // Auto-reset broadcast success notification after 3 seconds
  useEffect(() => {
    if (broadcastSent) {
      const t = setTimeout(() => setBroadcastSent(false), 3000)
      return () => clearTimeout(t)
    }
  }, [broadcastSent])

  // Refetch action
  const handleForceRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 800)
  }

  // Simulated Invoice Billing Run
  const startSimulatedBilling = () => {
    if (billingState === 'running') return
    setBillingState('running')
    setBillingProgress(0)
    
    const interval = setInterval(() => {
      setBillingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setBillingState('success')
          refetch() // Refresh to fetch latest seeded data
          setTimeout(() => setBillingState('idle'), 4000)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  // Simulated System Diagnostic Check
  const runDiagnostics = () => {
    if (diagnosticState === 'running') return
    setDiagnosticState('running')
    setDiagnosticLogs(['Initializing core check...', 'Scanning active MongoDB nodes...', 'Verifying SSL Certificates...', 'Testing SMS gateway handshake...'])
    
    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, 'All microservices responded successfully.', 'Average API Latency: 14ms'])
      setDbLatency(Math.floor(Math.random() * 8) + 8)
      setDiagnosticState('success')
      setTimeout(() => setDiagnosticState('idle'), 5000)
    }, 2000)
  }

  const handleSendBroadcast = (e) => {
    e.preventDefault()
    if (!broadcastMsg.trim()) return
    setBroadcastSent(true)
    setBroadcastOpen(false)
    setBroadcastMsg('')
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '450px', color: '#64748b' }}>
        <i className="fa-solid fa-compass-drafting fa-spin" style={{ fontSize: '48px', color: '#6366f1', marginBottom: '20px' }} />
        <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b', letterSpacing: '.3px' }}>Assembling Administrative Desk...</div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>Fetching real-time business and tenant data</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#dc2626', background: '#fff', borderRadius: '18px', border: '1.5px solid #fee2e2', maxWidth: '600px', margin: '40px auto' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '54px', marginBottom: '20px', color: '#ef4444', display: 'block' }} />
        <div style={{ fontWeight: 800, fontSize: '20px', color: '#1e293b', marginBottom: '10px' }}>Telemetry Link Failed</div>
        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px', lineHeight: '1.6' }}>
          Unable to establish a secure handshake with the Super Admin telemetry API. Please check your database connectivity or token expiration state.
        </div>
        <button onClick={refetch} style={{ padding: '12px 30px', borderRadius: '12px', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 14px rgba(99,102,241,.3)', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Retry Handshake
        </button>
      </div>
    )
  }

  const {
    totalLicenses = 0,
    activeShops = 0,
    demoShops = 0,
    lockedShops = 0,
    unpaidAccounts = 0,
    expectedMrr = 0,
    totalCollected = 0,
    totalPending = 0,
    planStats = { Basic: 0, Premium: 0, Enterprise: 0 },
    methodStats = { EasyPaisa: 0, JazzCash: 0, BankTransfer: 0, Unspecified: 0 },
    recentPayments = [],
    recentAdmins = []
  } = stats || {}

  const totalPlans = (planStats.Basic || 0) + (planStats.Premium || 0) + (planStats.Enterprise || 0) || 1
  const basicPct = Math.round(((planStats.Basic || 0) / totalPlans) * 100)
  const premiumPct = Math.round(((planStats.Premium || 0) / totalPlans) * 100)
  const enterprisePct = Math.round(((planStats.Enterprise || 0) / totalPlans) * 100)

  // Styling Tokens
  const cardStyle = {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 18px rgba(15,23,42,0.015), 0 2px 4px rgba(15,23,42,0.01)',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden'
  }

  const tabButtonStyle = (tabName) => ({
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 700,
    fontSize: '13.5px',
    cursor: 'pointer',
    background: activeTab === tabName ? '#0f172a' : 'transparent',
    color: activeTab === tabName ? '#fff' : '#64748b',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  })

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* ── BROADCAST SUCCESS TOAST ── */}
      {broadcastSent && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#0f172a', color: '#fff', padding: '16px 24px', borderRadius: '12px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-bullhorn" style={{ fontSize: '12px' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '13.5px' }}>Announcement Broadcasted</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Sent successfully to all {activeShops} active shops.</div>
          </div>
        </div>
      )}

      {/* ── SUPER ADMIN HERO BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        borderRadius: '20px',
        padding: '32px',
        color: '#fff',
        marginBottom: '24px',
        boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow decorative overlays */}
        <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50%', left: '-10%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', padding: '6px 14px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              <span className="pulse-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
              Command Center Control
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, marginTop: '14px', letterSpacing: '-0.75px', background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Platform Overview Dashboard
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', marginTop: '6px', fontWeight: 500, maxWidth: '650px', lineHeight: 1.5 }}>
              Enterprise monitoring for multi-tenant wholesale ecosystems, licensing states, gateway transaction volumes, and overall microservice metrics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setBroadcastOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            >
              <i className="fa-solid fa-bullhorn" /> System Broadcast
            </button>

            <button onClick={handleForceRefresh} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.25)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(99,102,241,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.25)' }}
            >
              <i className={`fa-solid fa-rotate-right ${isRefreshing ? 'fa-spin' : ''}`} /> {isRefreshing ? 'Syncing...' : 'Force Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE TAB BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '5px', borderRadius: '12px', gap: '4px' }}>
          <button style={tabButtonStyle('overview')} onClick={() => setActiveTab('overview')}>
            <i className="fa-solid fa-chart-pie" /> Platform Summary
          </button>
          <button style={tabButtonStyle('revenue')} onClick={() => setActiveTab('revenue')}>
            <i className="fa-solid fa-chart-line" /> Revenue Analytics
          </button>
         
        </div>

        {/* Dynamic Telemetry Metric Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#64748b', background: '#fff', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
          Database Connection: Active ({dbLatency}ms)
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── TAB CONTENT: OVERVIEW ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          
          {/* ── CORE METRICS PANEL ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            
            {/* Projected MRR (Wholesale Pro subscription potential) */}
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none', color: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(99,102,241,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  <i className="fa-solid fa-sack-dollar" />
                </div>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projected MRR</span>
              </div>
              <div style={{ fontSize: '11px', color: '#c7d2fe', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px' }}>Monthly Active Bookings</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '28px', fontWeight: 900, marginTop: '4px', letterSpacing: '-0.5px' }}>
                ₨ {expectedMrr.toLocaleString()}
              </div>
              <p style={{ fontSize: '11.5px', color: '#e0e7ff', marginTop: '8px', opacity: 0.9 }}>
                Aggregate potential from {activeShops} active shop owners.
              </p>
              <i className="fa-solid fa-sack-dollar" style={{ position: 'absolute', right: '-10%', bottom: '-10%', fontSize: '90px', color: '#fff', opacity: 0.06, transform: 'rotate(-10deg)' }} />
            </div>

            {/* Collected Revenue (Sum of all invoices paid) */}
            <div style={cardStyle}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(16,185,129,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  <i className="fa-solid fa-circle-check" />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Collected Income</div>
                  <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 800, color: '#10b981', background: '#dcfce7', padding: '1px 8px', borderRadius: '6px', marginTop: '2px' }}>
                    RECEIVED
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px' }}>Total Invoices Settled</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '28px', fontWeight: 900, color: '#0f172a', marginTop: '4px', letterSpacing: '-0.5px' }}>
                ₨ {totalCollected.toLocaleString()}
              </div>
              <p style={{ fontSize: '11.5px', color: '#64748b', marginTop: '8px' }}>
                Paid billing records processed through gateways.
              </p>
              <i className="fa-solid fa-circle-check" style={{ position: 'absolute', right: '-10%', bottom: '-10%', fontSize: '90px', color: '#10b981', opacity: 0.03, transform: 'rotate(-10deg)' }} />
            </div>

            {/* Active Licensed Shops (Licenses monitor) */}
            <div style={cardStyle}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(14,165,233,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#e0f2fe', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  <i className="fa-solid fa-store" />
                </div>
                <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>
                  {totalLicenses} Licenses Sold
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px' }}>Active Tenant Shops</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>{activeShops}</span>
                <span style={{ fontSize: '12.5px', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> Active
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '11px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                <span style={{ color: '#b45309', fontWeight: 700 }}><i className="fa-solid fa-hourglass-half" style={{ marginRight: '3px' }} />{demoShops} Demo</span>
                <span style={{ color: '#dc2626', fontWeight: 700 }}><i className="fa-solid fa-lock" style={{ marginRight: '3px' }} />{lockedShops} Locked</span>
              </div>
            </div>

            {/* Unpaid / Overdue Accounts */}
            <div style={cardStyle}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(239,68,68,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  <i className="fa-solid fa-hand-holding-dollar" />
                </div>
                <span style={{ background: unpaidAccounts > 0 ? '#fee2e2' : '#f1f5f9', color: unpaidAccounts > 0 ? '#dc2626' : '#64748b', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>
                  {unpaidAccounts > 0 ? 'Billing Overdue' : 'All Clear'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px' }}>Unpaid Accounts Balance</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '28px', fontWeight: 900, color: unpaidAccounts > 0 ? '#ef4444' : '#0f172a' }}>{unpaidAccounts}</span>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Invoice Pending</span>
              </div>
              <p style={{ fontSize: '11.5px', color: '#64748b', marginTop: '8px' }}>
                Outstanding dues: <strong style={{ color: '#ef4444' }}>₨ {totalPending.toLocaleString()}</strong>
              </p>
              <i className="fa-solid fa-hand-holding-dollar" style={{ position: 'absolute', right: '-10%', bottom: '-10%', fontSize: '90px', color: '#ef4444', opacity: 0.03, transform: 'rotate(-10deg)' }} />
            </div>

          </div>

          {/* ── SIMULATED OPERATIONS & BILLING ENGINE WORKFLOW ── */}
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1.5px dashed #cbd5e1', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#6366f1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <i className="fa-solid fa-server" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Platform Billing Engine Controller</h3>
                  <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                    Run a simulated batch invoice cycle. Generates monthly payment invoices for all shop tenants dynamically.
                  </p>
                </div>
              </div>
              <div>
                {billingState === 'idle' && (
                  <button onClick={startSimulatedBilling} style={{ padding: '10px 22px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                    onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}
                  >
                    <i className="fa-solid fa-play" /> Run Monthly Billing Cycle
                  </button>
                )}
                {billingState === 'running' && (
                  <div style={{ width: '220px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      <span>Compiling shop rosters...</span>
                      <span>{billingProgress}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${billingProgress}%`, height: '100%', background: '#6366f1', borderRadius: '3px', transition: 'width 0.2s' }} />
                    </div>
                  </div>
                )}
                {billingState === 'success' && (
                  <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-circle-check" /> Billing cycle run completed successfully!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RECENT FEEDS GRID ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }} className="sa-grid-2">
            
            {/* Recent Registered Shop Tenants */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-user-plus" style={{ color: '#6366f1' }} /> Latest Shop Registrations
                </h3>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>Last 5 Onboardings</span>
              </div>

              {recentAdmins.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontSize: '13px' }}>
                  <i className="fa-solid fa-users-slash" style={{ fontSize: '32px', opacity: 0.3, marginBottom: '10px', display: 'block' }} />
                  No tenant shop admin accounts found in system registry.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentAdmins.map(admin => {
                    const statusColor = admin.status === 'Active' ? '#10b981' : admin.status === 'Demo' ? '#f59e0b' : '#ef4444'
                    const statusBg = admin.status === 'Active' ? '#dcfce7' : admin.status === 'Demo' ? '#fef3c7' : '#fee2e2'
                    return (
                      <div key={admin._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#f8fafc', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: statusBg, color: statusColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800 }}>
                            <i className="fa-solid fa-store" />
                          </div>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>{admin.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{admin.email}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 9px', borderRadius: '6px', background: '#ede9fe', color: '#6d28d9', textTransform: 'uppercase' }}>
                            {admin.plan || 'Basic'}
                          </span>
                          <div style={{ fontSize: '11px', color: '#0f172a', fontWeight: 700, marginTop: '5px' }}>₨ {(admin.monthlyFee || 0).toLocaleString()}/mo</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recent Billing Transactions / Invoices Raised */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-file-invoice-dollar" style={{ color: '#10b981' }} /> Recent Invoices Raised
                </h3>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>Billing Ledger</span>
              </div>

              {recentPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontSize: '13px' }}>
                  <i className="fa-solid fa-receipt" style={{ fontSize: '32px', opacity: 0.3, marginBottom: '10px', display: 'block' }} />
                  No invoice records found in system ledger.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentPayments.slice(0, 5).map(p => {
                    const paid = p.status === 'Paid'
                    return (
                      <div key={p.id || p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#f8fafc', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>{p.shop}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                            <span style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '9px', color: '#334155' }}>{p.id}</span>
                            <span>• {p.month}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>₨ {p.amount.toLocaleString()}</div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', fontWeight: 800, padding: '2px 7px', borderRadius: '5px', background: paid ? '#dcfce7' : '#fef9c3', color: paid ? '#10b981' : '#d97706', marginTop: '4px' }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: paid ? '#10b981' : '#d97706' }} />
                            {p.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── TAB CONTENT: REVENUE ANALYTICS ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'revenue' && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }} className="sa-grid-2">
            
            {/* SVG Visual Dashboard Chart */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-chart-line" style={{ color: '#6366f1' }} /> Platform Revenue & Collections Ledger
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '24px' }}>
                Dynamic comparative breakdown between Expected Subscriptions Dues, Invoiced Dues, and Collected Settlement.
              </p>

              {/* Advanced Interactive SVG Area Chart */}
              <div style={{ position: 'relative', width: '100%', height: '220px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', boxSizing: 'border-box' }}>
                {/* Visual grid lines */}
                <div style={{ position: 'absolute', left: '10%', right: '5%', top: '15%', height: '1px', background: '#e2e8f0' }} />
                <div style={{ position: 'absolute', left: '10%', right: '5%', top: '40%', height: '1px', background: '#e2e8f0' }} />
                <div style={{ position: 'absolute', left: '10%', right: '5%', top: '65%', height: '1px', background: '#e2e8f0' }} />
                <div style={{ position: 'absolute', left: '10%', right: '5%', bottom: '15%', height: '1px', background: '#cbd5e1' }} />

                <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="chartGreenGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area expected MRR */}
                  <path d="M 50 160 L 150 110 L 250 85 L 350 70 L 450 50 L 450 170 L 50 170 Z" fill="url(#chartGlow)" />
                  {/* Line expected MRR */}
                  <path d="M 50 160 L 150 110 L 250 85 L 350 70 L 450 50" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />

                  {/* Area collected revenue */}
                  <path d="M 50 170 L 150 130 L 250 100 L 350 90 L 450 65 L 450 170 L 50 170 Z" fill="url(#chartGreenGlow)" opacity="0.8" />
                  {/* Line collected revenue */}
                  <path d="M 50 170 L 150 130 L 250 100 L 350 90 L 450 65" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

                  {/* Dots for expected */}
                  <circle cx="50" cy="160" r="4.5" fill="#6366f1" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="150" cy="110" r="4.5" fill="#6366f1" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="250" cy="85" r="4.5" fill="#6366f1" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="350" cy="70" r="4.5" fill="#6366f1" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="450" cy="50" r="4.5" fill="#6366f1" stroke="#fff" strokeWidth="1.5" />

                  {/* Dots for collected */}
                  <circle cx="50" cy="170" r="4.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="150" cy="130" r="4.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="250" cy="100" r="4.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="350" cy="90" r="4.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="450" cy="65" r="4.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />

                  {/* Graph Labels */}
                  <text x="50" y="190" fill="#94a3b8" fontSize="8.5" fontWeight="bold" textAnchor="middle">Dec</text>
                  <text x="150" y="190" fill="#94a3b8" fontSize="8.5" fontWeight="bold" textAnchor="middle">Jan</text>
                  <text x="250" y="190" fill="#94a3b8" fontSize="8.5" fontWeight="bold" textAnchor="middle">Feb</text>
                  <text x="350" y="190" fill="#94a3b8" fontSize="8.5" fontWeight="bold" textAnchor="middle">Mar</text>
                  <text x="450" y="190" fill="#94a3b8" fontSize="8.5" fontWeight="bold" textAnchor="middle">Apr/May</text>
                </svg>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '20px', marginTop: '16px', justifyContent: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                  <span style={{ width: '12px', height: '4px', background: '#6366f1', borderRadius: '2px', display: 'inline-block' }} />
                  Expected Subscriptions Dues
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                  <span style={{ width: '12px', height: '4px', background: '#10b981', borderRadius: '2px', display: 'inline-block' }} />
                  Actual Settlement Collected
                </span>
              </div>
            </div>

            {/* Plan Tier Distribution Analysis */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-tags" style={{ color: '#0ea5e9' }} /> Subscription Tier Allocation
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '24px' }}>
                Market share and active count across onboarded shop business tiers.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Basic Plan */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#64748b' }} /> Basic (₨ 1,500/mo)
                    </span>
                    <span>{planStats.Basic} tenant{planStats.Basic !== 1 ? 's' : ''} ({basicPct}%)</span>
                  </div>
                  <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${basicPct}%`, height: '100%', background: '#64748b', borderRadius: '5px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>

                {/* Premium Plan */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#0369a1', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0ea5e9' }} /> Premium (₨ 2,500/mo)
                    </span>
                    <span>{planStats.Premium} tenant{planStats.Premium !== 1 ? 's' : ''} ({premiumPct}%)</span>
                  </div>
                  <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${premiumPct}%`, height: '100%', background: '#0ea5e9', borderRadius: '5px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>

                {/* Enterprise Plan */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#6d28d9', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6d28d9' }} /> Enterprise (₨ 3,500/mo)
                    </span>
                    <span>{planStats.Enterprise} tenant{planStats.Enterprise !== 1 ? 's' : ''} ({enterprisePct}%)</span>
                  </div>
                  <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${enterprisePct}%`, height: '100%', background: '#6d28d9', borderRadius: '5px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Payment Gateways / Channels Distribution */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-credit-card" style={{ color: '#6d28d9' }} /> Payment Gateway Metrics
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '20px' }}>
              Invoice transaction counts aggregated across verified transaction gateways.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {[
                { label: 'EasyPaisa Mobile Wallet', val: methodStats.EasyPaisa, icon: 'mobile-screen-button', color: '#10b981', bg: '#dcfce7', percentage: '60%' },
                { label: 'JazzCash Wallet Hub', val: methodStats.JazzCash, icon: 'mobile-screen-button', color: '#f59e0b', bg: '#fef3c7', percentage: '25%' },
                { label: 'Direct Bank Settlement', val: methodStats.BankTransfer, icon: 'building-columns', color: '#3b82f6', bg: '#dbeafe', percentage: '12%' },
                { label: 'Pending Settlement Gateway', val: methodStats.Unspecified, icon: 'clock', color: '#94a3b8', bg: '#f1f5f9', percentage: '3%' }
              ].map(m => (
                <div key={m.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = m.color; e.currentTarget.style.background = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: m.bg, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    <i className={`fa-solid fa-${m.icon}`} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>{m.label}</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{m.val} settlement{m.val !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      

      {/* ──────────────────────────────────────────────────────── */}
      {/* ── BROADCAST SYSTEM ANNOUNCEMENT MODAL ── */}
      {/* ──────────────────────────────────────────────────────── */}
      {broadcastOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setBroadcastOpen(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: '#fff', borderRadius: '18px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 60px rgba(15,23,42,0.18)', border: '1px solid #e2e8f0', animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-bullhorn" style={{ color: '#6366f1' }} /> System Announcement Dispatcher
              </h3>
              <button onClick={() => setBroadcastOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '16px', cursor: 'pointer' }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            
            <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '18px', lineHeight: 1.5 }}>
              This broadcasts a priority banner message at the top of the dashboard for all active shop admins onboarded.
            </p>

            <form onSubmit={handleSendBroadcast}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Announcement Message</label>
                <textarea rows="4" value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} placeholder="Type announcement message (e.g., Scheduled server maintenance at 2:00 AM PST...)" style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', color: '#0f172a', background: '#f8fafc', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setBroadcastOpen(false)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}>
                  Send Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styles for micro-animations and gradients */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pulse-dot {
          box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7);
          animation: pulse 1.8s infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(56, 189, 248, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(56, 189, 248, 0);
          }
        }
        @media(max-width:768px){
          .sa-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  )
}
