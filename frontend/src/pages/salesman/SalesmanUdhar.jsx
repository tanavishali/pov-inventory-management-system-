import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useUpdateOrderMutation } from '../../store/slices/ordersApiSlice'

const fmt = n => 'Rs ' + Number(n).toLocaleString('en-PK')

// Format order ID
function fmtOrderId(id) {
  if (!id) return '—'
  return id
}

/* ─── Wasuli Modal ─── */
function WasuliModal({ order, onClose, onSave }) {
  const [amount, setAmount] = useState('')
  const remaining = order.baki || 0

  function handleSave() {
    const amt = Math.min(Number(amount) || 0, remaining)
    if (amt <= 0) return
    const newBaki = Math.max(0, remaining - amt)
    const newAdvance = (order.advance || 0) + amt
    const updated = { ...order, advance: newAdvance, baki: newBaki, payment: newBaki === 0 ? 'Paid' : 'Udaar' }
    onSave(updated)
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      backdropFilter: 'blur(4px)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '18px', color: '#1e293b', marginBottom: '6px' }}>
          <i className="fa-solid fa-hand-holding-dollar" style={{ color: '#10b981', marginRight: '8px' }} />
          Collect Payment
        </h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>{order.shopName}</p>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '20px' }}>Invoice: {fmtOrderId(order.id)}</p>

        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#64748b', fontSize: '13px' }}>Total Amount</span>
            <span style={{ fontWeight: 700, fontSize: '13px' }}>{fmt(order.total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#64748b', fontSize: '13px' }}>Paid So Far</span>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#10b981' }}>{fmt(order.advance || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
            <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '13px' }}>Balance Due</span>
            <span style={{ fontWeight: 800, fontSize: '15px', color: '#ef4444' }}>{fmt(remaining)}</span>
          </div>
        </div>

        <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px', display: 'block' }}>Amount to collect (Rs)</label>
        <input
          type="number" min={1} max={remaining}
          value={amount} onChange={e => setAmount(e.target.value)}
          placeholder={`Max: Rs ${remaining.toLocaleString()}`}
          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '14px', fontWeight: 600, outline: 'none', marginBottom: '6px', boxSizing: 'border-box' }}
          autoFocus
        />
        {Number(amount) > 0 && Number(amount) <= remaining && (
          <div style={{ fontSize: '12px', color: '#6366f1', marginBottom: '14px', fontWeight: 600 }}>
            Remaining after payment: {fmt(Math.max(0, remaining - Number(amount)))}
            {Number(amount) >= remaining && ' (Fully cleared!)'}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '9px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={!amount || Number(amount) <= 0}
            style={{ flex: 2, padding: '11px', borderRadius: '9px', background: Number(amount) > 0 ? '#10b981' : '#e2e8f0', color: Number(amount) > 0 ? '#fff' : '#94a3b8', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            <i className="fa-solid fa-check" style={{ marginRight: '7px' }} /> Confirm Collection
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Invoice Detail Card (used in detail page) ─── */
function InvoiceDetailCard({ order, index, onWasuli }) {
  const fullyPaid = order.baki === 0 || order.payment === 'Paid'
  const paidPct = order.total > 0 ? Math.round(((order.advance || 0) / order.total) * 100) : 0

  return (
    <div style={{
      background: '#fff',
      border: `1.5px solid ${fullyPaid ? '#86efac' : '#fca5a5'}`,
      borderRadius: '14px', overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,.07)', marginBottom: '12px',
    }}>
      <div style={{ height: '3px', background: fullyPaid ? '#10b981' : 'linear-gradient(90deg,#ef4444,#f97316)' }} />

      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ minWidth: '32px', height: '32px', borderRadius: '8px', background: fullyPaid ? '#dcfce7' : '#fee2e2', color: fullyPaid ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{fmtOrderId(order.id)}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
            <i className="fa-regular fa-calendar" style={{ marginRight: '4px' }} />{order.date || ''}
            {order.time && <><i className="fa-regular fa-clock" style={{ margin: '0 4px 0 8px' }} />{order.time}</>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: fullyPaid ? '#10b981' : '#ef4444' }}>{fullyPaid ? 'Saaf ✓' : fmt(order.baki || 0)}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total: {fmt(order.total)}</div>
        </div>
      </div>

      {order.products && order.products.length > 0 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 70px 80px', padding: '6px 16px', background: '#f8fafc', fontSize: '10px', fontWeight: 700, color: '#94a3b8', gap: '8px' }}>
            <span>Product</span><span style={{ textAlign: 'center' }}>Qty</span><span style={{ textAlign: 'right' }}>Rate</span><span style={{ textAlign: 'right' }}>Amount</span>
          </div>
          {order.products.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 70px 80px', padding: '8px 16px', gap: '8px', alignItems: 'center', borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{p.name}</span>
              <span style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', fontWeight: 600 }}>×{p.qty}</span>
              <span style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>{fmt(p.price || p.rate || 0)}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0ea5e9', textAlign: 'right' }}>{fmt((p.price || p.rate || 0) * (p.qty || 1))}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', margin: '12px 16px' }}>
        {[
          { label: 'Total',        val: fmt(order.total),        color: '#1e293b', bg: '#f1f5f9' },
          { label: 'Advance Diya', val: fmt(order.advance || 0), color: '#10b981', bg: '#dcfce7' },
          { label: 'Baki',         val: fmt(order.baki || 0),    color: '#ef4444', bg: '#fee2e2' },
        ].map(({ label, val, color, bg }) => (
          <div key={label} style={{ background: bg, borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: '13px', color }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ margin: '0 16px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
          <span>Payment Progress</span>
          <span style={{ fontWeight: 700, color: paidPct === 100 ? '#10b981' : '#0ea5e9' }}>{paidPct}%</span>
        </div>
        <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${paidPct}%`, background: paidPct === 100 ? '#10b981' : 'linear-gradient(90deg,#0ea5e9,#6366f1)', borderRadius: '999px', transition: 'width .4s' }} />
        </div>
      </div>

      <div style={{ padding: '0 16px 14px' }}>
        {!fullyPaid ? (
          <button onClick={() => onWasuli(order)} style={{ width: '100%', padding: '10px', borderRadius: '9px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
            <i className="fa-solid fa-hand-holding-dollar" /> Collect Payment
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px', borderRadius: '9px', background: '#dcfce7', color: '#16a34a', fontWeight: 700, fontSize: '13px' }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }} /> Fully Paid
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Shop Detail Page ─── */
function ShopDetailPage({ shopName, invoices, onBack, onWasuli }) {
  const totalBaki    = invoices.reduce((s, o) => s + (o.baki || 0), 0)
  const totalAdvance = invoices.reduce((s, o) => s + (o.advance || 0), 0)
  const totalAmount  = invoices.reduce((s, o) => s + (o.total || 0), 0)
  const pendingCount = invoices.filter(o => (o.baki || 0) > 0).length
  const fullyPaid    = totalBaki === 0

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#f5f7fa', border: '1.5px solid #e2e8f0', color: '#475569', padding: '9px 16px', borderRadius: '10px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.color = '#0ea5e9' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569' }}
        >
          <i className="fa-solid fa-arrow-left" /> Back to List
        </button>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '20px', color: '#1e293b' }}>
            <i className="fa-solid fa-store" style={{ color: '#0ea5e9', marginRight: '8px' }} />{shopName}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            {pendingCount > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {pendingCount} pending</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Kul Raqam',     val: fmt(totalAmount),  color: '#1e293b', bg: '#f1f5f9', icon: 'receipt' },
          { label: 'Total Advance', val: fmt(totalAdvance), color: '#10b981', bg: '#dcfce7', icon: 'circle-check' },
          { label: 'Total Baki',    val: fullyPaid ? 'Saaf ✓' : fmt(totalBaki), color: fullyPaid ? '#10b981' : '#ef4444', bg: fullyPaid ? '#dcfce7' : '#fee2e2', icon: fullyPaid ? 'circle-check' : 'circle-exclamation' },
          { label: 'Invoices',      val: invoices.length,   color: '#6366f1', bg: '#ede9fe', icon: 'file-invoice' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: s.color, marginBottom: '7px' }}>
              <i className={`fa-solid fa-${s.icon}`} />
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{s.label}</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '18px', color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ background: fullyPaid ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'linear-gradient(135deg,#fff5f5,#ffe4e6)', border: `1.5px solid ${fullyPaid ? '#bbf7d0' : '#fecaca'}`, borderRadius: '14px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>Total Balance Due</div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '26px', fontWeight: 900, color: fullyPaid ? '#10b981' : '#ef4444' }}>
            {fullyPaid ? 'All Cleared ✓' : fmt(totalBaki)}
          </div>
        </div>
        <i className={`fa-solid fa-${fullyPaid ? 'circle-check' : 'triangle-exclamation'}`} style={{ fontSize: '28px', color: fullyPaid ? '#10b981' : '#ef4444', opacity: .7 }} />
      </div>

      <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '15px', color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="fa-solid fa-file-invoice" style={{ color: '#0ea5e9' }} />
        Invoice History ({invoices.length})
      </div>

      {[...invoices].reverse().map((order, i) => (
        <InvoiceDetailCard key={order.id} order={order} index={invoices.length - 1 - i} onWasuli={onWasuli} />
      ))}
    </div>
  )
}

/* ─── Shop List Card (compact, navigates to detail) ─── */
function ShopListCard({ shopName, invoices, onClick }) {
  const totalBaki    = invoices.reduce((s, o) => s + (o.baki || 0), 0)
  const totalAdvance = invoices.reduce((s, o) => s + (o.advance || 0), 0)
  const totalAmount  = invoices.reduce((s, o) => s + (o.total || 0), 0)
  const pendingCount = invoices.filter(o => (o.baki || 0) > 0).length
  const fullyPaid    = totalBaki === 0

  return (
    <div onClick={onClick} style={{ background: '#fff', border: `2px solid ${fullyPaid ? '#86efac' : '#fca5a5'}`, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.07)', cursor: 'pointer', transition: 'all .2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.07)' }}
    >
      <div style={{ height: '4px', background: fullyPaid ? '#10b981' : 'linear-gradient(90deg,#ef4444,#f97316)' }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: fullyPaid ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: fullyPaid ? '#16a34a' : '#dc2626', flexShrink: 0 }}>
            <i className="fa-solid fa-store" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '16px', color: '#1e293b' }}>{shopName}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
              {pendingCount > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}> · {pendingCount} pending</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '17px', color: fullyPaid ? '#10b981' : '#ef4444' }}>
              {fullyPaid ? 'Saaf ✓' : fmt(totalBaki)}
            </div>
            {!fullyPaid && <div style={{ fontSize: '11px', color: '#94a3b8' }}>baki</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
          {[
            { label: 'Kul Raqam', val: fmt(totalAmount),  color: '#1e293b', bg: '#f1f5f9' },
            { label: 'Received',  val: fmt(totalAdvance), color: '#10b981', bg: '#dcfce7' },
            { label: 'Balance',   val: fullyPaid ? 'Saaf' : fmt(totalBaki), color: fullyPaid ? '#10b981' : '#ef4444', bg: fullyPaid ? '#dcfce7' : '#fee2e2' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '2px' }}>{label}</div>
              <div style={{ fontWeight: 800, fontSize: '13px', color }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
            <i className="fa-solid fa-clock" style={{ marginRight: '4px' }} />
            {pendingCount > 0 ? `${pendingCount} payment(s) pending` : 'All cleared'}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Invoices dekhein <i className="fa-solid fa-arrow-right" style={{ fontSize: '10px' }} />
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function SalesmanUdhar() {
  const { user } = useOutletContext() || {}
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('salesman_orders') || '[]') } catch { return [] }
  })
  const [wasuliOrder, setWasuliOrder]   = useState(null)
  const [filter, setFilter]             = useState('baki')
  const [search, setSearch]             = useState('')
  const [selectedShop, setSelectedShop] = useState(null)

  const [updateOrder] = useUpdateOrderMutation()

  const myOrders = orders.filter(o => o.salesmanEmail === user?.email && o.payment === 'Udaar')

  const totalBaki    = myOrders.reduce((s, o) => s + (o.baki || 0), 0)
  const totalPaid    = myOrders.reduce((s, o) => s + (o.advance || 0), 0)
  const pendingCount = myOrders.filter(o => (o.baki || 0) > 0).length

  const shopMap = {}
  myOrders.forEach(o => {
    if (!shopMap[o.shopName]) shopMap[o.shopName] = []
    shopMap[o.shopName].push(o)
  })

  const filteredShops = Object.entries(shopMap).filter(([shopName, invoices]) => {
    const q = search.trim().toLowerCase()
    if (q && !shopName.toLowerCase().includes(q) && !invoices.some(o => o.id.toLowerCase().includes(q))) return false
    if (filter === 'baki') return invoices.some(o => (o.baki || 0) > 0)
    if (filter === 'saaf') return invoices.every(o => (o.baki || 0) === 0)
    return true
  })

  async function handleWasuliSave(updated) {
    // Update the local (offline) mirror first
    const newOrders = orders.map(o => o.id === updated.id ? updated : o)
    setOrders(newOrders)
    localStorage.setItem('salesman_orders', JSON.stringify(newOrders))
    setWasuliOrder(null)

    // Keep the canonical backend order's payment/advance in sync (best-effort)
    if (updated.backendId) {
      try {
        await updateOrder({
          id: updated.backendId,
          payment: updated.payment,
          advance: updated.advance || 0,
        }).unwrap()
        toast.success('Payment recorded.')
      } catch (err) {
        toast.warn('Saved on this device, but server sync failed — please retry when online.')
      }
    } else {
      toast.success('Payment recorded.')
    }
  }

  /* ── Detail Page ── */
  if (selectedShop) {
    const liveInvoices = orders.filter(o => o.salesmanEmail === user?.email && o.payment === 'Udaar' && o.shopName === selectedShop)
    return (
      <>
        <ShopDetailPage shopName={selectedShop} invoices={liveInvoices} onBack={() => setSelectedShop(null)} onWasuli={setWasuliOrder} />
        {wasuliOrder && <WasuliModal order={wasuliOrder} onClose={() => setWasuliOrder(null)} onSave={handleWasuliSave} />}
      </>
    )
  }

  /* ── List Page ── */
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '22px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-hand-holding-dollar" style={{ color: '#0ea5e9' }} /> Udhar Management
        </div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Har shop ki alag alag invoices ke saath credit track karo</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Baki',      val: fmt(totalBaki),              color: '#ef4444', bg: '#fee2e2', icon: 'circle-exclamation' },
          { label: 'Total Collected', val: fmt(totalPaid),              color: '#10b981', bg: '#dcfce7', icon: 'circle-check' },
          { label: 'Pending Orders',  val: pendingCount,                color: '#f59e0b', bg: '#fef9c3', icon: 'clock' },
          { label: 'Total Shops',     val: Object.keys(shopMap).length, color: '#6366f1', bg: '#ede9fe', icon: 'store' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', color: s.color, marginBottom: '8px' }}>
              <i className={`fa-solid fa-${s.icon}`} />
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{s.label}</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '20px', color: s.color, lineHeight: 1.2 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {[
          { key: 'baki', label: 'Pending',   icon: 'clock' },
          { key: 'saaf', label: 'Cleared',   icon: 'circle-check' },
          { key: 'all',  label: 'All Shops', icon: 'store' },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{ padding: '8px 18px', borderRadius: '9px', border: `1.5px solid ${filter === t.key ? '#0ea5e9' : '#e2e8f0'}`, background: filter === t.key ? '#0ea5e9' : '#fff', color: filter === t.key ? '#fff' : '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <i className={`fa-solid fa-${t.icon}`} />{t.label}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '360px' }}>
        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Shop name ya invoice ID se search..."
          style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {filteredShops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <i className="fa-solid fa-store" style={{ fontSize: '40px', marginBottom: '14px', display: 'block' }} />
          {myOrders.length === 0 ? 'Koi udhar order nahi hai abhi tak.' : 'Is filter mein koi shop nahi mili.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredShops.map(([shopName, invoices]) => (
            <ShopListCard key={shopName} shopName={shopName} invoices={invoices} onClick={() => setSelectedShop(shopName)} />
          ))}
        </div>
      )}

      {wasuliOrder && <WasuliModal order={wasuliOrder} onClose={() => setWasuliOrder(null)} onSave={handleWasuliSave} />}
    </div>
  )
}
