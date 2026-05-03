import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { INITIAL_PRODUCTS } from '../dashboard/ProductManagement'
import { INITIAL_SHOPS } from '../dashboard/ShopsManagement'

const fmtOrderId = id => {
  if (!id) return '—'
  return id
}
const fmt = n => 'Rs ' + Number(n).toLocaleString('en-PK')
const EDIT_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

function timeLeft(createdAt) {
  const diff = EDIT_WINDOW_MS - (Date.now() - createdAt)
  if (diff <= 0) return null
  const m = Math.floor(diff / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* ─── Edit Order Modal ─── */
function EditModal({ order, onClose, onSave }) {
  const [cart, setCart] = useState(
    Object.fromEntries(order.products.map(p => [p.id, p.qty]))
  )
  const [payment, setPayment] = useState(order.payment)
  const [advance, setAdvance] = useState(order.advance || '')
  const [searchP, setSearchP] = useState('')
  const [selCat, setSelCat] = useState('All')

  const products = INITIAL_PRODUCTS
  const categories = ['All', ...Array.from(new Set(products.map(p => p.cat)))]
  const total = products.reduce((s, p) => s + (cart[p.id] || 0) * p.selling, 0)
  const advAmt = payment === 'Udaar' ? (Number(advance) || 0) : 0
  const baki = Math.max(0, total - advAmt)
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0)

  const filteredProds = products.filter(p => {
    const matchCat = selCat === 'All' || p.cat === selCat
    const matchSearch = !searchP.trim() || p.name.toLowerCase().includes(searchP.toLowerCase())
    return matchCat && matchSearch && (p.stock > 0 || cart[p.id])
  })

  function setQty(pid, val) {
    const p = products.find(x => x.id === pid)
    const n = Math.min(Math.max(0, parseInt(val) || 0), p.stock)
    setCart(prev => { const next = { ...prev }; if (n === 0) delete next[pid]; else next[pid] = n; return next })
  }

  function handleSave() {
    const updated = {
      ...order,
      products: products.filter(p => cart[p.id]).map(p => ({ id: p.id, name: p.name, qty: cart[p.id], price: p.selling, ctn: p.ctn || 0 })),
      total, payment, advance: advAmt, baki,
    }
    onSave(updated)
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      backdropFilter: 'blur(4px)', zIndex: 2000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto',
    }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '600px', boxShadow: '0 24px 64px rgba(0,0,0,.18)', margin: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '18px', color: '#1e293b' }}>
            <i className="fa-solid fa-pen-to-square" style={{ color: '#6366f1', marginRight: '8px' }} />
            Order Edit — {order.shopName}
          </h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#64748b', fontSize: '14px' }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Search + Category filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '12px' }} />
            <input value={searchP} onChange={e => setSearchP(e.target.value)} placeholder="Search products..."
              style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <select value={selCat} onChange={e => setSelCat(e.target.value)}
            style={{ padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', outline: 'none', background: '#fff', cursor: 'pointer' }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Products */}
        <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
          {filteredProds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>No products found</div>
          ) : filteredProds.map(p => {
            const qty = cart[p.id] || 0
            return (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f1f5f9', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.cat} · {fmt(p.selling)} · Stock: {p.stock}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <button onClick={() => setQty(p.id, qty - 1)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: qty > 0 ? '#fee2e2' : '#f1f5f9', color: qty > 0 ? '#dc2626' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 700 }}>−</button>
                  <input type="number" value={qty || ''} onChange={e => setQty(p.id, e.target.value)} placeholder="0"
                    style={{ width: '42px', textAlign: 'center', border: '1.5px solid #e2e8f0', borderRadius: '7px', padding: '4px', fontWeight: 700, fontSize: '13px', outline: 'none' }} />
                  <button onClick={() => setQty(p.id, qty + 1)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#e0f2fe', color: '#0ea5e9', border: 'none', cursor: 'pointer', fontWeight: 700 }}>+</button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Payment */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>PAYMENT TYPE</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['Paid', 'Udaar'].map(t => (
              <label key={t} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '9px', borderRadius: '9px', border: `2px solid ${payment === t ? '#0ea5e9' : '#e2e8f0'}`, background: payment === t ? '#e0f2fe' : '#fff', cursor: 'pointer' }}>
                <input type="radio" value={t} checked={payment === t} onChange={() => { setPayment(t); setAdvance('') }} style={{ display: 'none' }} />
                <span style={{ fontWeight: 700, color: payment === t ? '#0ea5e9' : '#64748b' }}>{t}</span>
              </label>
            ))}
          </div>
          {payment === 'Udaar' && (
            <input type="number" min={0} max={total} value={advance} onChange={e => setAdvance(e.target.value)}
              placeholder="Advance amount (Rs)"
              style={{ marginTop: '10px', width: '100%', padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '13px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} />
          )}
        </div>

        {/* Total */}
        <div style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,.85)', fontWeight: 600 }}>Grand Total</span>
          <span style={{ color: '#fff', fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '18px' }}>{fmt(total)}</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '9px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={cartCount === 0} style={{ flex: 2, padding: '10px', borderRadius: '9px', background: cartCount > 0 ? '#0ea5e9' : '#e2e8f0', color: cartCount > 0 ? '#fff' : '#94a3b8', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            <i className="fa-solid fa-paper-plane" style={{ marginRight: '7px' }} /> Save & Resend
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Order Card ─── */
function OrderCard({ order, onEdit, onDelete }) {
  const [timer, setTimer] = useState(() => timeLeft(order.createdAt))
  const [autoSent, setAutoSent] = useState(false)

  useEffect(() => {
    const iv = setInterval(() => {
      const t = timeLeft(order.createdAt)
      setTimer(t)
      if (!t) {
        clearInterval(iv)
        // Auto-send: mark as confirmed when timer expires
        if (!autoSent) {
          setAutoSent(true)
        }
      }
    }, 1000)
    return () => clearInterval(iv)
  }, [order.createdAt])

  const canEdit = !!timer

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px',
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.07)',
      transition: 'all .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.07)' }}
    >
      <div style={{ height: '4px', background: order.payment === 'Paid' ? '#10b981' : '#f59e0b' }} />
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '15px', color: '#1e293b' }}>{order.shopName}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              <i className="fa-solid fa-hashtag" style={{ marginRight: '3px' }} />{fmtOrderId(order.id)}
              &nbsp;·&nbsp;<i className="fa-regular fa-calendar" style={{ marginRight: '4px' }} />{order.date} · {order.time}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: order.payment === 'Paid' ? '#dcfce7' : '#fef9c3', color: order.payment === 'Paid' ? '#16a34a' : '#b45309' }}>
              {order.payment}
            </span>
            {/* Delete button */}
            <button
              onClick={() => onDelete(order.id)}
              title="Delete order"
              style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
            >
              <i className="fa-solid fa-trash" />
            </button>
          </div>
        </div>

        {/* Products mini list */}
        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
          {order.products.slice(0, 3).map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', padding: '2px 0' }}>
              <span>{p.name}</span>
              <span style={{ fontWeight: 600 }}>×{p.qty}</span>
            </div>
          ))}
          {order.products.length > 3 && (
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>+{order.products.length - 3} more items</div>
          )}
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            {order.payment === 'Udaar' && order.baki > 0 ? (
              <>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Advance: {fmt(order.advance)}</span>
                <span style={{ margin: '0 6px', color: '#e2e8f0' }}>|</span>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Balance Due: {fmt(order.baki)}</span>
              </>
            ) : null}
          </div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '17px', color: '#0ea5e9' }}>{fmt(order.total)}</div>
        </div>

        {/* Edit / Timer / Auto-sent */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {canEdit ? (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                <i className="fa-solid fa-clock" /> Edit window: {timer}
              </span>
              <button onClick={() => onEdit(order)} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px',
                background: '#ede9fe', color: '#6d28d9', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
              }}>
                <i className="fa-solid fa-pen-to-square" /> Edit & Resend
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                <i className="fa-solid fa-lock" style={{ marginRight: '5px' }} /> Edit window expired
              </span>
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '99px', background: '#dcfce7', color: '#16a34a', fontWeight: 700 }}>
                <i className="fa-solid fa-paper-plane" style={{ marginRight: '4px' }} /> Auto-Sent
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SalesmanHistory() {
  const { user } = useOutletContext() || {}
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('salesman_orders') || '[]') } catch { return [] }
  })
  const [editOrder, setEditOrder] = useState(null)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const myOrders = orders.filter(o => o.salesmanEmail === user?.email)

  const filtered = myOrders.filter(o => {
    const q = search.toLowerCase()
    return !q || o.shopName.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
  })

  function handleSave(updated) {
    const newOrders = orders.map(o => o.id === updated.id ? updated : o)
    setOrders(newOrders)
    localStorage.setItem('salesman_orders', JSON.stringify(newOrders))
    setEditOrder(null)
  }

  function handleDelete(id) {
    setDeleteConfirm(id)
  }

  function confirmDelete() {
    const newOrders = orders.filter(o => o.id !== deleteConfirm)
    setOrders(newOrders)
    localStorage.setItem('salesman_orders', JSON.stringify(newOrders))
    setDeleteConfirm(null)
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '22px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ color: '#0ea5e9' }} /> Order History
        </div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Your orders — editable within 5 minutes, auto-sent after timer expires</div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '360px' }}>
        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by shop name or order ID..."
          style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <i className="fa-solid fa-box-open" style={{ fontSize: '40px', marginBottom: '14px', display: 'block' }} />
          {myOrders.length === 0 ? 'No orders yet.' : 'No results found.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '14px' }}>
          {[...filtered].reverse().map(o => (
            <OrderCard key={o.id} order={o} onEdit={setEditOrder} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {editOrder && <EditModal order={editOrder} onClose={() => setEditOrder(null)} onSave={handleSave} />}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '360px', boxShadow: '0 24px 64px rgba(0,0,0,.2)', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#dc2626', margin: '0 auto 16px' }}>
              <i className="fa-solid fa-trash" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b', marginBottom: '8px' }}>Order Delete Karo?</h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Ye order permanently delete ho jayega. Ye wapas nahi aa sakta.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '11px', borderRadius: '9px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '11px', borderRadius: '9px', background: '#dc2626', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
