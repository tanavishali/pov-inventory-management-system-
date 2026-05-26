import { useState, useMemo, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { INITIAL_PRODUCTS } from './ProductManagement'
import { INITIAL_SHOPS } from './ShopsManagement'
import { useGetProductsQuery } from '../../store/slices/productsApiSlice'
import {
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation
} from '../../store/slices/ordersApiSlice'

/* ─── Constants ─── */
const STATUS_LABELS = {
  pending: 'Pending', approved: 'Approved',
  dispatched: 'Dispatched', completed: 'Completed', cancelled: 'Cancelled',
}
const STATUS_ICONS = {
  pending: 'fa-clock', approved: 'fa-circle-check',
  dispatched: 'fa-truck', completed: 'fa-check-double', cancelled: 'fa-xmark',
}
const STATUS_COLORS = {
  pending:   { strip: '#f59e0b', badge: { bg: '#fef9c3', color: '#b45309' }, count: { bg: '#fef9c3', color: '#b45309' } },
  approved:  { strip: '#6366f1', badge: { bg: '#ede9fe', color: '#6d28d9' }, count: { bg: '#ede9fe', color: '#6d28d9' } },
  dispatched:{ strip: '#0ea5e9', badge: { bg: '#e0f2fe', color: '#0369a1' }, count: { bg: '#e0f2fe', color: '#0369a1' } },
  completed: { strip: '#10b981', badge: { bg: '#dcfce7', color: '#16a34a' }, count: { bg: '#dcfce7', color: '#16a34a' } },
  cancelled: { strip: '#ef4444', badge: { bg: '#fee2e2', color: '#dc2626' }, count: { bg: '#fee2e2', color: '#dc2626' } },
}

export const INITIAL_ORDERS = []

const fmt = n => '₨' + Number(n).toLocaleString('en-PK')
const orderTotal = o => o.products.reduce((s, p) => s + p.qty * p.price, 0)

/* ─── Shared Modal Wrapper ─── */
function Modal({ isOpen, onClose, children, wide = false }) {
  if (!isOpen) return null
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
        backdropFilter: 'blur(4px)', zIndex: 2000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px', overflowY: 'auto',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '28px',
        width: '100%', maxWidth: wide ? '540px' : '620px',
        boxShadow: '0 24px 64px rgba(0,0,0,.18)',
        animation: 'omIn .22s ease', margin: 'auto',
      }}>
        {children}
      </div>
      <style>{`@keyframes omIn{from{opacity:0;transform:scale(.95) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);}}`}</style>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 13px',
  border: '1.5px solid #e2e8f0', borderRadius: '9px',
  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px',
  color: '#1e293b', background: '#f5f7fa', outline: 'none',
  transition: 'border-color .2s',
}

/* ─── Status Badge ─── */
function StatusBadge({ status, size = 'sm' }) {
  const sc = STATUS_COLORS[status]
  return (
    <span style={{
      padding: size === 'lg' ? '5px 12px' : '4px 10px',
      borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '.3px',
      background: sc.badge.bg, color: sc.badge.color,
    }}>
      <i className={`fa-solid ${STATUS_ICONS[status]}`} style={{ marginRight: '4px', fontSize: '10px' }} />
      {STATUS_LABELS[status]}
    </span>
  )
}

/* ─── Payment Badge ─── */
function PayBadge({ payment }) {
  return payment === 'Paid'
    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>
        <i className="fa-solid fa-check-circle" /> Paid
      </span>
    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: '#fef9c3', color: '#b45309' }}>
        <i className="fa-solid fa-clock" /> Udaar
      </span>
}

