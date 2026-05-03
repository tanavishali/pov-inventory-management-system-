import { useState, useMemo, useEffect } from 'react'

/* ─── Initial Data ─── */
export const INITIAL_SALESMEN = [
  { id: 1, name: 'Ahmed Khan',   email: 'ahmed@sales.com',  phone: '+92-300-1234567', cnic: '35202-1234567-1', joined: '2024-01-15', status: 'active',  sales: 125000, orders: 48, password: 'ahmed@123'  },
  { id: 2, name: 'Sara Malik',   email: 'sara@sales.com',   phone: '+92-321-9876543', cnic: '35202-7654321-2', joined: '2024-02-20', status: 'active',  sales: 98500,  orders: 36, password: 'sara@456'   },
  { id: 3, name: 'Bilal Ahmed',  email: 'bilal@sales.com',  phone: '+92-333-5556677', cnic: '35202-1122334-3', joined: '2024-03-10', status: 'blocked', sales: 42000,  orders: 17, password: 'bilal@789'  },
  { id: 4, name: 'Zara Hussain', email: 'zara@sales.com',   phone: '+92-345-1112233', cnic: '35202-9988776-4', joined: '2023-11-05', status: 'active',  sales: 211000, orders: 72, password: 'zara@101'   },
]

const fmtSales = n => 'Rs ' + Number(n).toLocaleString()

/* ─── Stat Card ─── */
function StatCard({ borderColor, iconBg, iconColor, icon, bgIcon, bgIconColor, label, value, sub }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderTop: `3px solid ${borderColor}`,
      borderRadius: '14px', padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)',
      transition: 'transform .2s,box-shadow .2s', cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', background: iconBg, color: iconColor }}>
          <i className={`fa-solid fa-${icon}`} />
        </div>
        <i className={`fa-solid fa-${bgIcon}`} style={{ color: bgIconColor, fontSize: '16px', opacity: .3 }} />
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '26px', fontWeight: 900, lineHeight: 1, letterSpacing: '-.5px', color: borderColor }}>{value}</div>
      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '3px' }}>{sub}</div>
    </div>
  )
}

/* ─── Action Button ─── */
function AcBtn({ onClick, bg, color, hoverBg, icon, label }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: '7px 12px', borderRadius: '8px', border: 'none',
      fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '12px', fontWeight: 600,
      cursor: 'pointer', background: bg, color, transition: 'all .18s', whiteSpace: 'nowrap',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.background = bg; e.currentTarget.style.transform = '' }}
    >
      <i className={`fa-solid ${icon}`} style={{ fontSize: '11px' }} /> {label}
    </button>
  )
}

