import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { INITIAL_ORDERS } from './OrderManagement'
import { buildInvoiceHTML } from './InvoiceSystem'

const fmt = n => '₨' + (Number(n) || 0).toLocaleString('en-PK')
const orderTotal = o => (o.products || []).reduce((s, p) => s + p.qty * p.price, 0)

function parseDate(str) {
  if (!str) return new Date(0)
  try {
    // Handle "DD Mon YYYY" like "01 Mar 2026"
    const m = str.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/)
    if (m) return new Date(`${m[2]} ${m[1]} ${m[3]}`)
    return new Date(str)
  } catch { return new Date(0) }
}
function daysDiff(dateStr) {
  const diff = new Date() - parseDate(dateStr)
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const STATUS_META = {
  completed: { bg: '#dcfce7', color: '#16a34a', icon: 'check-double', strip: '#10b981', label: 'Completed' },
  cancelled:  { bg: '#fee2e2', color: '#dc2626', icon: 'xmark',       strip: '#ef4444', label: 'Cancelled'  },
}

function HistoryCard({ order, onPrint }) {
  const total  = orderTotal(order)
  const advAmt = order.payment === 'Udaar' ? (order.advance || 0) : 0
  const baki   = Math.max(0, total - advAmt)
  const sm     = STATUS_META[order.status] || { bg: '#f1f5f9', color: '#64748b', icon: 'circle', strip: '#94a3b8', label: order.status }
  const days   = daysDiff(order.date)
  const isComp = order.status === 'completed'

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px',
      overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)', transition: 'all .22s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,.1)'; e.currentTarget.style.borderColor = '#c7d2fe' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)'; e.currentTarget.style.borderColor = '#e2e8f0' }}
    >
      <div style={{ height: '5px', background: sm.strip }} />
      <div style={{ padding: '16px 18px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: sm.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`fa-solid fa-${sm.icon}`} style={{ color: sm.color, fontSize: '16px' }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '15px', color: '#1e293b' }}>
                {order.id}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {order.date} · {order.time}
                {days === 0 && <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', padding: '0px 5px', fontWeight: 700, fontSize: '10px' }}>Today</span>}
                {days === 1 && <span style={{ color: '#94a3b8', fontSize: '10px' }}>Yesterday</span>}
                {days > 1  && <span style={{ color: '#94a3b8', fontSize: '10px' }}>{days}d ago</span>}
              </div>
            </div>
          </div>
          <span style={{ padding: '4px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: sm.bg, color: sm.color, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            <i className={`fa-solid fa-${sm.icon}`} style={{ fontSize: '10px' }} />
            {sm.label}
          </span>
        </div>

        {/* Info grid */}
        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: 'user',      label: 'Customer', val: order.customer },
              { icon: 'store',     label: 'Shop',     val: order.shop },
              { icon: 'user-tie',  label: 'Salesman', val: order.salesman || '—' },
              { icon: 'boxes-stacked', label: 'Items', val: `${order.products.length} item${order.products.length !== 1 ? 's' : ''}` },
            ].map(({ icon, label, val }) => (
              <div key={label}>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '1px' }}>
                  <i className={`fa-solid fa-${icon}`} style={{ marginRight: '3px' }} />{label}
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Amount row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '10px 13px', borderRadius: '10px', background: isComp ? '#f0fdf4' : '#fff5f5', border: `1.5px solid ${isComp ? '#bbf7d0' : '#fecaca'}` }}>
          <div>
            {order.payment === 'Udaar' ? (
              <div style={{ fontSize: '12px', lineHeight: 1.7 }}>
                <div><span style={{ color: '#16a34a', fontWeight: 700 }}><i className="fa-solid fa-circle-check" style={{ marginRight: '3px' }} />Adv: {fmt(advAmt)}</span></div>
                <div><span style={{ color: '#dc2626', fontWeight: 700 }}><i className="fa-solid fa-clock" style={{ marginRight: '3px' }} />Due: {fmt(baki)}</span></div>
              </div>
            ) : (
              <span style={{ fontSize: '12px', background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: '4px' }} />Paid
              </span>
            )}
          </div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '20px', color: '#1e293b' }}>{fmt(total)}</div>
        </div>

        {/* Print button */}
        <button onClick={() => onPrint(order)} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          padding: '10px', borderRadius: '10px', border: 'none',
          background: isComp
            ? 'linear-gradient(135deg,#10b981,#059669)'
            : 'linear-gradient(135deg,#f87171,#dc2626)',
          color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
          boxShadow: isComp ? '0 3px 12px rgba(16,185,129,.3)' : '0 3px 12px rgba(220,38,38,.25)',
          transition: 'all .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = '' }}
        >
          <i className="fa-solid fa-print" /> Print Invoice
        </button>
      </div>
    </div>
  )
}

