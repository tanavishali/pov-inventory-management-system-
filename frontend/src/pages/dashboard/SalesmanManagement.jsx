import { useState } from 'react'
import { toast } from 'react-toastify'
import { confirmToast } from '../../utils/confirmToast'
import {
  useGetSalesmenQuery,
  useCreateSalesmanMutation,
  useUpdateSalesmanMutation,
  useDeleteSalesmanMutation,
} from '../../store/slices/salesmanApiSlice'

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
      style={{ cursor: 'pointer', userSelect: 'none', fontSize: '12.5px', fontWeight: 600, color: '#1e293b', fontFamily: "'Outfit',sans-serif", letterSpacing: '.3px', display: 'flex', alignItems: 'center', gap: '5px' }}
    >
      <span>{show ? (password || '••••••••') : '••••••••'}</span>
      <i className={`fa-solid ${show ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '11px', color: '#94a3b8' }} />
    </div>
  )
}

/* ─── Salesman Card ─── */
function SalesmanCard({ sm, onEdit, onToggleBlock, onDelete }) {
  const isActive = sm.status === 'Active' || sm.status === 'active'
  const stripColor = isActive ? '#10b981' : '#ef4444'
  const pillStyle = isActive
    ? { background: '#dcfce7', color: '#16a34a' }
    : { background: '#fee2e2', color: '#dc2626' }
  const statusLabel = isActive ? 'Active' : (sm.status === 'Locked' || sm.status === 'blocked' ? 'Blocked' : sm.status)

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
            {statusLabel}
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
            <i className="fa-solid fa-chart-line" /> Sales: {fmtSales(sm.sales || 0)}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 11px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: '#e0f2fe', color: '#0369a1' }}>
            <i className="fa-solid fa-bag-shopping" /> Orders: {sm.orders || 0}
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
            <PwdDisplay password={sm.plainPassword} />
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
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')

  // Filtered list — backend does the filtering
  const { data: filtered = [], isLoading, error: fetchErr, refetch } = useGetSalesmenQuery({ search, status: filter })
  // Unfiltered for counts
  const { data: allSalesmen = [] } = useGetSalesmenQuery({})

  const [createSalesman] = useCreateSalesmanMutation()
  const [updateSalesman] = useUpdateSalesmanMutation()
  const [deleteSalesman] = useDeleteSalesmanMutation()

  /* Modal state */
  const [modal,   setModal]   = useState(false)
  const [editSm,  setEditSm]  = useState(null)
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', cnic: '', joined: '', status: 'Active',  password: '' })
  const [formErr, setFormErr] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const activeCnt  = allSalesmen.filter(s => s.status === 'Active' || s.status === 'active').length
  const totalSales = allSalesmen.reduce((a, s) => a + Number(s.sales || 0), 0)

  /* ── Handlers ── */
  function openAdd() {
    setEditSm(null)
    setForm({ name: '', email: '', phone: '', cnic: '', joined: new Date().toISOString().split('T')[0], status: 'Active',  password: '' })
    setFormErr('')
    setShowPwd(false)
    setModal(true)
  }

  function openEdit(sm) {
    setEditSm(sm)
    setForm({ name: sm.name, email: sm.email, phone: sm.phone, cnic: sm.cnic || '', joined: sm.joined || '', status: sm.status || 'Active', password: '' })
    setFormErr('')
    setShowPwd(false)
    setModal(true)
  }

  async function confirmSalesman() {
    if (!form.name.trim() || !form.phone.trim()) { setFormErr('Name and phone are required.'); return }
    if (!form.email.trim() || (!editSm && !form.password)) { setFormErr('Email and password are required.'); return }
    setFormErr('')
    try {
      if (editSm) {
        const updatePayload = {
          id: editSm._id || editSm.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          cnic: form.cnic,
          joined: form.joined,
          status: form.status,
        }
        if (form.password && form.password.trim() !== '') {
          updatePayload.password = form.password
        }
        await updateSalesman(updatePayload).unwrap()
      } else {
        await createSalesman(form).unwrap()
      }
      setModal(false)
    } catch (err) {
      console.error('Failed to save salesman:', err)
      setFormErr(err?.data?.message || 'Email already exists or invalid form details.')
    }
  }

  async function toggleBlock(sm) {
    const isActive = sm.status === 'Active' || sm.status === 'active'
    const targetStatus = isActive ? 'Locked' : 'Active'
    const action = isActive ? 'block' : 'unblock'
    const ok = await confirmToast(`"${sm.name}" ko ${action} karna chahte hain?`, { confirmLabel: isActive ? 'Yes, Block' : 'Yes, Unblock', confirmColor: isActive ? '#ef4444' : '#10b981' })
    if (!ok) return
    try {
      await updateSalesman({ id: sm._id || sm.id, status: targetStatus }).unwrap()
      toast.success(`Salesman ${action}ed.`)
    } catch {
      toast.error('Failed to update status.')
    }
  }

  async function handleDeleteSalesman(sm) {
    const ok = await confirmToast(`Delete "${sm.name}"? This cannot be undone.`)
    if (!ok) return
    try {
      await deleteSalesman(sm._id || sm.id).unwrap()
      toast.success('Salesman deleted.')
    } catch {
      toast.error('Failed to delete salesman account.')
    }
  }

  const setField = key => e => setForm(p => ({ ...p, [key]: e.target.value }))

  const filterBtns = [
    { key: 'all',     label: 'All',     icon: 'border-all' },
    { key: 'active',  label: 'Active',  icon: 'circle-check', iconColor: '#10b981' },
    { key: 'blocked', label: 'Blocked', icon: 'ban',          iconColor: '#ef4444' },
  ]

  /* ── accent color for this page ── */
  const ACCENT = '#6366f1'

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#64748b' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '40px', color: '#6366f1', marginBottom: '16px' }} />
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '17px', color: '#1e293b' }}>Loading Salesmen...</div>
        <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>Connecting to database, please wait</div>
      </div>
    )
  }

  if (fetchErr) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#dc2626', background: '#fff', borderRadius: '14px', border: '1px solid #fee2e2', maxWidth: '500px', margin: '40px auto' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '44px', marginBottom: '16px', color: '#ef4444' }} />
        <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b', marginBottom: '8px' }}>Failed to Load Salesmen</div>
        <div style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '20px' }}>
          An error occurred while establishing a secure link with the salesman management service.
        </div>
        <button onClick={() => refetch()} style={{ padding: '9px 24px', borderRadius: '8px', background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', boxShadow: '0 2px 8px rgba(99,102,241,.2)' }}>
          Retry Connection
        </button>
      </div>
    )
  }

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
              key={sm._id || sm.id} sm={sm}
              onEdit={openEdit}
              onToggleBlock={toggleBlock}
              onDelete={handleDeleteSalesman}
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
              <option value="Active">Active</option>
              <option value="Locked">Blocked</option>
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
                placeholder={editSm ? "Leave blank to keep current" : "••••••••"}
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
