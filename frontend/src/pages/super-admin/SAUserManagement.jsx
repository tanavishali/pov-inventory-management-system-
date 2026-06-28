import { useState } from 'react'
import { toast } from 'react-toastify'
import { confirmToast } from '../../utils/confirmToast'
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useRenewAdminMutation,
} from '../../store/slices/superAdminApiSlice'

const PLAN_OPTIONS = ['Basic', 'Premium', 'Enterprise']
const STATUS_OPTIONS = ['Active', 'Locked', 'Demo']

const STATUS_STYLE = {
  Active: { bg: '#dcfce7', color: '#16a34a', icon: 'circle-check' },
  Locked: { bg: '#fee2e2', color: '#dc2626', icon: 'lock' },
  Demo:   { bg: '#fef9c3', color: '#b45309', icon: 'hourglass-half' },
}
const FEE_STYLE = {
  Paid:    { bg: '#dcfce7', color: '#16a34a' },
  Unpaid:  { bg: '#fee2e2', color: '#dc2626' },
  Overdue: { bg: '#ffedd5', color: '#ea580c' },
}

const inpStyle = {
  width: '100%', padding: '10px 13px',
  border: '1.5px solid #e2e8f0', borderRadius: '9px',
  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px',
  color: '#1e293b', background: '#f8fafc', outline: 'none',
}

function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

// Renewal extends from the LATER of today or the current expiry, so renewing
// never shortens an active subscription (and always pushes an expired one forward).
function extendExpiry(currentExpiry, days) {
  const now = new Date()
  const base = currentExpiry ? new Date(currentExpiry) : now
  const start = (base > now) ? base : now
  start.setDate(start.getDate() + (parseInt(days) || 0))
  return start.toISOString().split('T')[0]
}

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: '18px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 60px rgba(0,0,0,.18)', margin: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