function StatBox({ icon, label, value, color, bg }) {
  return (
    <div style={{
      background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px',
      padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '15px',
      boxShadow: '0 2px 8px rgba(0,0,0,.06)', transition: 'all .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)' }}
    >
      <div style={{ width: '50px', height: '50px', borderRadius: '13px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color, flexShrink: 0 }}>
        <i className={`fa-solid fa-${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '24px', color: '#1e293b', lineHeight: 1.1, marginTop: '3px' }}>{value}</div>
      </div>
    </div>
  )
}

export default function InvoiceHistory() {
  const ctx = useOutletContext() || {}
  const orders = ctx.sharedOrders ?? INITIAL_ORDERS

  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [dayFilter, setDayFilter]       = useState('all')

  // Only completed + cancelled
  const historyOrders = useMemo(
    () => orders.filter(o => o.status === 'completed' || o.status === 'cancelled'),
    [orders]
  )

  // Overall stats from ALL history (not affected by search/filter)
  const totalCompleted   = historyOrders.filter(o => o.status === 'completed').length
  const totalCancelled   = historyOrders.filter(o => o.status === 'cancelled').length
  const totalHistRevenue = historyOrders.filter(o => o.status === 'completed').reduce((s, o) => s + orderTotal(o), 0)

  const filtered = useMemo(() => {
    const q    = search.toLowerCase()
    const days = parseInt(dayFilter)
    return [...historyOrders]
      .filter(o => {
        const ms = filterStatus  === 'all' || o.status  === filterStatus
        const mp = filterPayment === 'all' || o.payment === filterPayment
        const mq = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.shop.toLowerCase().includes(q)
        const md = dayFilter === 'all' || daysDiff(o.date) <= days
        return ms && mp && mq && md
      })
      .reverse()
  }, [historyOrders, search, filterStatus, filterPayment, dayFilter])

  const handlePrint = (order) => {
    const html = buildInvoiceHTML(order)
    const blob = new Blob([html], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  const selStyle = {
    padding: '9px 13px', border: '1.5px solid #e2e8f0', borderRadius: '10px',
    fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', color: '#1e293b',
    background: '#fff', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,.06)', cursor: 'pointer',
  }

  const DAY_PILLS = [
    { val: 'all', label: 'All Time' },
    { val: '0',   label: 'Today' },
    { val: '7',   label: '7 Days' },
    { val: '30',  label: '30 Days' },
  ]

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{
        background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
        borderRadius: '18px', padding: '24px 28px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
        boxShadow: '0 4px 20px rgba(99,102,241,.3)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ color: '#fff', fontSize: '20px' }} />
            </div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '24px', color: '#fff' }}>
              Invoice History
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.8)', paddingLeft: '56px' }}>
            History of completed and cancelled orders
          </div>
        </div>

        {/* Day filter pills in header */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {DAY_PILLS.map(d => (
            <button key={d.val} onClick={() => setDayFilter(d.val)} style={{
              padding: '8px 16px', borderRadius: '10px',
              border: `2px solid ${dayFilter === d.val ? '#fff' : 'rgba(255,255,255,.35)'}`,
              background: dayFilter === d.val ? '#fff' : 'transparent',
              color: dayFilter === d.val ? '#6366f1' : '#fff',
              fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'all .15s',
            }}>{d.label}</button>
          ))}
        </div>
      </div>

      {/* ── Stats (always from all history, not filtered) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: '14px', marginBottom: '24px' }}>
        <StatBox icon="check-double"          label="Completed"      value={totalCompleted}                color="#16a34a" bg="#dcfce7" />
        <StatBox icon="xmark"                 label="Cancelled"      value={totalCancelled}                color="#dc2626" bg="#fee2e2" />
        <StatBox icon="circle-dollar-to-slot" label="Total Revenue"  value={fmt(totalHistRevenue)}         color="#6d28d9" bg="#ede9fe" />
        <StatBox icon="clock-rotate-left"     label="Total History"  value={historyOrders.length}          color="#0ea5e9" bg="#e0f2fe" />
      </div>

      {/* ── Filters ── */}
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
            <input
              type="text" placeholder="Search by Invoice ID, customer or shop..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', background: '#f8fafc', color: '#1e293b', outline: 'none' }}
            />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selStyle}>
            <option value="all">Completed + Cancelled</option>
            <option value="completed">Completed Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>
          <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} style={selStyle}>
            <option value="all">All Payment</option>
            <option value="Paid">Paid</option>
            <option value="Udaar">Udaar</option>
          </select>
        </div>
      </div>

      <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className="fa-solid fa-filter" style={{ color: '#6366f1', fontSize: '11px' }} />
        <strong style={{ color: '#1e293b' }}>{filtered.length}</strong> record{filtered.length !== 1 ? 's' : ''} found ({dayFilter === 'all' ? 'all time' : dayFilter + ' days'})
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1.5px dashed #e2e8f0' }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '52px', marginBottom: '16px', display: 'block', opacity: .25 }} />
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>No history found</div>
          <div style={{ fontSize: '13px' }}>Try changing filter or time range</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: '16px' }} className="ih-grid">
          {filtered.map(o => (
            <HistoryCard key={o.id} order={o} onPrint={handlePrint} />
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '24px 0 6px', color: '#94a3b8', fontSize: '12px' }}>
        WholesalePro Management System © 2026
      </div>
      <style>{`@media(max-width:768px){.ih-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  )
}