/* ─── Password Field (toggle show/hide) ─── */
function PwdDisplay({ password }) {
  const [show, setShow] = useState(false)
  return (
    <div onClick={() => setShow(p => !p)}
      style={{ cursor: 'pointer', userSelect: 'none', fontSize: '12.5px', fontWeight: 600, color: '#1e293b', fontFamily: "'Outfit',sans-serif", letterSpacing: '.3px', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '5px' }}
    >
      <span>{show ? password : '••••••••'}</span>
      <i className={`fa-solid ${show ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '11px', color: '#94a3b8' }} />
    </div>
  )
}

/* ─── Salesman Card ─── */
function SalesmanCard({ sm, onEdit, onToggleBlock, onDelete }) {
  const isActive = sm.status === 'active'
  const stripColor = isActive ? '#10b981' : '#ef4444'
  const pillStyle = isActive
    ? { background: '#dcfce7', color: '#16a34a' }
    : { background: '#fee2e2', color: '#dc2626' }

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px',
      overflow: 'hidden', transition: 'all .22s',
      boxShadow: '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)',
      opacity: isActive ? 1 : 0.8,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.1)'; e.currentTarget.style.borderColor = '#cbd5e1' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)'; e.currentTarget.style.borderColor = '#e2e8f0' }}
    >
      {/* Color Strip */}
      <div style={{ height: '4px', background: stripColor }} />

      <div style={{ padding: '16px' }}>
        {/* Head */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', gap: '10px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg,#ede9fe,#e0f2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px', color: '#6366f1' }}>
            <i className="fa-solid fa-user-tie" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '15px', color: '#1e293b', lineHeight: 1.2, marginBottom: '2px' }}>{sm.name}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fa-solid fa-envelope" style={{ fontSize: '10px' }} />{sm.email}
            </div>
          </div>
          <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, flexShrink: 0, ...pillStyle }}>
            <i className={`fa-solid ${isActive ? 'fa-circle-check' : 'fa-ban'}`} style={{ fontSize: '9px', marginRight: '3px' }} />
            {isActive ? 'Active' : 'Blocked'}
          </span>
        </div>

        {/* Info Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#475569' }}>
            <i className="fa-solid fa-phone" style={{ width: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }} />
            <span>{sm.phone}</span>
          </div>
          {sm.cnic && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#475569' }}>
              <i className="fa-solid fa-id-card" style={{ width: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }} />
              <span>{sm.cnic}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#475569' }}>
            <i className="fa-regular fa-calendar" style={{ width: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }} />
            <span><strong>Joined:</strong> {sm.joined}</span>
          </div>
        </div>

        {/* Stats Badges */}
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 11px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: '#ede9fe', color: '#6d28d9' }}>
            <i className="fa-solid fa-chart-line" /> Sales: {fmtSales(sm.sales)}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 11px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: '#e0f2fe', color: '#0369a1' }}>
            <i className="fa-solid fa-bag-shopping" /> Orders: {sm.orders}
          </span>
        </div>

        {/* Credentials Box */}
        <div style={{
          background: '#f5f7fa', border: '1px solid #e2e8f0', borderRadius: '10px',
          padding: '10px 12px', marginBottom: '12px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
        }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fa-solid fa-circle-user" /> Login Email
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b', fontFamily: "'Outfit',sans-serif", letterSpacing: '.3px', wordBreak: 'break-all' }}>
              {sm.email}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fa-solid fa-key" /> Password
            </div>
            <PwdDisplay password={sm.password} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 0' }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <AcBtn onClick={() => onEdit(sm)} bg="#e0f2fe" color="#0369a1" hoverBg="#bae6fd" icon="fa-pen-to-square" label="Edit" />
          {isActive
            ? <AcBtn onClick={() => onToggleBlock(sm)} bg="#fef9c3" color="#b45309" hoverBg="#fef08a" icon="fa-ban" label="Block" />
            : <AcBtn onClick={() => onToggleBlock(sm)} bg="#dcfce7" color="#16a34a" hoverBg="#bbf7d0" icon="fa-circle-check" label="Unblock" />
          }
          <AcBtn onClick={() => onDelete(sm)} bg="#fee2e2" color="#dc2626" hoverBg="#fecaca" icon="fa-trash" label="Delete" />
        </div>
      </div>
    </div>
  )
}

/* ─── Modal Wrapper ─── */
function Modal({ show, onClose, children }) {
  if (!show) return null
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      backdropFilter: 'blur(4px)', zIndex: 2000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '20px', overflowY: 'auto',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '26px',
        width: '100%', maxWidth: '500px',
        boxShadow: '0 24px 64px rgba(0,0,0,.18)',
        animation: 'smIn .22s ease', margin: 'auto',
      }}>
        <style>{`@keyframes smIn{from{opacity:0;transform:scale(.95) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);}}`}</style>
        {children}
      </div>
    </div>
  )
}

/* ─── Modal Field ─── */
function MField({ label, icon, full, children }) {
  return (
    <div style={full ? { gridColumn: '1/-1' } : {}}>
      <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <i className={`fa-solid fa-${icon}`} />{label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 13px',
  border: '1.5px solid #e2e8f0', borderRadius: '9px',
  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', color: '#1e293b',
  background: '#f5f7fa', outline: 'none', transition: 'border-color .2s',
}
const focusIn  = e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.1)' }
const focusOut = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none' }

/* ─── Main Component ─── */
export default function SalesmanManagement() {
  const [salesmen, setSalesmen] = useState(() => {
    try {
      const saved = localStorage.getItem('wholesale_salesmen')
      return saved ? JSON.parse(saved) : INITIAL_SALESMEN
    } catch { return INITIAL_SALESMEN }
  })

  useEffect(() => {
    localStorage.setItem('wholesale_salesmen', JSON.stringify(salesmen))
  }, [salesmen])
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')

  /* Modal state */
  const [modal,   setModal]   = useState(false)
  const [editSm,  setEditSm]  = useState(null)
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', cnic: '', joined: '', status: 'active',  password: '' })
  const [formErr, setFormErr] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return salesmen.filter(s => {
      const mf = filter === 'all' || s.status === filter
      const mq = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q) 
      return mf && mq
    })
  }, [salesmen, search, filter])

  const activeCnt  = salesmen.filter(s => s.status === 'active').length
  const totalSales = salesmen.reduce((a, s) => a + Number(s.sales), 0)

  /* ── Handlers ── */
  function openAdd() {
    setEditSm(null)
    setForm({ name: '', email: '', phone: '', cnic: '', joined: new Date().toISOString().split('T')[0], status: 'active',  password: '' })
    setFormErr('')
    setShowPwd(false)
    setModal(true)
  }

  function openEdit(sm) {
    setEditSm(sm)
    setForm({ name: sm.name, email: sm.email, phone: sm.phone, cnic: sm.cnic || '', joined: sm.joined, status: sm.status, password: sm.password })
    setFormErr('')
    setShowPwd(false)
    setModal(true)
  }

  function confirmSalesman() {
    if (!form.name.trim() || !form.phone.trim()) { setFormErr('Name and phone are required.'); return }
    if (!form.email.trim() || !form.password) { setFormErr('Email and password are required.'); return }
    setFormErr('')
    if (editSm) {
      setSalesmen(prev => prev.map(s => s.id === editSm.id ? { ...s, ...form } : s))
    } else {
      const newId = salesmen.length ? Math.max(...salesmen.map(s => s.id)) + 1 : 1
      setSalesmen(prev => [...prev, { id: newId, ...form, sales: 0, orders: 0 }])
    }
    setModal(false)
  }

  function toggleBlock(sm) {
    const action = sm.status === 'active' ? 'block' : 'unblock'
    if (!confirm(`Are you sure you want to ${action} "${sm.name}"?`)) return
    setSalesmen(prev => prev.map(s => s.id === sm.id ? { ...s, status: s.status === 'active' ? 'blocked' : 'active' } : s))
  }

  function deleteSalesman(sm) {
    if (!confirm(`Delete "${sm.name}"? This cannot be undone.`)) return
    setSalesmen(prev => prev.filter(s => s.id !== sm.id))
  }

  const setField = key => e => setForm(p => ({ ...p, [key]: e.target.value }))

  const filterBtns = [
    { key: 'all',     label: 'All',     icon: 'border-all' },
    { key: 'active',  label: 'Active',  icon: 'circle-check', iconColor: '#10b981' },
    { key: 'blocked', label: 'Blocked', icon: 'ban',          iconColor: '#ef4444' },
  ]

  /* ── accent color for this page ── */
  const ACCENT = '#6366f1'

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
            <i className="fa-solid fa-user-tie" style={{ color: ACCENT }} />
            Salesman Management
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Manage all registered salesmen, their sales and credentials</div>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: ACCENT, color: '#fff', border: 'none',
          padding: '10px 20px', borderRadius: '10px',
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 2px 10px rgba(99,102,241,.3)', transition: 'all .2s', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = '' }}
        >
          <i className="fa-solid fa-user-plus" /> Add Salesman
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px', marginBottom: '20px' }}>
        <StatCard
          borderColor={ACCENT} iconBg="#ede9fe" iconColor={ACCENT}
          icon="user-check" bgIcon="users" bgIconColor={ACCENT}
          label="Active Salesmen" value={activeCnt} sub="Currently active"
        />
        <StatCard
          borderColor="#f59e0b" iconBg="#fef3c7" iconColor="#f59e0b"
          icon="chart-line" bgIcon="sack-dollar" bgIconColor="#f59e0b"
          label="Total Sales" value={fmtSales(totalSales)} sub="Combined all salesmen"
        />
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px',
        padding: '13px 16px', display: 'flex', alignItems: 'center', gap: '10px',
        flexWrap: 'wrap', marginBottom: '18px',
        boxShadow: '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
          <input
            type="text" placeholder="Search by name, email or phone..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 34px',
              border: '1px solid #e2e8f0', borderRadius: '9px',
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px',
              background: '#f5f7fa', color: '#1e293b', outline: 'none',
              transition: 'border-color .2s,box-shadow .2s',
            }}
            onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.1)'; e.target.style.background = '#fff' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f5f7fa' }}
          />
        </div>

        {/* Add button (toolbar) */}
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: ACCENT, color: '#fff', border: 'none',
          padding: '9px 16px', borderRadius: '10px',
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 700,
          cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
          onMouseLeave={e => e.currentTarget.style.background = ACCENT}
        >
          <i className="fa-solid fa-user-plus" /> Add Salesman
        </button>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {filterBtns.map(({ key, label, icon, iconColor }) => {
            const isAct = filter === key
            return (
              <button key={key} onClick={() => setFilter(key)} style={{
                padding: '7px 13px', borderRadius: '8px',
                border: `1px solid ${isAct ? ACCENT : '#e2e8f0'}`,
                background: isAct ? ACCENT : '#f5f7fa',
                color: isAct ? '#fff' : '#64748b',
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '12.5px',
                fontWeight: isAct ? 600 : 500, cursor: 'pointer', transition: 'all .18s', whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { if (!isAct) { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; e.currentTarget.style.background = '#f5f3ff' } }}
                onMouseLeave={e => { if (!isAct) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#f5f7fa' } }}
              >
                <i className={`fa-solid fa-${icon}`} style={{ fontSize: '11px', marginRight: '3px', color: isAct ? '#fff' : iconColor }} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Results Label ── */}
      <div style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '14px' }}>
        Showing <strong style={{ color: '#1e293b' }}>{filtered.length}</strong> salesman{filtered.length !== 1 ? 'en' : ''}
      </div>

      {/* ── Salesman Grid ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <i className="fa-solid fa-user-slash" style={{ fontSize: '48px', marginBottom: '14px', display: 'block', opacity: .3 }} />
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: '#64748b' }}>No salesmen found</div>
          <div style={{ fontSize: '13px' }}>Try a different filter or search term</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px' }}>
          {filtered.map(sm => (
            <SalesmanCard
              key={sm.id} sm={sm}
              onEdit={openEdit}
              onToggleBlock={toggleBlock}
              onDelete={deleteSalesman}
            />
          ))}
        </div>
      )}

      {/* ══════════ ADD / EDIT MODAL ══════════ */}
      <Modal show={modal} onClose={() => setModal(false)}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '19px' }}>
            {editSm ? 'Edit Salesman' : 'Add New Salesman'}
          </div>
          <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px', padding: '4px', borderRadius: '6px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f7fa'; e.currentTarget.style.color = '#1e293b' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '18px' }}>
          {editSm ? 'Update salesman details' : 'Fill in salesman details below'}
        </div>

        {/* Error */}
        {formErr && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', fontWeight: 600 }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }} />{formErr}
          </div>
        )}

        {/* Form Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

          {/* Full Name */}
          <div style={{ gridColumn: '1/-1' }}>
            <MField label="Full Name" icon="user" full>
              <input style={inputStyle} type="text" placeholder="e.g. Ahmed Khan" value={form.name} onChange={setField('name')} onFocus={focusIn} onBlur={focusOut} />
            </MField>
          </div>

          {/* Email */}
          <MField label="Email" icon="envelope">
            <input style={inputStyle} type="email" placeholder="ahmed@sales.com" value={form.email} onChange={setField('email')} onFocus={focusIn} onBlur={focusOut} />
          </MField>

          {/* Phone */}
          <MField label="Phone" icon="phone">
            <input style={inputStyle} type="text" placeholder="+92-300-1234567" value={form.phone} onChange={setField('phone')} onFocus={focusIn} onBlur={focusOut} />
          </MField>

          {/* CNIC */}
          <MField label="CNIC" icon="id-card">
            <input style={inputStyle} type="text" placeholder="35202-1234567-1" value={form.cnic} onChange={setField('cnic')} onFocus={focusIn} onBlur={focusOut} maxLength={15} />
          </MField>

          {/* Joined */}
          <MField label="Joined Date" icon="calendar">
            <input style={inputStyle} type="date" value={form.joined} onChange={setField('joined')} onFocus={focusIn} onBlur={focusOut} />
          </MField>

          {/* Status */}
          <MField label="Status" icon="circle-info">
            <select style={inputStyle} value={form.status} onChange={setField('status')} onFocus={focusIn} onBlur={focusOut}>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </MField>

          {/* Credentials Divider */}
          <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', whiteSpace: 'nowrap' }}>
              <i className="fa-solid fa-lock" style={{ marginRight: '4px' }} />Login Credentials
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>


          {/* Password */}
          <MField label="Password" icon="key">
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inputStyle, paddingRight: '38px' }}
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password} onChange={setField('password')}
                onFocus={focusIn} onBlur={focusOut}
              />
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '14px', padding: '2px' }}
              >
                <i className={`fa-solid ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </MField>

        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '9px', marginTop: '20px' }}>
          <button onClick={confirmSalesman} style={{
            flex: 1, padding: '11px', borderRadius: '9px', border: 'none',
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 700,
            cursor: 'pointer', background: ACCENT, color: '#fff', transition: 'all .2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
            onMouseLeave={e => e.currentTarget.style.background = ACCENT}
          >
            <i className={`fa-solid ${editSm ? 'fa-floppy-disk' : 'fa-user-plus'}`} style={{ marginRight: '5px' }} />
            {editSm ? 'Save Changes' : 'Add Salesman'}
          </button>
          <button onClick={() => setModal(false)} style={{
            padding: '11px 18px', borderRadius: '9px', border: '1px solid #e2e8f0',
            background: '#f5f7fa', color: '#64748b',
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f5f7fa'}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}