export default function SAUserManagement() {
  // ── Real API hooks ──
  const { data: admins = [], isLoading, isError, refetch } = useGetAdminsQuery()
  const [createAdmin, { isLoading: creating }] = useCreateAdminMutation()
  const [updateAdmin]  = useUpdateAdminMutation()
  const [deleteAdmin]  = useDeleteAdminMutation()
  const [renewAdmin]   = useRenewAdminMutation()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Create modal
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', plan: 'Basic', monthlyFee: 1500, status: 'Active', demoDays: 14 })

  // Edit modal
  const [editUser, setEditUser] = useState(null)
  const [editNewPassword, setEditNewPassword] = useState('')

  // Subscription modal
  const [subUser, setSubUser] = useState(null)
  const [subDays, setSubDays] = useState(30)

  const safeUsers = Array.isArray(admins) ? admins : []
  const filtered = safeUsers
    .filter(u => filterStatus === 'all' || u.status === filterStatus)
    .filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    )

  /* ── Actions ── */
  const setStatus = async (id, status) => {
    try {
      await updateAdmin({ id, status }).unwrap()
      toast.success('Status updated.')
    }
    catch (e) { toast.error('Status update failed: ' + (e?.data?.message || e.message)) }
  }

  const deleteUser = async (id) => {
    const ok = await confirmToast('Is account ko permanently delete karna chahte hain?')
    if (!ok) return
    try {
      await deleteAdmin(id).unwrap()
      toast.success('Account deleted.')
    }
    catch (e) { toast.error('Delete failed: ' + (e?.data?.message || e.message)) }
  }

  const handleCreate = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) return
    const isDemo = newUser.status === 'Demo'
    const expiryDate = addDays(isDemo ? parseInt(newUser.demoDays) || 14 : 30)
    const purchasedOn = addDays(0) // subscription start = today
    // An account the super-admin provisions as Active is treated as paid; Demo/Locked start Unpaid.
    const feeStatus = newUser.status === 'Active' ? 'Paid' : 'Unpaid'
    const payload = { name: newUser.name, email: newUser.email, password: newUser.password, plan: newUser.plan, monthlyFee: newUser.monthlyFee, status: newUser.status, expiryDate, purchasedOn, feeStatus }
    try {
      await createAdmin(payload).unwrap()
      setShowCreate(false)
      setNewUser({ name: '', email: '', password: '', plan: 'Basic', monthlyFee: 1500, status: 'Active', demoDays: 14 })
      toast.success(`Account ban gaya! Email: ${newUser.email}`)
    } catch (e) { toast.error('Create failed: ' + (e?.data?.message || e.message)) }
  }

  const handleEdit = async () => {
    // Only send fields that UpdateAdminDto accepts — strip all MongoDB metadata
    const payload = {
      name:       editUser.name,
      email:      editUser.email,
      plan:       editUser.plan,
      monthlyFee: editUser.monthlyFee,
      status:     editUser.status,
      feeStatus:  editUser.feeStatus,
      expiryDate: editUser.expiryDate,
    }
    // Only include new password if user typed one
    if (editNewPassword.trim()) {
      payload.password = editNewPassword.trim()
    }
    const id = editUser._id || editUser.id
    try {
      await updateAdmin({ id, ...payload }).unwrap()
      setEditUser(null)
      setEditNewPassword('')
      toast.success('Account updated.')
    } catch (e) { toast.error('Update failed: ' + (e?.data?.message || JSON.stringify(e?.data) || e.message)) }
  }

  const handleSub = async () => {
    const days = parseInt(subDays) || 30
    try {
      await renewAdmin({ id: subUser._id || subUser.id, days }).unwrap()
      setSubUser(null)
      toast.success('Subscription renewed.')
    } catch (e) { toast.error('Renew failed: ' + (e?.data?.message || e.message)) }
  }

  const counts = {
    all:    safeUsers.length,
    Active: safeUsers.filter(u => u.status === 'Active').length,
    Locked: safeUsers.filter(u => u.status === 'Locked').length,
    Demo:   safeUsers.filter(u => u.status === 'Demo').length,
  }

  if (isLoading) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '36px', color: '#0ea5e9', marginBottom: '14px', display: 'block' }} />
      <div style={{ fontWeight: 600 }}>Loading admins...</div>
    </div>
  )

  if (isError) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#dc2626' }}>
      <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '36px', marginBottom: '14px', display: 'block' }} />
      <div style={{ fontWeight: 600, marginBottom: '12px' }}>Could not load admins from server.</div>
      <button onClick={refetch} style={{ padding: '8px 20px', borderRadius: '8px', background: '#0ea5e9', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Retry</button>
    </div>
  )

  const Label = ({ children }) => (
    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>{children}</div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '9px' }}>
            <i className="fa-solid fa-users-gear" style={{ color: '#0ea5e9' }} /> User Management
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Shop accounts manage karo — status, subscription aur access</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '10px', background: '#0ea5e9', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '13.5px', boxShadow: '0 2px 10px rgba(14,165,233,.3)' }}
          onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
          onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
        >
          <i className="fa-solid fa-plus" /> Naya Account Banao
        </button>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {[['all','All','border-all','#64748b','#f1f5f9'], ['Active','Active','circle-check','#16a34a','#dcfce7'], ['Locked','Locked','lock','#dc2626','#fee2e2'], ['Demo','Demo','hourglass-half','#b45309','#fef9c3']].map(([val, label, icon, color, bg]) => {
          const active = filterStatus === val
          return (
            <div key={val} onClick={() => setFilterStatus(val)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 14px', borderRadius: '9px', cursor: 'pointer', border: `1.5px solid ${active ? '#0ea5e9' : '#e2e8f0'}`, background: active ? '#0ea5e9' : '#fff', color: active ? '#fff' : '#64748b', fontSize: '13px', fontWeight: 600, transition: 'all .18s', boxShadow: active ? '0 2px 8px rgba(14,165,233,.25)' : 'none' }}>
              <i className={`fa-solid fa-${icon}`} />
              {label}
              <span style={{ padding: '1px 7px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: active ? 'rgba(255,255,255,.25)' : bg, color: active ? '#fff' : color }}>
                {counts[val] ?? counts.all}
              </span>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '18px' }}>
        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
        <input type="text" placeholder="Shop name ya email se dhundo..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inpStyle, paddingLeft: '38px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}
          onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)' }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,.07)' }}
        />
      </div>

      {/* Results */}
      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
        <strong style={{ color: '#1e293b' }}>{filtered.length}</strong> account{filtered.length !== 1 ? 's' : ''} mil{filtered.length !== 1 ? 'e' : 'a'}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
          <i className="fa-solid fa-users-slash" style={{ fontSize: '40px', marginBottom: '14px', display: 'block', opacity: .3 }} />
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: '#64748b' }}>Koi account nahi mila</div>
          <div style={{ fontSize: '13px' }}>Filter ya search change karein</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(u => {
            const ss = STATUS_STYLE[u.status] || STATUS_STYLE.Active
            const fs = FEE_STYLE[u.feeStatus] || FEE_STYLE.Unpaid
            return (
              <div key={u._id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#bae6fd'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(14,165,233,.1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.06)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  {/* Left: Info */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '11px', background: 'linear-gradient(135deg,#e0f2fe,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#0ea5e9', flexShrink: 0 }}>
                      <i className="fa-solid fa-store" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: '#1e293b' }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        <i className="fa-solid fa-envelope" style={{ marginRight: '4px', opacity: .6 }} />{u.email}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        <i className="fa-solid fa-key" style={{ marginRight: '4px' }} />
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>{u.password}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 11px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, background: ss.bg, color: ss.color }}>
                      <i className={`fa-solid fa-${ss.icon}`} style={{ fontSize: '10px' }} />
                      {u.status}
                    </span>
                    <span style={{ padding: '5px 11px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, background: fs.bg, color: fs.color }}>
                      {u.feeStatus}
                    </span>
                    <span style={{ padding: '5px 11px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, background: '#ede9fe', color: '#6d28d9' }}>
                      {u.plan || 'Basic'}
                    </span>
                  </div>
                </div>

                {/* Details row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  {[
                    { icon: 'calendar-plus', label: 'Purchased On', val: u.purchasedOn || '—' },
                    { icon: 'calendar-xmark', label: 'Expiry Date', val: u.expiryDate || '—' },
                    { icon: 'coins', label: 'Monthly Fee', val: `₨ ${(u.monthlyFee||0).toLocaleString()}` },
                    { icon: 'tag', label: 'Plan', val: u.plan || 'Basic' },
                  ].map(({ icon, label, val }) => (
                    <div key={label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 11px' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                        <i className={`fa-solid fa-${icon}`} style={{ marginRight: '3px' }} />{label}
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginTop: '3px' }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
                  {/* Activate */}
                  {u.status !== 'Active' && (
                    <button onClick={() => setStatus(u._id, 'Active')}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 13px', borderRadius: '8px', border: 'none', background: '#dcfce7', color: '#16a34a', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#bbf7d0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#dcfce7'}
                    >
                      <i className="fa-solid fa-circle-check" /> Activate
                    </button>
                  )}
                  {/* Lock */}
                  {u.status !== 'Locked' && (
                    <button onClick={() => setStatus(u._id, 'Locked')}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 13px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                    >
                      <i className="fa-solid fa-lock" /> Lock
                    </button>
                  )}
                  {/* Demo */}
                  {u.status !== 'Demo' && (
                    <button onClick={() => setStatus(u._id, 'Demo')}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 13px', borderRadius: '8px', border: 'none', background: '#fef9c3', color: '#b45309', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fde68a'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fef9c3'}
                    >
                      <i className="fa-solid fa-hourglass-half" /> Demo
                    </button>
                  )}
                  {/* Subscription */}
                  <button onClick={() => { setSubUser(u); setSubDays(30) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 13px', borderRadius: '8px', border: 'none', background: '#e0f2fe', color: '#0369a1', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#bae6fd'}
                    onMouseLeave={e => e.currentTarget.style.background = '#e0f2fe'}
                  >
                    <i className="fa-solid fa-rotate" /> Subscription
                  </button>
                  {/* Edit */}
                  <button onClick={() => setEditUser({ ...u })}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 13px', borderRadius: '8px', border: 'none', background: '#ede9fe', color: '#6d28d9', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ddd6fe'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ede9fe'}
                  >
                    <i className="fa-solid fa-pen-to-square" /> Edit
                  </button>
                  {/* Delete */}
                  <button onClick={() => deleteUser(u._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 13px', borderRadius: '8px', border: 'none', background: '#1e293b', color: '#f1f5f9', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginLeft: 'auto' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#334155'}
                    onMouseLeave={e => e.currentTarget.style.background = '#1e293b'}
                  >
                    <i className="fa-solid fa-trash" /> Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-plus" style={{ color: '#0ea5e9' }} /> Naya Account Banao
          </div>
          <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px' }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <Label>Shop Name</Label>
            <input style={inpStyle} placeholder="Al-Falah General Store" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <Label>Email</Label>
            <input style={inpStyle} type="email" placeholder="shop@email.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <Label>Password</Label>
            <input style={inpStyle} placeholder="Password set karo" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
          </div>
          <div>
            <Label>Plan</Label>
            <select style={inpStyle} value={newUser.plan} onChange={e => setNewUser({ ...newUser, plan: e.target.value })}>
              {PLAN_OPTIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <Label>Monthly Fee (₨)</Label>
            <input style={inpStyle} type="number" value={newUser.monthlyFee} onChange={e => setNewUser({ ...newUser, monthlyFee: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>Initial Status</Label>
            <select style={inpStyle} value={newUser.status} onChange={e => setNewUser({ ...newUser, status: e.target.value })}>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {newUser.status === 'Demo' && (
            <div>
              <Label>Demo Period (Days)</Label>
              <input style={inpStyle} type="number" min="1" max="365" value={newUser.demoDays} onChange={e => setNewUser({ ...newUser, demoDays: parseInt(e.target.value) || 14 })} placeholder="14" />
            </div>
          )}
        </div>

        {(() => {
          const isDemo = newUser.status === 'Demo'
          const days = isDemo ? (parseInt(newUser.demoDays) || 14) : 30
          const tone = isDemo
            ? { bg: '#fef9c3', border: '#fde68a', color: '#b45309', icon: 'hourglass-half' }
            : { bg: '#f0f9ff', border: '#bae6fd', color: '#0369a1', icon: 'calendar-check' }
          return (
            <div style={{ background: tone.bg, border: `1px solid ${tone.border}`, borderRadius: '9px', padding: '10px 13px', fontSize: '12px', color: tone.color, fontWeight: 600, marginBottom: '14px' }}>
              <i className={`fa-solid fa-${tone.icon}`} style={{ marginRight: '6px' }} />
              Purchased: {addDays(0)} · Expiry: {addDays(days)}{isDemo ? ` (${days}-day demo)` : ` (${days}-day subscription)`}
            </div>
          )
        })()}

        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button onClick={() => setShowCreate(false)}
            style={{ flex: 1, padding: '11px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
            Cancel
          </button>
          <button onClick={handleCreate}
            style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
            onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
          >
            <i className="fa-solid fa-check" style={{ marginRight: '6px' }} />Create Account
          </button>
        </div>
      </Modal>

      {/* ── EDIT MODAL ── */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)}>
        {editUser && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-pen-to-square" style={{ color: '#6d28d9' }} /> Account Edit Karo
            </div>
            <button onClick={() => { setEditUser(null); setEditNewPassword('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px' }}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <Label>Shop Name</Label>
              <input style={inpStyle} value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Label>Email</Label>
              <input style={inpStyle} value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Label>New Password <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '11px' }}>(leave blank to keep unchanged)</span></Label>
              <input style={inpStyle} type="password" value={editNewPassword} placeholder="Enter new password..." onChange={e => setEditNewPassword(e.target.value)} />
            </div>
            <div>
              <Label>Plan</Label>
              <select style={inpStyle} value={editUser.plan || 'Basic'} onChange={e => setEditUser({ ...editUser, plan: e.target.value })}>
                {PLAN_OPTIONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <Label>Monthly Fee (₨)</Label>
              <input style={inpStyle} type="number" value={editUser.monthlyFee} onChange={e => setEditUser({ ...editUser, monthlyFee: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Status</Label>
              <select style={inpStyle} value={editUser.status} onChange={e => setEditUser({ ...editUser, status: e.target.value })}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>Fee Status</Label>
              <select style={inpStyle} value={editUser.feeStatus} onChange={e => setEditUser({ ...editUser, feeStatus: e.target.value })}>
                <option>Paid</option><option>Unpaid</option><option>Overdue</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setEditUser(null)}
              style={{ flex: 1, padding: '11px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
              Cancel
            </button>
            <button onClick={handleEdit}
              style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', background: '#6d28d9', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#5b21b6'}
              onMouseLeave={e => e.currentTarget.style.background = '#6d28d9'}
            >
              <i className="fa-solid fa-check" style={{ marginRight: '6px' }} />Save Changes
            </button>
          </div>
        </>}
      </Modal>

      {/* ── SUBSCRIPTION MODAL ── */}
      <Modal isOpen={!!subUser} onClose={() => setSubUser(null)}>
        {subUser && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-rotate" style={{ color: '#0369a1' }} /> Subscription Renew
            </div>
            <button onClick={() => setSubUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px' }}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div style={{ background: '#f0f9ff', borderRadius: '10px', padding: '14px', marginBottom: '18px', border: '1px solid #bae6fd' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{subUser.name}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Current expiry: <strong>{subUser.expiryDate}</strong></div>
          </div>

          <Label>Extension Period</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '14px' }}>
            {[7, 14, 30, 90].map(d => (
              <button key={d} onClick={() => setSubDays(d)}
                style={{ padding: '9px', borderRadius: '8px', border: `2px solid ${subDays === d ? '#0ea5e9' : '#e2e8f0'}`, background: subDays === d ? '#e0f2fe' : '#fff', color: subDays === d ? '#0369a1' : '#64748b', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                {d} din
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Label>Ya Custom Days</Label>
            <input style={inpStyle} type="number" min="1" value={subDays} onChange={e => setSubDays(parseInt(e.target.value) || 30)} placeholder="Days likhein..." />
          </div>

          <div style={{ background: '#dcfce7', borderRadius: '9px', padding: '10px 13px', fontSize: '12px', color: '#16a34a', fontWeight: 700, marginBottom: '16px' }}>
            <i className="fa-solid fa-calendar-check" style={{ marginRight: '6px' }} />
            Nai expiry date: {extendExpiry(subUser.expiryDate, subDays)}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setSubUser(null)}
              style={{ flex: 1, padding: '11px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
              Cancel
            </button>
            <button onClick={handleSub}
              style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
              onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
            >
              <i className="fa-solid fa-check" style={{ marginRight: '6px' }} />Renew Karo
            </button>
          </div>
        </>}
      </Modal>

      <style>{`@media(max-width:600px){.sa-user-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  )
}