/* ─── Order Card ─── */
function OrderCard({ order, onView, onPrint, onChangeStatus, onDelete, onEdit }) {
  const total = orderTotal(order)
  const sc = STATUS_COLORS[order.status]
  const totalQty = order.products.reduce((s, p) => s + p.qty, 0)

  const actionBtns = {
    pending:    ['view', 'print', 'edit', 'approve', 'cancel', 'delete'],
    approved:   ['view', 'print', 'edit', 'dispatch', 'cancel', 'delete'],
    dispatched: ['view', 'print', 'edit', 'complete', 'cancel', 'delete'],
    completed:  ['view', 'print', 'edit', 'delete'],
    cancelled:  ['view', 'edit', 'delete'],
  }[order.status] || ['view']

  const btns = {
    view:     { label: 'View',     icon: 'eye',          bg: '#f1f5f9', color: '#475569', hov: '#e2e8f0', action: () => onView(order) },
    print:    { label: 'Print',    icon: 'print',        bg: '#f1f5f9', color: '#475569', hov: '#e2e8f0', action: () => onPrint(order) },
    edit:     { label: 'Edit',     icon: 'pen-to-square', bg: '#ede9fe', color: '#6d28d9', hov: '#ddd6fe', action: () => onEdit(order) },
    approve:  { label: 'Approve',  icon: 'circle-check', bg: '#ede9fe', color: '#6d28d9', hov: '#ddd6fe', action: () => onChangeStatus(order.id, 'approved') },
    dispatch: { label: 'Dispatch', icon: 'truck',        bg: '#e0f2fe', color: '#0369a1', hov: '#bae6fd', action: () => onChangeStatus(order.id, 'dispatched') },
    complete: { label: 'Complete', icon: 'check-double', bg: '#dcfce7', color: '#16a34a', hov: '#bbf7d0', action: () => onChangeStatus(order.id, 'completed') },
    cancel:   { label: 'Cancel',   icon: 'xmark',        bg: '#fee2e2', color: '#dc2626', hov: '#fecaca', action: () => onChangeStatus(order.id, 'cancelled') },
    delete:   { label: 'Delete',   icon: 'trash',        bg: '#1e293b', color: '#f1f5f9', hov: '#334155', action: () => onDelete(order.id) },
  }

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px',
      overflow: 'hidden', transition: 'all .22s',
      boxShadow: '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.1)'; e.currentTarget.style.borderColor = '#cbd5e1' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)'; e.currentTarget.style.borderColor = '#e2e8f0' }}
    >
      {/* Color strip */}
      <div style={{ height: '4px', background: sc.strip }} />

      <div style={{ padding: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '16px', color: '#1e293b' }}>{order.id}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fa-regular fa-calendar" /> {order.date} &nbsp;·&nbsp;
              <i className="fa-regular fa-clock" /> {order.time}
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 0' }} />

        {/* Customer Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          {[
            { icon: 'user',          label: 'Customer', val: order.customer },
            { icon: 'store',         label: 'Shop',     val: order.shop },
            { icon: 'user-tie',      label: 'Salesman', val: order.salesman },
            { icon: 'boxes-stacked', label: 'Products', val: `${order.products.length} item${order.products.length !== 1 ? 's' : ''}` },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                <i className={`fa-solid fa-${icon}`} style={{ marginRight: '3px' }} />{label}
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Amount row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f5f7fa', borderRadius: '9px', padding: '10px 12px', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Total Amount</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '19px', color: '#1e293b' }}>{fmt(total)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '15px', color: '#0ea5e9' }}>{totalQty}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Total Qty</div>
          </div>
        </div>

        {/* Advance/Balance Due row for Udaar orders */}
        {order.payment === 'Udaar' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
            <div style={{ background: '#d1fae5', borderRadius: '8px', padding: '7px 10px' }}>
              <div style={{ fontSize: '10px', color: '#065f46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>Advance Diya</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '14px', color: '#059669' }}>{fmt(order.advance || 0)}</div>
            </div>
            <div style={{ background: total - (order.advance || 0) > 0 ? '#fee2e2' : '#d1fae5', borderRadius: '8px', padding: '7px 10px' }}>
              <div style={{ fontSize: '10px', color: total - (order.advance || 0) > 0 ? '#7f1d1d' : '#065f46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>Balance Due Rahe Ga</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '14px', color: total - (order.advance || 0) > 0 ? '#dc2626' : '#059669' }}>
                {fmt(Math.max(0, total - (order.advance || 0)))}
              </div>
            </div>
          </div>
        )}

        {/* Payment */}
        <div style={{ marginBottom: '12px' }}>
          <PayBadge payment={order.payment} />
        </div>

        <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 0' }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {actionBtns.map(key => {
            const b = btns[key]
            return (
              <button key={key} onClick={b.action}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 11px', borderRadius: '8px', border: 'none', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: b.bg, color: b.color, transition: 'all .18s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.background = b.hov; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = b.bg; e.currentTarget.style.transform = '' }}
              >
                <i className={`fa-solid fa-${b.icon}`} /> {b.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── View Order Modal ─── */
function ViewModal({ order, onClose, onPrint }) {
  if (!order) return null
  const total = orderTotal(order)
  return (
    <Modal isOpen={!!order} onClose={onClose}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '20px' }}>Order {order.id}</div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', marginBottom: '20px' }}>Placed on {order.date} at {order.time}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px', padding: '4px', borderRadius: '6px' }}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }} className="vm-info-grid">
        {[
          { icon: 'user',         label: 'Customer', val: order.customer },
          { icon: 'store',        label: 'Shop',     val: order.shop },
          { icon: 'user-tie',     label: 'Salesman', val: order.salesman },
          { icon: 'circle-info',  label: 'Status',   val: <StatusBadge status={order.status} size="lg" /> },
          { icon: 'money-bill',   label: 'Payment',  val: <PayBadge payment={order.payment} /> },
          { icon: 'calendar',     label: 'Date & Time', val: `${order.date} · ${order.time}` },
        ].map(({ icon, label, val }) => (
          <div key={label} style={{ background: '#f5f7fa', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>
              <i className={`fa-solid fa-${icon}`} style={{ marginRight: '4px' }} />{label}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Products */}
      <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '7px' }}>
        <i className="fa-solid fa-box" style={{ color: '#0ea5e9' }} /> Order Items
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Product', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
              <th key={h} style={{ textAlign: i === 3 ? 'right' : 'left', fontSize: '11px', color: '#94a3b8', padding: '0 0 8px', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {order.products.map((p, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px 0', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 600 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg,#e0f2fe,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="fa-solid fa-box" style={{ fontSize: '12px', color: '#6366f1', opacity: .75 }} />
                  </div>
                  {p.name}
                </div>
              </td>
              <td style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px' }}>{p.qty}</td>
              <td style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px' }}>{fmt(p.price)}</td>
              <td style={{ padding: '10px 0', textAlign: 'right', fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: '#0ea5e9', fontSize: '13px' }}>{fmt(p.qty * p.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px', paddingTop: '14px', borderTop: '2px solid #e2e8f0' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '3px' }}>Grand Total</div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '20px', color: '#1e293b' }}>{fmt(total)}</div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => onPrint(order)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <i className="fa-solid fa-print" /> Print Invoice
        </button>
        <button onClick={onClose}
          style={{ padding: '9px 18px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
          Close
        </button>
      </div>

      <style>{`@media(max-width:480px){.vm-info-grid{grid-template-columns:1fr !important;}}`}</style>
    </Modal>
  )
}

/* ─── New Order Modal ─── */
function NewOrderModal({ isOpen, onClose, onPlace, products = [] }) {
  const [customer, setCustomer] = useState('')
  const [shop, setShop] = useState('')
  const [phone, setPhone] = useState('')
  const [salesman, setSalesman] = useState('')
  const [category, setCategory] = useState('')
  const [payment, setPayment] = useState('Paid')
  const [advance, setAdvance] = useState('')
  const [rows, setRows] = useState([{ id: 1, name: '', qty: 1, price: 0, ctn: '' }])
  const [error, setError] = useState('')
  const [prodSuggestions, setProdSuggestions] = useState({ id: null, list: [] })
  const [custSuggestions, setCustSuggestions] = useState([])
  const nextId = useRef(2)

  const ORDER_CATEGORIES = useMemo(() => {
    const cats = products.map(p => p.cat).filter(Boolean)
    return [...new Set(cats)].sort()
  }, [products])

  const addRow = () => setRows(r => [...r, { id: nextId.current++, name: '', qty: 1, price: 0, ctn: '' }])
  const removeRow = id => { setRows(r => r.filter(x => x.id !== id)); if (prodSuggestions.id === id) setProdSuggestions({ id: null, list: [] }) }
  const updateRow = (id, field, val) => setRows(r => r.map(x => x.id === id ? { ...x, [field]: val } : x))

  // Customer name search → show matching shops
  const handleCustomerSearch = (val) => {
    setCustomer(val)
    if (val.trim().length < 1) { setCustSuggestions([]); return }
    const q = val.toLowerCase()
    const matches = INITIAL_SHOPS.filter(s =>
      s.owner.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 6)
    setCustSuggestions(matches)
  }

  // Auto-fill customer name, shop name, phone when shop selected
  const selectShop = (s) => {
    setCustomer(s.owner)
    setShop(s.name)
    setPhone(s.phone)
    setCustSuggestions([])
  }

  const handleProductSearch = (rowId, val) => {
    updateRow(rowId, 'name', val)
    if (val.trim().length < 1) {
      if (category) {
        const catMatches = products.filter(p => p.cat === category).slice(0, 6)
        setProdSuggestions({ id: rowId, list: catMatches })
      } else {
        setProdSuggestions({ id: null, list: [] })
      }
      return
    }
    const matches = products.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(val.toLowerCase())
      const catMatch = !category || p.cat === category
      return nameMatch && catMatch
    }).slice(0, 6)
    setProdSuggestions({ id: rowId, list: matches })
  }

  const selectProduct = (rowId, product) => {
    setRows(r => r.map(x => x.id === rowId ? { ...x, name: product.name, price: product.selling } : x))
    setProdSuggestions({ id: null, list: [] })
  }

  const total = rows.reduce((s, r) => s + (r.qty || 0) * (r.price || 0), 0)
  const advanceAmt = payment === 'Udaar' ? (parseInt(advance) || 0) : 0
  const remaining = total - advanceAmt

  const handleClose = () => {
    setCustomer(''); setShop(''); setPhone(''); setSalesman(''); setCategory(''); setPayment('Paid'); setAdvance('')
    setRows([{ id: 1, name: '', qty: 1, price: 0, ctn: '' }]); setError('')
    setProdSuggestions({ id: null, list: [] }); setCustSuggestions([]); nextId.current = 2
    onClose()
  }

  const handlePlace = () => {
    if (!customer.trim() || !shop.trim()) { setError('Customer aur shop name zaroori hain.'); return }
    const prods = rows.filter(r => r.name.trim() && r.qty > 0).map(r => ({ name: r.name.trim(), qty: parseInt(r.qty) || 1, price: parseInt(r.price) || 0, ctn: parseInt(r.ctn) || 0 }))
    if (!prods.length) { setError('Kam se kam ek product add karo.'); return }
    onPlace({ customer: customer.trim(), shop: shop.trim(), phone: phone.trim(), salesman: salesman.trim(), payment, advance: advanceAmt, products: prods })
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} wide>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '20px' }}>
          <i className="fa-solid fa-cart-plus" style={{ color: '#0ea5e9', marginRight: '8px' }} />New Order
        </div>
        <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px', padding: '4px', borderRadius: '6px' }}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>Order details fill karo</div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 13px', fontSize: '13px', color: '#dc2626', marginBottom: '14px', fontWeight: 600 }}>{error}</div>}

      {/* Customer / Shop / Phone / Salesman fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }} className="no-half">

        {/* Customer Name with shop dropdown */}
        <div style={{ position: 'relative' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>
            <i className="fa-solid fa-user" style={{ marginRight: '4px' }} />Customer Name
          </label>
          <input style={inputStyle} type="text" placeholder="Naam likhein ya shop se select karein..."
            value={customer}
            onChange={e => handleCustomerSearch(e.target.value)}
            onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)'; handleCustomerSearch(customer) }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none'; setTimeout(() => setCustSuggestions([]), 180) }}
          />
          {custSuggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 3000, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,.13)', marginTop: '4px', overflow: 'hidden' }}>
              <div style={{ padding: '7px 13px 5px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <i className="fa-solid fa-store" style={{ marginRight: '5px' }} />Shop Management se Select Karein
              </div>
              {custSuggestions.map(s => (
                <div key={s.id} onMouseDown={() => selectShop(s)}
                  style={{ padding: '10px 13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f8fafc', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>{s.owner}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                      <i className="fa-solid fa-store" style={{ marginRight: '4px', fontSize: '9px' }} />{s.name}
                      <span style={{ margin: '0 5px' }}>·</span>
                      <i className="fa-solid fa-location-dot" style={{ marginRight: '3px', fontSize: '9px' }} />{s.city}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#0ea5e9', fontWeight: 600 }}>{s.phone}</div>
                    <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '999px', background: s.status === 'active' ? '#dcfce7' : '#fee2e2', color: s.status === 'active' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shop Name */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>
            <i className="fa-solid fa-store" style={{ marginRight: '4px' }} />Shop Name
          </label>
          <input style={inputStyle} type="text" placeholder="e.g. Al-Noor Store" value={shop} onChange={e => setShop(e.target.value)}
            onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Phone */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>
            <i className="fa-solid fa-phone" style={{ marginRight: '4px' }} />Customer Phone
          </label>
          <input style={inputStyle} type="text" placeholder="+92-300-1234567" value={phone} onChange={e => setPhone(e.target.value)}
            onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Salesman (Optional) */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>
            <i className="fa-solid fa-user-tie" style={{ marginRight: '4px' }} />Salesman Name <span style={{ color: '#cbd5e1', fontWeight: 400, textTransform: 'lowercase', letterSpacing: 0 }}>(optional)</span>
          </label>
          <input style={inputStyle} type="text" placeholder="e.g. Usman Farooq" value={salesman} onChange={e => setSalesman(e.target.value)}
            onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Category */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>
            <i className="fa-solid fa-tag" style={{ marginRight: '4px' }} />Category <span style={{ color: '#cbd5e1', fontWeight: 400, textTransform: 'lowercase', letterSpacing: 0 }}>(product filter)</span>
          </label>
          <select style={inputStyle} value={category} onChange={e => { setCategory(e.target.value); setProdSuggestions({ id: null, list: [] }) }}
            onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none' }}
          >
            <option value="">-- All Categories --</option>
            {ORDER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Payment */}
        <div style={{ gridColumn: '1/-1' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>
            <i className="fa-solid fa-credit-card" style={{ marginRight: '4px' }} />Payment Type
          </label>
          <select style={{ ...inputStyle, maxWidth: '200px' }} value={payment} onChange={e => { setPayment(e.target.value); setAdvance('') }}>
            <option value="Paid">Paid</option>
            <option value="Udaar">Udaar (Credit)</option>
          </select>
        </div>
      </div>

      {/* Advance field - only when Udaar */}
      {payment === 'Udaar' && (
        <div style={{ background: '#fef9c3', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '13px 15px', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>
            <i className="fa-solid fa-hand-holding-dollar" style={{ marginRight: '5px' }} />Advance Payment (Optional)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }} className="adv-grid">
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Advance Diye (₨)</label>
              <input style={inputStyle} type="number" min="0" placeholder="0" value={advance}
                onChange={e => setAdvance(e.target.value)}
                onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,.1)' }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Total Amount</label>
              <div style={{ ...inputStyle, background: '#f5f7fa', color: '#0ea5e9', fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>{fmt(total)}</div>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Balance Due Rahe Ga (₨)</label>
              <div style={{ ...inputStyle, background: remaining > 0 ? '#fef2f2' : '#f0fdf4', color: remaining > 0 ? '#dc2626' : '#16a34a', fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>
                {fmt(remaining < 0 ? 0 : remaining)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
          <i className="fa-solid fa-boxes-stacked" style={{ marginRight: '5px' }} />Products
        </div>
        <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '5px 10px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <i className="fa-solid fa-plus" /> Add Item
        </button>
      </div>

      {rows.map((row, idx) => (
        <div key={row.id} style={{ marginBottom: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }} className="prod-row-grid">
            <div style={{ position: 'relative' }}>
              {idx === 0 && <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Product Name</label>}
              <input style={inputStyle} type="text" placeholder="Search product..." value={row.name}
                onChange={e => handleProductSearch(row.id, e.target.value)}
                onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)'; handleProductSearch(row.id, row.name) }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none'; setTimeout(() => setProdSuggestions(s => s.id === row.id ? { id: null, list: [] } : s), 180) }}
              />
              {prodSuggestions.id === row.id && prodSuggestions.list.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 3000, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,.12)', marginTop: '4px', overflow: 'hidden' }}>
                  {category && (
                    <div style={{ padding: '5px 13px', fontSize: '10px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '.5px', background: '#f0f9ff', borderBottom: '1px solid #e0f2fe' }}>
                      <i className="fa-solid fa-tag" style={{ marginRight: '4px' }} />{category}
                    </div>
                  )}
                  {prodSuggestions.list.map(p => (
                    <div key={p.id} onMouseDown={() => selectProduct(row.id, p)}
                      style={{ padding: '9px 13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.cat} · Stock: {p.stock} · CTN: {p.ctn}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#10b981', fontSize: '12px' }}>₨{p.selling.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              {idx === 0 && <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Qty</label>}
              <input style={inputStyle} type="number" min="1" value={row.qty} onChange={e => updateRow(row.id, 'qty', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              {idx === 0 && <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Price (₨)</label>}
              <input style={inputStyle} type="number" min="0" value={row.price} onChange={e => updateRow(row.id, 'price', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              {idx === 0 && <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>CTN</label>}
              <input style={inputStyle} type="number" min="0" placeholder="0" value={row.ctn} onChange={e => updateRow(row.id, 'ctn', e.target.value)} />
            </div>
            <button onClick={() => removeRow(row.id)}
              style={{ background: '#fee2e2', color: '#dc2626', border: 'none', width: '34px', height: '41px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: idx === 0 ? '22px' : '0', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
              onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
            >
              <i className="fa-solid fa-minus" />
            </button>
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'right', marginTop: '8px', fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '16px', color: '#1e293b' }}>
        Total: <span style={{ color: '#0ea5e9' }}>{fmt(total)}</span>
        {payment === 'Udaar' && advanceAmt > 0 && (
          <span style={{ fontSize: '13px', color: '#dc2626', marginLeft: '12px' }}>
            Balance Due: <span style={{ fontWeight: 900 }}>{fmt(remaining < 0 ? 0 : remaining)}</span>
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '9px', marginTop: '20px' }}>
        <button onClick={handlePlace}
          style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', background: '#0ea5e9', color: '#fff', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', transition: 'background .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
          onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
        >
          <i className="fa-solid fa-check" style={{ marginRight: '5px' }} />Place Order
        </button>
        <button onClick={handleClose}
          style={{ padding: '11px 18px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>

      <style>{`
        @media(max-width:480px){
          .no-half{grid-template-columns:1fr !important;}
          .prod-row-grid{grid-template-columns:1fr 1fr !important;}
          .adv-grid{grid-template-columns:1fr !important;}
        }
      `}</style>
    </Modal>
  )
}


/* ─── EDIT ORDER MODAL ─── */
function EditOrderModal({ isOpen, order, onClose, onSave, products = [] }) {
  const [customer, setCustomer] = useState('')
  const [shop, setShop] = useState('')
  const [salesman, setSalesman] = useState('')
  const [payment, setPayment] = useState('Paid')
  const [advance, setAdvance] = useState('')
  const [status, setStatus] = useState('pending')
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState({ id: null, list: [] })
  const nextId = useRef(100)
  const prevOrderId = useRef(null)

  // Sync form when order changes - always pre-fill from order data
  if (order && order.id !== prevOrderId.current) {
    prevOrderId.current = order.id
    setCustomer(order.customer || '')
    setShop(order.shop || '')
    setSalesman(order.salesman || '')
    setPayment(order.payment || 'Paid')
    setAdvance(order.advance ? String(order.advance) : '')
    setStatus(order.status || 'pending')
    setRows(order.products.map((p, i) => ({ id: i + 1, name: p.name, qty: p.qty, price: p.price, ctn: p.ctn || '' })))
    nextId.current = order.products.length + 1
    setError('')
  }

  const addRow = () => setRows(r => [...r, { id: nextId.current++, name: '', qty: 1, price: 0, ctn: '' }])
  const removeRow = id => { setRows(r => r.filter(x => x.id !== id)); setSuggestions({ id: null, list: [] }) }
  const updateRow = (id, field, val) => setRows(r => r.map(x => x.id === id ? { ...x, [field]: val } : x))

  const handleProductSearch = (rowId, val) => {
    updateRow(rowId, 'name', val)
    if (val.trim().length < 1) { setSuggestions({ id: null, list: [] }); return }
    const matches = products.filter(p => p.name.toLowerCase().includes(val.toLowerCase())).slice(0, 6)
    setSuggestions({ id: rowId, list: matches })
  }

  const selectProduct = (rowId, product) => {
    setRows(r => r.map(x => x.id === rowId ? { ...x, name: product.name, price: product.selling } : x))
    setSuggestions({ id: null, list: [] })
  }

  const total = rows.reduce((s, r) => s + (r.qty || 0) * (r.price || 0), 0)
  const advanceAmt = payment === 'Udaar' ? (parseInt(advance) || 0) : 0
  const remaining = total - advanceAmt

  const handleSave = () => {
    if (!customer.trim() || !shop.trim() || !salesman.trim()) { setError('Customer, shop aur salesman name zaroori hain.'); return }
    const prods = rows.filter(r => r.name.trim() && r.qty > 0).map(r => ({ name: r.name.trim(), qty: parseInt(r.qty) || 1, price: parseInt(r.price) || 0, ctn: parseInt(r.ctn) || 0 }))
    if (!prods.length) { setError('Kam se kam ek product add karo.'); return }
    onSave({ ...order, customer: customer.trim(), shop: shop.trim(), salesman: salesman.trim(), payment, advance: advanceAmt, status, products: prods })
    prevOrderId.current = null
    onClose()
  }

  const handleClose = () => { prevOrderId.current = null; setSuggestions({ id: null, list: [] }); onClose() }

  if (!isOpen || !order) return null
  return (
    <Modal isOpen={isOpen} onClose={handleClose} wide>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '20px' }}>
          <i className="fa-solid fa-pen-to-square" style={{ color: '#6366f1', marginRight: '8px' }} />Edit Order {order.id}
        </div>
        <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px', padding: '4px', borderRadius: '6px' }}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
        {order.customer} — {order.shop} — {order.date}
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 13px', fontSize: '13px', color: '#dc2626', marginBottom: '14px', fontWeight: 600 }}>{error}</div>}

      {/* Info Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }} className="eo-half">
        {[
          { label: 'Customer Name', placeholder: 'e.g. Ali Hassan',    val: customer,  set: setCustomer },
          { label: 'Shop Name',     placeholder: 'e.g. Al-Noor Store', val: shop,      set: setShop },
          { label: 'Salesman Name', placeholder: 'e.g. Usman Farooq',  val: salesman,  set: setSalesman },
        ].map(({ label, placeholder, val, set }) => (
          <div key={label}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>{label}</label>
            <input style={inputStyle} type="text" placeholder={placeholder} value={val} onChange={e => set(e.target.value)}
              onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.1)' }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        ))}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Status</label>
          <select style={inputStyle} value={status} onChange={e => setStatus(e.target.value)}>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Payment</label>
          <select style={inputStyle} value={payment} onChange={e => { setPayment(e.target.value); if (e.target.value === 'Paid') setAdvance('') }}>
            <option value="Paid">Paid</option>
            <option value="Udaar">Udaar (Credit)</option>
          </select>
        </div>
      </div>

      {/* Advance - only when Udaar */}
      {payment === 'Udaar' && (
        <div style={{ background: '#fef9c3', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '13px 15px', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>
            <i className="fa-solid fa-hand-holding-dollar" style={{ marginRight: '5px' }} />Advance Payment
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }} className="adv-grid2">
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Advance Diye (₨)</label>
              <input style={inputStyle} type="number" min="0" placeholder="0" value={advance}
                onChange={e => setAdvance(e.target.value)}
                onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,.1)' }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Total Amount</label>
              <div style={{ ...inputStyle, background: '#f5f7fa', color: '#0ea5e9', fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>{fmt(total)}</div>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Balance Due Rahe Ga (₨)</label>
              <div style={{ ...inputStyle, background: remaining > 0 ? '#fef2f2' : '#f0fdf4', color: remaining > 0 ? '#dc2626' : '#16a34a', fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>
                {fmt(remaining < 0 ? 0 : remaining)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
          <i className="fa-solid fa-boxes-stacked" style={{ marginRight: '5px' }} />Products
        </div>
        <button onClick={addRow}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#ede9fe', color: '#6d28d9', border: 'none', padding: '5px 10px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <i className="fa-solid fa-plus" /> Add Item
        </button>
      </div>

      {rows.map((row, idx) => (
        <div key={row.id} style={{ marginBottom: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }} className="eo-prod-row">
            <div style={{ position: 'relative' }}>
              {idx === 0 && <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Product</label>}
              <input
                style={inputStyle} type="text" placeholder="Search product..."
                value={row.name}
                onChange={e => handleProductSearch(row.id, e.target.value)}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.1)'; handleProductSearch(row.id, row.name) }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none'; setTimeout(() => setSuggestions(s => s.id === row.id ? { id: null, list: [] } : s), 180) }}
              />
              {suggestions.id === row.id && suggestions.list.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 3000, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,.12)', marginTop: '4px', overflow: 'hidden' }}>
                  {suggestions.list.map(p => (
                    <div key={p.id} onMouseDown={() => selectProduct(row.id, p)}
                      style={{ padding: '9px 13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.cat} · Stock: {p.stock}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#10b981', fontSize: '12px' }}>₨{p.selling.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              {idx === 0 && <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Qty</label>}
              <input style={inputStyle} type="number" min="1" value={row.qty} onChange={e => updateRow(row.id, 'qty', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              {idx === 0 && <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>Price (₨)</label>}
              <input style={inputStyle} type="number" min="0" value={row.price} onChange={e => updateRow(row.id, 'price', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              {idx === 0 && <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>CTN</label>}
              <input style={inputStyle} type="number" min="0" placeholder="0" value={row.ctn} onChange={e => updateRow(row.id, 'ctn', e.target.value)} />
            </div>
            <button onClick={() => removeRow(row.id)}
              style={{ background: '#fee2e2', color: '#dc2626', border: 'none', width: '34px', height: '41px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: idx === 0 ? '22px' : '0', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
              onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
            >
              <i className="fa-solid fa-minus" />
            </button>
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'right', marginTop: '8px', fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '16px', color: '#1e293b' }}>
        Total: <span style={{ color: '#6366f1' }}>{fmt(total)}</span>
        {payment === 'Udaar' && advanceAmt > 0 && (
          <span style={{ fontSize: '13px', color: '#dc2626', marginLeft: '12px' }}>
            Balance Due: <span style={{ fontWeight: 900 }}>{fmt(remaining < 0 ? 0 : remaining)}</span>
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '9px', marginTop: '20px' }}>
        <button onClick={handleSave}
          style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', background: '#6366f1', color: '#fff', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', transition: 'background .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
          onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
        >
          <i className="fa-solid fa-check" style={{ marginRight: '5px' }} />Save Changes
        </button>
        <button onClick={handleClose}
          style={{ padding: '11px 18px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>

      <style>{`
        @media(max-width:480px){
          .eo-half{grid-template-columns:1fr !important;}
          .eo-prod-row{grid-template-columns:1fr 1fr !important;}
          .adv-grid2{grid-template-columns:1fr !important;}
        }
      `}</style>
    </Modal>
  )
}

/* ─── Invoice Preview Modal ─── */
function InvoiceModal({ order, onClose, onPrint }) {
  if (!order) return null
  const total = orderTotal(order)
  const advAmt = order.payment === 'Udaar' ? (order.advance || 0) : 0
  const baki = Math.max(0, total - advAmt)

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,.6)',
        backdropFilter: 'blur(6px)', zIndex: 2500,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '16px', overflowY: 'auto',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px', overflow: 'hidden',
        width: '100%', maxWidth: '680px',
        boxShadow: '0 24px 80px rgba(0,0,0,.25)',
        animation: 'invIn .24s ease', margin: 'auto',
      }}>
        {/* Gradient Header */}
        <div style={{ background: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: '#fff', fontSize: '22px', fontWeight: 900, fontFamily: "'Outfit',sans-serif", lineHeight: 1 }}>{bizName}</div>
            <div style={{ color: 'rgba(255,255,255,.7)', fontSize: '11px', marginTop: '3px' }}>Wholesale Management System</div>
          </div>
          <div style={{ textAlign: 'right', color: '#fff' }}>
            <div style={{ fontWeight: 900, fontSize: '18px', letterSpacing: '2px', opacity: .9 }}>INVOICE</div>
            <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '3px' }}>{order.id}</div>
            <div style={{ fontSize: '11px', opacity: .75, marginTop: '2px' }}>{order.date}</div>
            <div style={{ fontSize: '10px', opacity: .6, marginTop: '1px' }}>{order.time}</div>
          </div>
        </div>

        {/* From / To */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0' }} className="inv-from-to">
          <div style={{ flex: 1, padding: '16px 22px', borderRight: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: '#94a3b8', marginBottom: '7px' }}>Invoice From</div>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>{bizName}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{bizPhone}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{bizAddress}</div>
            {order.salesman && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8' }}>Salesman</div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b', marginTop: '2px' }}>{order.salesman}</div>
              </div>
            )}
          </div>
          <div style={{ flex: 1, padding: '16px 22px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.7px', color: '#94a3b8', marginBottom: '7px' }}>Invoice To</div>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>{order.customer}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{order.shop}</div>
            {order.phone && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{order.phone}</div>}
          </div>
        </div>

        {/* Status strip */}
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '9px 22px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Status', val: STATUS_LABELS[order.status], color: STATUS_COLORS[order.status].badge.color },
            { label: 'Payment', val: order.payment, color: order.payment === 'Paid' ? '#16a34a' : '#b45309' },
            ...(order.payment === 'Udaar' ? [
              { label: 'Advance', val: `Rs ${advAmt.toLocaleString('en-PK')}`, color: '#059669' },
              { label: 'Balance Due', val: `Rs ${baki.toLocaleString('en-PK')}`, color: '#dc2626' },
            ] : []),
            { label: 'Items', val: order.products.length, color: '#0ea5e9' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ fontSize: '12px', color: '#64748b' }}>
              {label}: <strong style={{ color }}>{val}</strong>
            </div>
          ))}
        </div>

        {/* Items Table */}
        <div style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: '#94a3b8', marginBottom: '10px' }}>Order Items</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '460px' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)' }}>
                  {['#', 'Item Name', 'Qty', 'CTN', 'Unit Price', 'Total Price'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 10px', color: '#fff', fontSize: '10.5px', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '.5px',
                      textAlign: i === 0 || i === 2 || i === 3 ? 'center' : i >= 4 ? 'right' : 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.products.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>{i + 1}</td>
                    <td style={{ padding: '10px', fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>{p.name}</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>{p.qty}</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>{p.ctn || 0}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#64748b', fontSize: '13px' }}>Rs {p.price.toLocaleString('en-PK')}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#0ea5e9', fontFamily: "'Outfit',sans-serif", fontSize: '13px' }}>Rs {(p.qty * p.price).toLocaleString('en-PK')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
            <div style={{ width: '260px', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              {order.payment === 'Udaar' && advAmt > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: '12.5px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#94a3b8' }}>Subtotal</span>
                    <span>Rs {total.toLocaleString('en-PK')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: '12.5px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#94a3b8' }}>Advance Paid</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>− Rs {advAmt.toLocaleString('en-PK')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: '12.5px', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#94a3b8' }}>Balance Due</span>
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>Rs {baki.toLocaleString('en-PK')}</span>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 14px', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff' }}>
                <span style={{ fontSize: '12px', opacity: .85 }}>Grand Total</span>
                <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '16px' }}>Rs {total.toLocaleString('en-PK')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0', padding: '14px 22px', textAlign: 'center' }}>
          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginBottom: '5px' }}>
            Shukriya! Hamara wholesale network choose karne ka bahut shukriya.
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Software built by <strong style={{ color: '#6366f1' }}>TechRiwaayat Company</strong>
          </div>
          <div style={{ fontSize: '11.5px', color: '#0ea5e9', fontWeight: 700, marginTop: '2px' }}>03287458137</div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ padding: '14px 22px', display: 'flex', gap: '9px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={() => onPrint(order)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 22px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 12px rgba(14,165,233,.3)' }}
          ><i className="fa-solid fa-print" /> Print Invoice</button>
          <button onClick={onClose}
            style={{ padding: '10px 20px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
      <style>{`
        @keyframes invIn{from{opacity:0;transform:scale(.96) translateY(12px);}to{opacity:1;transform:scale(1) translateY(0);}}
        @media(max-width:520px){.inv-from-to{flex-direction:column !important;}}
      `}</style>
    </div>
  )
}

/* ─── Salesman Orders Offline Sync Helpers ─── */
const updateSalesmanOrder = (id, updatedFields) => {
  try {
    const salesmanOrders = JSON.parse(localStorage.getItem('salesman_orders') || '[]')
    const invSettings = (() => { try { return JSON.parse(localStorage.getItem('wholesale_inv') || '{}') } catch { return {} } })()
    const prefix = invSettings.prefix || 'INV-'
    const usedNums = salesmanOrders.map(o => { const n = parseInt((o.adminId || o.id || '').replace(/[^0-9]/g, '')); return isNaN(n) ? 0 : n }).filter(n => n > 0)
    let counter = usedNums.length ? Math.max(...usedNums) : 0
    
    const normalized = salesmanOrders.map(o => {
      const adminId = o.adminId || (() => { counter++; return prefix + String(counter).padStart(3, '0') })()
      return { ...o, adminId }
    })
    
    const targetIndex = normalized.findIndex(o => o.adminId === id || o.id === id)
    if (targetIndex !== -1) {
      const originalOrder = salesmanOrders[targetIndex]
      const updatedNormalized = normalized[targetIndex]
      
      const nextOrder = {
        ...originalOrder,
        adminId: updatedNormalized.adminId,
        ...updatedFields
      }
      
      if (updatedFields.customer !== undefined) nextOrder.shopOwner = updatedFields.customer
      if (updatedFields.shop !== undefined) nextOrder.shopName = updatedFields.shop
      if (updatedFields.salesman !== undefined) nextOrder.salesmanName = updatedFields.salesman
      
      salesmanOrders[targetIndex] = nextOrder
      localStorage.setItem('salesman_orders', JSON.stringify(salesmanOrders))
      window.dispatchEvent(new Event('storage'))
    }
  } catch (e) {
    console.error('Error updating salesman order', e)
  }
}

const deleteSalesmanOrder = (id) => {
  try {
    const salesmanOrders = JSON.parse(localStorage.getItem('salesman_orders') || '[]')
    const invSettings = (() => { try { return JSON.parse(localStorage.getItem('wholesale_inv') || '{}') } catch { return {} } })()
    const prefix = invSettings.prefix || 'INV-'
    const usedNums = salesmanOrders.map(o => { const n = parseInt((o.adminId || o.id || '').replace(/[^0-9]/g, '')); return isNaN(n) ? 0 : n }).filter(n => n > 0)
    let counter = usedNums.length ? Math.max(...usedNums) : 0
    
    const normalized = salesmanOrders.map(o => {
      const adminId = o.adminId || (() => { counter++; return prefix + String(counter).padStart(3, '0') })()
      return { ...o, adminId }
    })
    
    const targetIndex = normalized.findIndex(o => o.adminId === id || o.id === id)
    if (targetIndex !== -1) {
      salesmanOrders.splice(targetIndex, 1)
      localStorage.setItem('salesman_orders', JSON.stringify(salesmanOrders))
      window.dispatchEvent(new Event('storage'))
    }
  } catch (e) {
    console.error('Error deleting salesman order', e)
  }
}

/* ─── MAIN COMPONENT ─── */
export default function OrderManagement() {
  const ctx = useOutletContext() || {}
  const orders = ctx.sharedOrders ?? INITIAL_ORDERS
  const setOrders = ctx.setSharedOrders ?? (() => {})
  const isMobile = ctx.isMobile ?? false

  const { data: products = [] } = useGetProductsQuery()
  const [createOrder] = useCreateOrderMutation()
  const [updateOrder] = useUpdateOrderMutation()
  const [deleteOrder] = useDeleteOrderMutation()

  const getBiz = () => { try { return JSON.parse(localStorage.getItem('wholesale_biz') || '{}') } catch { return {} } }
  const bizName    = getBiz().name    || 'WholesalePro'
  const bizPhone   = getBiz().phone   || '03287458137'
  const bizAddress = getBiz().address || 'Wholesale Distribution Center'

  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [viewOrder, setViewOrder] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [editOrder, setEditOrder] = useState(null)
  const printRef = useRef(null)

  // Active orders — show all pending/approved/dispatched regardless of date
  const activeOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled')
  }, [orders])

  /* Counts */
  const counts = useMemo(() => ({
    all:        activeOrders.length,
    pending:    activeOrders.filter(o => o.status === 'pending').length,
    approved:   activeOrders.filter(o => o.status === 'approved').length,
    dispatched: activeOrders.filter(o => o.status === 'dispatched').length,
  }), [activeOrders])

  /* Filtered list */
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let list = activeOrders.filter(o => {
      const ms = activeTab === 'all' || o.status === activeTab
      const mq = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) ||
        o.shop.toLowerCase().includes(q) || o.salesman.toLowerCase().includes(q)
      return ms && mq
    })
    if (sort === 'newest')   list = [...list].reverse()
    else if (sort === 'oldest') { /* keep original */ }
    else if (sort === 'amount-h') list = [...list].sort((a, b) => orderTotal(b) - orderTotal(a))
    else if (sort === 'amount-l') list = [...list].sort((a, b) => orderTotal(a) - orderTotal(b))
    return list
  }, [activeOrders, activeTab, search, sort])

  /* Handlers */
  const handleEditSave = async (updated) => {
    if (updated._fromSalesman) {
      updateSalesmanOrder(updated.id, updated)
      if (viewOrder?.id === updated.id) setViewOrder(updated)
    } else {
      try {
        await updateOrder({ id: updated.id, ...updated }).unwrap()
        if (viewOrder?.id === updated.id) setViewOrder(updated)
      } catch (err) {
        console.error('Failed to update order:', err)
        alert(err?.data?.message || 'Order update karne mein error aaya.')
      }
    }
  }

  const handleChangeStatus = async (id, newStatus) => {
    const o = orders.find(x => x.id === id)
    if (!o) return
    if (!window.confirm(`Change order ${o.id} to "${STATUS_LABELS[newStatus]}"?`)) return
    
    if (o._fromSalesman) {
      updateSalesmanOrder(id, { status: newStatus })
      if (viewOrder?.id === id) setViewOrder(prev => ({ ...prev, status: newStatus }))
    } else {
      try {
        await updateOrder({ id, status: newStatus }).unwrap()
        if (viewOrder?.id === id) setViewOrder(prev => ({ ...prev, status: newStatus }))
      } catch (err) {
        console.error('Failed to update status:', err)
        alert(err?.data?.message || 'Status change karne mein error aaya.')
      }
    }
  }

  const handleDelete = async (id) => {
    const o = orders.find(x => x.id === id)
    if (!o) return
    if (!window.confirm(`Order ${o.id} permanently delete karna chahte hain? Yeh wapas nahi aayega.`)) return
    
    if (o._fromSalesman) {
      deleteSalesmanOrder(id)
      if (viewOrder?.id === id) setViewOrder(null)
    } else {
      try {
        await deleteOrder(id).unwrap()
        if (viewOrder?.id === id) setViewOrder(null)
      } catch (err) {
        console.error('Failed to delete order:', err)
        alert(err?.data?.message || 'Order delete karne mein error aaya.')
      }
    }
  }

  const handlePlaceOrder = async (data) => {
    try {
      await createOrder(data).unwrap()
    } catch (err) {
      console.error('Failed to place order:', err)
      alert(err?.data?.message || 'Order place karne mein error aaya.')
    }
  }

  const buildInvoiceHTML = (order) => {
    const bizInfo = (() => { try { return JSON.parse(localStorage.getItem('wholesale_biz') || '{}') } catch { return {} } })()
    const invInfo  = (() => { try { return JSON.parse(localStorage.getItem('wholesale_inv') || '{}') } catch { return {} } })()
    const bizName    = bizInfo.name      || 'WholesalePro'
    const ownerName  = bizInfo.ownerName || ''
    const ownerPhone = bizInfo.ownerPhone|| '03246770536'
    const bizPhone   = bizInfo.phone     || '+92-42-1234567'
    const bizEmail   = bizInfo.email     || ''
    const bizAddress = bizInfo.address   || 'Wholesale Distribution Center'
    const taxRate    = parseFloat(invInfo.tax) || 0
    const footerNote = invInfo.footer    || 'Thank you for your business. Goods once sold will not be returned.'
    // Generate invoice number from order index
    // Use order's actual ID directly (already has prefix from settings)
    const invNum = order.id || '—'
    const total = orderTotal(order)
    const taxAmt = taxRate > 0 ? Math.round(total * taxRate / 100) : 0
    const grandTotal = total + taxAmt
    const advAmt = order.payment === 'Udaar' ? (order.advance || 0) : 0
    const baki = Math.max(0, grandTotal - advAmt)
    const rowsHTML = order.products.map((p, i) => `
      <tr>
        <td class="c">${i + 1}</td>
        <td>${p.name}</td>
        <td class="c">${p.qty}</td>
        <td class="c">${p.ctn || 0}</td>
        <td class="r">Rs ${p.price.toLocaleString('en-PK')}</td>
        <td class="r bold">Rs ${(p.qty * p.price).toLocaleString('en-PK')}</td>
      </tr>`).join('')

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Invoice ${order.id}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#e8e8e8;color:#111;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:24px 10px}
  .page{background:#fff;width:100%;max-width:760px;border:1px solid #ccc;box-shadow:0 2px 16px rgba(0,0,0,.12)}

  /* ── Header ── */
  .header{padding:24px 32px 20px;border-bottom:2px solid #111;display:flex;justify-content:space-between;align-items:flex-start}
  .company-name{font-size:24px;font-weight:900;color:#111;letter-spacing:-.3px;line-height:1.1}
  .company-detail{font-size:12px;color:#333;margin-top:5px;line-height:1.7}
  .inv-block{text-align:right}
  .inv-label{font-size:28px;font-weight:900;color:#111;letter-spacing:3px;line-height:1}
  .inv-no{font-size:14px;font-weight:700;color:#111;margin-top:5px}
  .inv-date{font-size:12px;color:#333;margin-top:3px}

  /* ── From / To ── */
  .from-to{display:flex;border-bottom:1px solid #ccc}
  .from-to > div{flex:1;padding:18px 32px}
  .from-to > div:first-child{border-right:1px solid #ccc}
  .ft-section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#111;border-bottom:1px solid #111;padding-bottom:4px;margin-bottom:10px}
  .ft-row{font-size:12.5px;color:#111;margin-bottom:5px;display:flex;gap:6px}
  .ft-key{font-weight:700;color:#111;min-width:110px;flex-shrink:0}
  .ft-val{color:#111}

  /* ── Udaar info ── */


  /* ── Table ── */
  .tbl-wrap{padding:20px 32px}
  .tbl-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#111;margin-bottom:10px}
  table{width:100%;border-collapse:collapse;font-size:13px;color:#111}
  thead tr{background:#111}
  thead th{padding:10px 12px;text-align:left;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
  thead th.c{text-align:center}
  thead th.r{text-align:right}
  tbody tr{border-bottom:1px solid #ddd}
  tbody tr:nth-child(even){background:#f7f7f7}
  td{padding:10px 12px;color:#111;vertical-align:middle}
  td.c{text-align:center}
  td.r{text-align:right}
  td.bold{font-weight:700}

  /* ── Totals ── */
  .totals{padding:0 32px 20px;display:flex;justify-content:flex-end}
  .totals-box{width:270px;border:1px solid #ccc}
  .tot-row{display:flex;justify-content:space-between;padding:8px 13px;font-size:13px;color:#111;border-bottom:1px solid #ddd}
  .tot-row:last-child{border-bottom:none;background:#111;color:#fff}
  .tot-row:last-child span{color:#fff;font-weight:800;font-size:14px}
  .tot-lbl{color:#444;font-size:12.5px}
  .tot-row:last-child .tot-lbl{color:#ddd;font-weight:500}
  .udaar-due{background:#1e293b !important;color:#fff !important}
  .udaar-due span{color:#fff !important;font-weight:800 !important;font-size:14px}
  .udaar-due .tot-lbl{color:#fff !important;font-weight:600}

  /* ── Footer ── */
  .footer{border-top:2px solid #111;padding:14px 32px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
  .footer-msg{font-size:12px;color:#111}
  .footer-right{text-align:right;font-size:11px;color:#333}
  .footer-right strong{color:#111}

  @media print{
    body{background:#fff;padding:0}
    .page{box-shadow:none;border:none;max-width:100%}
    .no-print{display:none!important}
    thead tr{background:#111 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .tot-row:last-child{background:#111 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  }
  @media(max-width:520px){
    .header{flex-direction:column;gap:12px;padding:18px 18px 14px}
    .inv-block{text-align:left}
    .from-to{flex-direction:column}
    .from-to > div:first-child{border-right:none;border-bottom:1px solid #ccc}
    .from-to > div{padding:14px 18px}
    .tbl-wrap{padding:14px 10px}
    table{font-size:11px}
    td,thead th{padding:7px 7px}
    .totals{padding:0 10px 16px}
    .totals-box{width:100%}
    .footer{padding:12px 18px}
  }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="company-name">${bizName}</div>
      <div class="company-detail">
        ${ownerName ? `Owner: ${ownerName}<br>` : ''}Phone: ${bizPhone}<br>
        ${bizEmail ? `Email: ${bizEmail}` : ''}
      </div>
    </div>
    <div class="inv-block">
      <div class="inv-label">INVOICE</div>
      <div class="inv-no">Invoice No: ${invNum}</div>
      <div class="inv-date">Date: ${order.date}</div>
      <div class="inv-date">Time: ${order.time}</div>
    </div>
  </div>

  <!-- FROM / TO -->
  <div class="from-to">
    <div>
      <div class="ft-section-label">Invoice From</div>
      <div class="ft-row"><span class="ft-key">Company Name:</span><span class="ft-val">${bizName}</span></div>
      ${ownerName ? `<div class="ft-row"><span class="ft-key">Owner:</span><span class="ft-val">${ownerName}</span></div>` : ''}
      <div class="ft-row"><span class="ft-key">Phone:</span><span class="ft-val">${bizPhone}</span></div>

      <div class="ft-row"><span class="ft-key">Address:</span><span class="ft-val">${bizAddress}</span></div>
      ${order.salesman ? `<div class="ft-row"><span class="ft-key">Salesman:</span><span class="ft-val">${order.salesman}</span></div>` : ''}
    </div>
    <div>
      <div class="ft-section-label">Invoice To</div>
      <div class="ft-row"><span class="ft-key">Customer Name:</span><span class="ft-val">${order.customer}</span></div>
      <div class="ft-row"><span class="ft-key">Shop Name:</span><span class="ft-val">${order.shop}</span></div>
      ${order.phone ? `<div class="ft-row"><span class="ft-key">Phone Number:</span><span class="ft-val">${order.phone}</span></div>` : ''}
      <div class="ft-row"><span class="ft-key">Payment:</span><span class="ft-val" style="font-weight:700">${order.payment}</span></div>
    </div>
  </div>
  

  <!-- ITEMS TABLE -->
  <div class="tbl-wrap">
    <div class="tbl-title">Order Items</div>
    <table>
      <thead>
        <tr>
          <th style="width:36px">#</th>
          <th>Item Name</th>
          <th class="c" style="width:55px">Qty</th>
          <th class="c" style="width:55px">CTN</th>
          <th class="r" style="width:110px">Unit Price</th>
          <th class="r" style="width:115px">Total Price</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
      </tbody>
    </table>
  </div>

  <!-- TOTALS -->
  <div class="totals">
    <div class="totals-box">

      <div class="tot-row"><span class="tot-lbl">Subtotal</span><span>Rs ${total.toLocaleString('en-PK')}</span></div>
      ${taxRate > 0 ? `<div class="tot-row"><span class="tot-lbl">Tax (${taxRate}%)</span><span>Rs ${taxAmt.toLocaleString('en-PK')}</span></div>` : ''}
      <div class="tot-row"><span class="tot-lbl">Grand Total</span><span>Rs ${grandTotal.toLocaleString('en-PK')}</span></div>
      ${order.payment === 'Udaar' && advAmt > 0 ? `
      <div class="tot-row"><span class="tot-lbl">Advance Paid</span><span>Rs ${advAmt.toLocaleString('en-PK')}</span></div>
      <div class="tot-row udaar-due"><span class="tot-lbl">Total Udaar</span><span>Rs ${baki.toLocaleString('en-PK')}</span></div>` : ''}
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-msg">${footerNote}</div>
    <div class="footer-right">
      Software by <strong>TechRiwaayat Company</strong><br>
      ${ownerPhone}
    </div>
  </div>

</div>
<!-- Print button -->
<div class="no-print" style="text-align:center;margin-top:20px;padding-bottom:24px">
  <button onclick="window.print()" style="background:#111;color:#fff;border:none;padding:12px 36px;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.5px">
    Print Invoice
  </button>
</div>
</body></html>`
  }

  const handlePrint = (order) => {
    const html = buildInvoiceHTML(order)
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;'
    document.body.appendChild(iframe)
    iframe.contentDocument.open()
    iframe.contentDocument.write(html)
    iframe.contentDocument.close()
    iframe.contentWindow.focus()
    setTimeout(() => {
      iframe.contentWindow.print()
      setTimeout(() => document.body.removeChild(iframe), 1000)
    }, 300)
  }

  const tabs = [
    { key: 'all',       label: 'All', icon: 'border-all' },
    { key: 'pending',   label: 'Pending',    icon: 'clock' },
    { key: 'approved',  label: 'Approved',   icon: 'circle-check' },
    { key: 'dispatched',label: 'Dispatched', icon: 'truck' },
  ]

  const tabLabel = activeTab === 'all' ? 'All Orders' : STATUS_LABELS[activeTab]

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '22px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-cart-shopping" style={{ color: '#0ea5e9' }} />
            Order Management
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Today ke daily orders — complete/cancel orders Invoice History mein jayenge</div>
        </div>
        <button onClick={() => setShowNew(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 10px rgba(14,165,233,.3)', transition: 'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#0284c7'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0ea5e9'; e.currentTarget.style.transform = '' }}
        >
          <i className="fa-solid fa-plus" /> New Order
        </button>
      </div>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }} className="om-tabs">
        {tabs.map(({ key, label, icon }) => {
          const isActive = activeTab === key
          const sc = STATUS_COLORS[key]
          const countStyle = isActive
            ? { background: 'rgba(255,255,255,.25)', color: '#fff' }
            : key === 'all'
              ? { background: '#f5f7fa', color: '#94a3b8' }
              : sc.count
          return (
            <div key={key} onClick={() => setActiveTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 16px', borderRadius: '10px',
                border: `1.5px solid ${isActive ? '#0ea5e9' : '#e2e8f0'}`,
                background: isActive ? '#0ea5e9' : '#fff',
                cursor: 'pointer', transition: 'all .18s',
                fontSize: '13px', fontWeight: 600,
                color: isActive ? '#fff' : '#64748b',
                boxShadow: isActive ? '0 2px 10px rgba(14,165,233,.25)' : '0 1px 3px rgba(0,0,0,.07)',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.color = '#0ea5e9'; e.currentTarget.style.background = '#f0f9ff' } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#fff' } }}
            >
              <i className={`fa-solid fa-${icon}`} />
              {label}
              <span style={{ padding: '1px 7px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, ...countStyle }}>
                {counts[key]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Search Row */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
          <input
            type="text" placeholder="Search by order ID, customer, shop or salesman..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #e2e8f0', borderRadius: '9px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', background: '#fff', color: '#1e293b', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}
            onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,.07)' }}
          />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ padding: '9px 13px', border: '1px solid #e2e8f0', borderRadius: '9px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', color: '#1e293b', background: '#fff', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,.07)', cursor: 'pointer' }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount-h">Amount: High–Low</option>
          <option value="amount-l">Amount: Low–High</option>
        </select>
      </div>

      {/* Results Label */}
      <div style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '14px', fontWeight: 500 }}>
        Showing <strong style={{ color: '#1e293b' }}>{filtered.length}</strong> {tabLabel.toLowerCase()}{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Orders Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <i className="fa-solid fa-cart-shopping" style={{ fontSize: '48px', marginBottom: '14px', display: 'block', opacity: .3 }} />
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>No orders found</div>
          <div style={{ fontSize: '13px' }}>Try a different filter or search term</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(330px,1fr))', gap: '16px' }} className="om-grid">
          {filtered.map(o => (
            <OrderCard key={o.id} order={o}
              onView={setViewOrder}
              onPrint={handlePrint}
              onChangeStatus={handleChangeStatus}
              onDelete={handleDelete}
              onEdit={setEditOrder}
            />
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '20px 0 4px', color: '#94a3b8', fontSize: '12px' }}>
        WholesalePro Management System © 2026
      </div>

      {/* Modals */}
      <ViewModal order={viewOrder} onClose={() => setViewOrder(null)} onPrint={handlePrint} />
      <NewOrderModal isOpen={showNew} onClose={() => setShowNew(false)} onPlace={handlePlaceOrder} products={products} />
      <EditOrderModal isOpen={!!editOrder} order={editOrder} onClose={() => setEditOrder(null)} onSave={handleEditSave} products={products} />

      <style>{`
        @media(max-width:768px){
          .om-grid{grid-template-columns:1fr !important;}
          .om-tabs { flex-wrap: nowrap !important; }
          .om-tabs > div { flex-shrink: 0; padding: 7px 12px !important; font-size: 12px !important; }
        }
        @media(max-width:480px){
          .om-tabs > div > span:first-of-type { display: none; }
        }
      `}</style>
    </div>
  )
}
