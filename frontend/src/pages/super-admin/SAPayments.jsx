import { useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { confirmToast } from '../../utils/confirmToast'
import {
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useMarkPaymentPaidMutation,
  useDeletePaymentMutation,
} from '../../store/slices/superAdminApiSlice'

const STATUS_STYLE = {
  Paid:    { bg: '#dcfce7', color: '#16a34a', icon: 'circle-check' },
  Pending: { bg: '#fef9c3', color: '#b45309', icon: 'clock' },
}

const METHOD_ICON = {
  'EasyPaisa':     'mobile-screen-button',
  'JazzCash':      'mobile-screen-button',
  'Bank Transfer': 'building-columns',
  '':              'question-circle',
}

const inpStyle = {
  padding: '10px 13px', border: '1.5px solid #e2e8f0', borderRadius: '9px',
  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px',
  color: '#1e293b', background: '#fff', outline: 'none',
}

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '18px', padding: '28px', width: '100%', maxWidth: '460px', boxShadow: '0 24px 60px rgba(0,0,0,.18)', margin: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

export default function SAPayments() {
  const { data: payments = [], isLoading } = useGetPaymentsQuery()
  const [createPayment] = useCreatePaymentMutation()
  const [markPaymentPaid] = useMarkPaymentPaidMutation()
  const [deletePaymentMutation] = useDeletePaymentMutation()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [markModal, setMarkModal] = useState(null)
  const [markMethod, setMarkMethod] = useState('EasyPaisa')
  const [addModal, setAddModal] = useState(false)
  const [newPay, setNewPay] = useState({ shop: '', email: '', amount: '', plan: 'Basic', method: 'EasyPaisa', month: '' })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return payments.filter(p => {
      const ms = filterStatus === 'all' || p.status === filterStatus
      const mq = !q || p.shop.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
      return ms && mq
    })
  }, [payments, search, filterStatus])

  const totalPaid    = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0)
  const paidCount    = payments.filter(p => p.status === 'Paid').length
  const pendCount    = payments.filter(p => p.status === 'Pending').length

  const markPaid = async () => {
    try {
      await markPaymentPaid({ id: markModal.id, method: markMethod }).unwrap()
      setMarkModal(null)
      toast.success('Payment marked as paid.')
    } catch (err) {
      toast.error('Payment mark karne mein galti hui: ' + (err.data?.message || err.error))
    }
  }

  const handleAdd = async () => {
    if (!newPay.shop.trim() || !newPay.amount) return
    try {
      await createPayment({
        shop: newPay.shop,
        email: newPay.email,
        amount: parseInt(newPay.amount) || 0,
        plan: newPay.plan,
        method: newPay.method,
        month: newPay.month,
      }).unwrap()
      setAddModal(false)
      setNewPay({ shop: '', email: '', amount: '', plan: 'Basic', method: 'EasyPaisa', month: '' })
      toast.success('Payment record added.')
    } catch (err) {
      toast.error('Payment add karne mein galti hui: ' + (err.data?.message || err.error))
    }
  }

  const deletePayment = async (id) => {
    const ok = await confirmToast('Is payment record ko delete karna chahte hain?')
    if (!ok) return
    try {
      await deletePaymentMutation(id).unwrap()
      toast.success('Payment deleted.')
    } catch (err) {
      toast.error('Payment delete karne mein galti hui: ' + (err.data?.message || err.error))
    }
  }

  const Label = ({ children }) => (
    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>{children}</div>
  )

  if (isLoading) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '36px', color: '#0ea5e9', marginBottom: '14px', display: 'block' }} />
      <div style={{ fontWeight: 600 }}>Loading payments...</div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '9px' }}>
            <i className="fa-solid fa-credit-card" style={{ color: '#0ea5e9' }} /> Payments
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Tamam shops ke payment records manage karo</p>
        </div>
        <button onClick={() => setAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '10px', background: '#0ea5e9', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '13.5px', boxShadow: '0 2px 10px rgba(14,165,233,.3)' }}
          onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
          onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
        >
          <i className="fa-solid fa-plus" /> Payment Add Karo
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: '14px', marginBottom: '22px' }}>
        {[
          { icon: 'circle-check', label: 'Total Collected', val: `₨ ${totalPaid.toLocaleString()}`, color: '#16a34a', bg: '#dcfce7' },
          { icon: 'clock',        label: 'Pending Amount',  val: `₨ ${totalPending.toLocaleString()}`, color: '#b45309', bg: '#fef9c3' },
          { icon: 'check-double', label: 'Paid Invoices',   val: paidCount,    color: '#0369a1', bg: '#e0f2fe' },
          { icon: 'hourglass',    label: 'Pending',          val: pendCount,    color: '#dc2626', bg: '#fee2e2' },
        ].map(({ icon, label, val, color, bg }) => (
          <div key={label} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '13px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '13px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', color, flexShrink: 0 }}>
              <i className={`fa-solid fa-${icon}`} />
            </div>
            <div>
              <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>{label}</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '19px', color: '#1e293b', marginTop: '2px' }}>{val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
          <input type="text" placeholder="Shop name, email ya ID dhundo..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inpStyle, width: '100%', paddingLeft: '36px', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}
            onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,.07)' }}
          />
        </div>
        {['all', 'Paid', 'Pending'].map(s => {
          const active = filterStatus === s
          const icon = s === 'all' ? 'border-all' : s === 'Paid' ? 'circle-check' : 'clock'
          return (
            <div key={s} onClick={() => setFilterStatus(s)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '9px', border: `1.5px solid ${active ? '#0ea5e9' : '#e2e8f0'}`, background: active ? '#0ea5e9' : '#fff', color: active ? '#fff' : '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all .18s', boxShadow: active ? '0 2px 8px rgba(14,165,233,.25)' : 'none' }}>
              <i className={`fa-solid fa-${icon}`} />
              {s === 'all' ? 'Tamam' : s}
              <span style={{ padding: '1px 6px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: active ? 'rgba(255,255,255,.25)' : '#f1f5f9', color: active ? '#fff' : '#64748b' }}>
                {s === 'all' ? payments.length : payments.filter(p => p.status === s).length}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
        <strong style={{ color: '#1e293b' }}>{filtered.length}</strong> record{filtered.length !== 1 ? 's' : ''} mile
      </div>

      {/* Payment Cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1.5px solid #e2e8f0' }}>
          <i className="fa-solid fa-receipt" style={{ fontSize: '40px', marginBottom: '14px', display: 'block', opacity: .3 }} />
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: '#64748b' }}>Koi payment nahi mila</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(p => {
            const ss = STATUS_STYLE[p.status]
            return (
              <div key={p.id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,.05)', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#bae6fd'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(14,165,233,.08)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  {/* Left */}
                  <div style={{ display: 'flex', gap: '13px', alignItems: 'flex-start' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: ss.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: ss.color, flexShrink: 0 }}>
                      <i className={`fa-solid fa-${ss.icon}`} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>{p.shop}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{p.email}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        <span style={{ background: '#f1f5f9', borderRadius: '5px', padding: '1px 6px', fontWeight: 600 }}>{p.id}</span>
                        &nbsp;·&nbsp;{p.month}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '20px', color: '#1e293b' }}>
                      ₨ {p.amount.toLocaleString()}
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 700, background: ss.bg, color: ss.color, marginTop: '4px' }}>
                      <i className={`fa-solid fa-${ss.icon}`} style={{ fontSize: '9px' }} /> {p.status}
                    </span>
                  </div>
                </div>

                {/* Details bar */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
                  <span><i className="fa-solid fa-tag" style={{ marginRight: '4px', color: '#6d28d9' }} />{p.plan}</span>
                  <span><i className="fa-solid fa-calendar" style={{ marginRight: '4px', color: '#0ea5e9' }} />{p.date}</span>
                  {p.method && (
                    <span><i className={`fa-solid fa-${METHOD_ICON[p.method] || 'credit-card'}`} style={{ marginRight: '4px', color: '#10b981' }} />{p.method}</span>
                  )}

                  {/* Action btns */}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '7px' }}>
                    {p.status === 'Pending' && (
                      <button onClick={() => { setMarkModal(p); setMarkMethod('EasyPaisa') }}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '7px', border: 'none', background: '#dcfce7', color: '#16a34a', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#bbf7d0'}
                        onMouseLeave={e => e.currentTarget.style.background = '#dcfce7'}
                      >
                        <i className="fa-solid fa-circle-check" /> Mark Paid
                      </button>
                    )}
                    <button onClick={() => deletePayment(p.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '7px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                    >
                      <i className="fa-solid fa-trash" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── MARK PAID MODAL ── */}
      <Modal isOpen={!!markModal} onClose={() => setMarkModal(null)}>
        {markModal && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-circle-check" style={{ color: '#16a34a' }} /> Payment Mark Karo
            </div>
            <button onClick={() => setMarkModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px' }}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div style={{ background: '#f0f9ff', borderRadius: '10px', padding: '13px', marginBottom: '18px', border: '1px solid #bae6fd' }}>
            <div style={{ fontWeight: 700, color: '#1e293b' }}>{markModal.shop}</div>
            <div style={{ fontSize: '13px', color: '#0369a1', fontWeight: 700, marginTop: '4px' }}>₨ {markModal.amount.toLocaleString()}</div>
          </div>

          <Label>Payment Method</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '18px' }}>
            {['EasyPaisa', 'JazzCash', 'Bank Transfer'].map(m => (
              <button key={m} onClick={() => setMarkMethod(m)}
                style={{ padding: '10px 8px', borderRadius: '9px', border: `2px solid ${markMethod === m ? '#0ea5e9' : '#e2e8f0'}`, background: markMethod === m ? '#e0f2fe' : '#fff', color: markMethod === m ? '#0369a1' : '#64748b', fontWeight: 700, fontSize: '12px', cursor: 'pointer', textAlign: 'center' }}>
                <i className={`fa-solid fa-${METHOD_ICON[m]}`} style={{ display: 'block', fontSize: '18px', marginBottom: '4px' }} />
                {m}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setMarkModal(null)}
              style={{ flex: 1, padding: '11px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
              Cancel
            </button>
            <button onClick={markPaid}
              style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
              onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
            >
              <i className="fa-solid fa-check" style={{ marginRight: '6px' }} />Confirm Paid
            </button>
          </div>
        </>}
      </Modal>

      {/* ── ADD PAYMENT MODAL ── */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-plus" style={{ color: '#0ea5e9' }} /> Payment Record Add Karo
          </div>
          <button onClick={() => setAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px' }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <Label>Shop Name</Label>
            <input style={inpStyle} placeholder="Shop ka naam" value={newPay.shop} onChange={e => setNewPay({ ...newPay, shop: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <Label>Email</Label>
            <input style={inpStyle} placeholder="shop@email.com" value={newPay.email} onChange={e => setNewPay({ ...newPay, email: e.target.value })} />
          </div>
          <div>
            <Label>Amount (₨)</Label>
            <input style={inpStyle} type="number" placeholder="1500" value={newPay.amount} onChange={e => setNewPay({ ...newPay, amount: e.target.value })} />
          </div>
          <div>
            <Label>Plan</Label>
            <select style={inpStyle} value={newPay.plan} onChange={e => setNewPay({ ...newPay, plan: e.target.value })}>
              <option>Basic</option><option>Premium</option><option>Enterprise</option>
            </select>
          </div>
          <div>
            <Label>Payment Method</Label>
            <select style={inpStyle} value={newPay.method} onChange={e => setNewPay({ ...newPay, method: e.target.value })}>
              <option>EasyPaisa</option><option>JazzCash</option><option>Bank Transfer</option>
            </select>
          </div>
          <div>
            <Label>Month</Label>
            <input style={inpStyle} placeholder="e.g. April 2026" value={newPay.month} onChange={e => setNewPay({ ...newPay, month: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setAddModal(false)}
            style={{ flex: 1, padding: '11px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
            Cancel
          </button>
          <button onClick={handleAdd}
            style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
            onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
          >
            <i className="fa-solid fa-check" style={{ marginRight: '6px' }} />Add Record
          </button>
        </div>
      </Modal>
    </div>
  )
}
