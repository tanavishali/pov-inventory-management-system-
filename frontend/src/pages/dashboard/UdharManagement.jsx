import { useState, useMemo, useCallback, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { buildInvoiceHTML } from './InvoiceSystem'

/* ══════════════════════════════════════
   INITIAL DATA
══════════════════════════════════════ */
const INIT_SHOPS = [
  { id: 1, shopName: 'Hassan Electronics', ownerName: 'Ali Hassan', phone: '+92-300-1234567' },
  { id: 2, shopName: 'Sana General Store',  ownerName: 'Sara Ahmed',  phone: '+92-301-2345678' },
]

const PRODUCTS_LIST = [
  { name: 'Rice (50kg)',      price: 4500 },
  { name: 'Sugar (50kg)',     price: 5200 },
  { name: 'Flour (20kg)',     price: 1800 },
  { name: 'Cooking Oil (5L)', price: 1250 },
  { name: 'Tea (1kg)',        price: 850  },
]

const INIT_LEDGER = [
  { shopId: 1, entries: [
    { id: 101, date: '2024-02-01', type: 'udhar',   desc: 'Order #1001', products: [{ name: 'Rice (50kg)', qty: 2, price: 4500 }], total: 9000, advance: 1000, udharAmt: 8000 },
    { id: 102, date: '2024-02-10', type: 'payment', desc: 'Cash received', products: [], total: 0, advance: 0, udharAmt: -3000 },
  ]},
  { shopId: 2, entries: [
    { id: 201, date: '2024-02-05', type: 'udhar', desc: 'Order #1002', products: [{ name: 'Flour (20kg)', qty: 2, price: 1800 }, { name: 'Tea (1kg)', qty: 5, price: 850 }], total: 7850, advance: 500, udharAmt: 7350 },
  ]},
]

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
const fmt = n => '₨ ' + Number(n || 0).toLocaleString('en-PK')
const todayStr = () => new Date().toISOString().split('T')[0]

function getLedger(ledger, shopId) {
  return ledger.find(l => l.shopId === shopId)?.entries || []
}
function getBalance(ledger, shopId) {
  return getLedger(ledger, shopId).reduce((s, e) => s + e.udharAmt, 0)
}
// Total Given = full invoice total (total field), not just the udharAmt remainder
function getTotalGiven(ledger, shopId) {
  return getLedger(ledger, shopId).filter(e => e.type === 'udhar').reduce((s, e) => s + (e.total || e.udharAmt || 0), 0)
}
// Total Received = advance paid at order time + all subsequent payment entries
function getTotalReceived(ledger, shopId) {
  const advPaid = getLedger(ledger, shopId).filter(e => e.type === 'udhar').reduce((s, e) => s + (e.advance || 0), 0)
  const payments = getLedger(ledger, shopId).filter(e => e.type === 'payment').reduce((s, e) => s + Math.abs(e.udharAmt), 0)
  return advPaid + payments
}
// Keep these for backward compat
function getTotalUdhar(ledger, shopId) { return getTotalGiven(ledger, shopId) }
function getTotalPayment(ledger, shopId) { return getTotalReceived(ledger, shopId) }

/* ══════════════════════════════════════
   REUSABLE UI
══════════════════════════════════════ */
const WARN    = '#f59e0b'
const SUCCESS = '#10b981'
const DANGER  = '#ef4444'
const ACCENT  = '#0ea5e9'
const ACCENT2 = '#6366f1'

const inputSt = {
  width: '100%', padding: '10px 13px',
  border: '1.5px solid #e2e8f0', borderRadius: '9px',
  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px',
  color: '#1e293b', background: '#f5f7fa', outline: 'none', transition: 'border-color .2s',
}
const focIn  = e => { e.target.style.borderColor = WARN;    e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,.1)' }
const focOut = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none' }

function Btn({ children, onClick, bg, color, shadow, hoverBg, style = {}, ...rest }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      border: 'none', borderRadius: '9px', cursor: 'pointer',
      fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
      transition: 'all .2s', background: bg, color, boxShadow: shadow || 'none',
      ...style,
    }}
      onMouseEnter={e => { if (hoverBg) e.currentTarget.style.background = hoverBg; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { if (hoverBg) e.currentTarget.style.background = bg; e.currentTarget.style.transform = '' }}
      {...rest}
    >{children}</button>
  )
}

function MLabel({ icon, children }) {
  return (
    <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
      <i className={`fa-solid fa-${icon}`} />{children}
    </label>
  )
}

function Modal({ show, onClose, maxWidth = 520, children }) {
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
        width: '100%', maxWidth, margin: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,.18)',
        animation: 'udharMIn .22s ease',
      }}>
        <style>{`@keyframes udharMIn{from{opacity:0;transform:scale(.95) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);}}`}</style>
        {children}
      </div>
    </div>
  )
}

function ModalHeader({ title, sub, onClose }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '19px' }}>{title}</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px', padding: '4px', borderRadius: '6px' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5f7fa'; e.currentTarget.style.color = '#1e293b' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8' }}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      {sub && <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '18px' }}>{sub}</div>}
    </>
  )
}

/* ══════════════════════════════════════
   STAT CARD
══════════════════════════════════════ */
function StatCard({ borderColor, iconBg, iconColor, icon, bgIcon, bgIconColor, label, value, sub }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderTop: `3px solid ${borderColor}`, borderRadius: '14px',
      padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)',
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
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '22px', fontWeight: 900, lineHeight: 1, letterSpacing: '-.5px', color: borderColor }}>{value}</div>
      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '3px' }}>{sub}</div>
    </div>
  )
}

/* ══════════════════════════════════════
   CUSTOMER CARD (List View)
══════════════════════════════════════ */
function CustomerCard({ shop, ledger, onView, onPay, onUdhar, onEdit, onPrint }) {
  const baki    = getBalance(ledger, shop.id)
  const diya    = getTotalGiven(ledger, shop.id)
  const wapas   = getTotalReceived(ledger, shop.id)
  const entries = getLedger(ledger, shop.id).length
  const cleared = baki <= 0
  const initial = shop.shopName.charAt(0).toUpperCase()

  return (
    <div onClick={() => onView(shop.id)} style={{
      background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px',
      overflow: 'hidden', cursor: 'pointer', transition: 'all .22s',
      boxShadow: '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.1)'; e.currentTarget.style.borderColor = '#cbd5e1' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)'; e.currentTarget.style.borderColor = '#e2e8f0' }}
    >
      {/* Color Strip */}
      <div style={{ height: '4px', background: cleared ? SUCCESS : DANGER }} />

      <div style={{ padding: '16px' }}>
        {/* Head */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg,#fef3c7,#fee2e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif", fontSize: '19px', fontWeight: 900, color: WARN, flexShrink: 0 }}>
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '15px', color: '#1e293b', marginBottom: '2px' }}>{shop.shopName}</div>
            <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <i className="fa-solid fa-user" style={{ fontSize: '10px' }} />{shop.ownerName}
              {shop.phone && <><span style={{ opacity: .4 }}>&nbsp;·&nbsp;</span>
                <a href={`tel:${shop.phone}`} onClick={e => e.stopPropagation()} style={{ color: ACCENT, display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px' }}>
                  <i className="fa-solid fa-phone" style={{ fontSize: '10px' }} />{shop.phone}
                </a></>}
            </div>
          </div>
          <div style={{ padding: '4px 11px', borderRadius: '999px', fontFamily: "'Outfit',sans-serif", fontSize: '13px', fontWeight: 900, flexShrink: 0, background: cleared ? '#dcfce7' : '#fee2e2', color: cleared ? '#16a34a' : DANGER }}>
            {cleared ? 'Cleared' : fmt(Math.max(0, baki))}
          </div>
        </div>

        {/* Mini Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {[
            { val: fmt(diya),              color: WARN,    lbl: 'Total Given'  },
            { val: fmt(wapas),             color: SUCCESS, lbl: 'Received'     },
            { val: fmt(Math.max(0, baki)), color: DANGER,  lbl: 'Balance Due'  },
          ].map(({ val, color, lbl }) => (
            <div key={lbl} style={{ background: '#f5f7fa', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '13px', fontWeight: 800, marginBottom: '2px', color }}>{val}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{lbl}</div>
            </div>
          ))}
        </div>

        <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 0' }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { label: 'View',  icon: 'eye',            bg: '#fef3c7', color: '#b45309', hoverBg: '#fde68a',  fn: () => onView(shop.id)  },
            { label: 'Pay',   icon: 'money-bill-wave', bg: '#d1fae5', color: '#065f46', hoverBg: '#a7f3d0', fn: () => onPay(shop.id)   },
            { label: 'Udhar', icon: 'plus',            bg: '#ede9fe', color: '#5b21b6', hoverBg: '#ddd6fe', fn: () => onUdhar(shop.id) },
            { label: 'Edit',  icon: 'pen-to-square',   bg: '#e0f2fe', color: '#0369a1', hoverBg: '#bae6fd', fn: () => onEdit(shop.id)  },
            { label: 'Invoice', icon: 'print',         bg: '#f0fdf4', color: '#15803d', hoverBg: '#bbf7d0', fn: () => onPrint(shop)   },
          ].map(({ label, icon, bg, color, hoverBg, fn }) => (
            <button key={label} onClick={e => { e.stopPropagation(); fn() }} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '7px 12px', borderRadius: '8px', border: 'none',
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', background: bg, color, transition: 'all .18s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = bg; e.currentTarget.style.transform = '' }}
            >
              <i className={`fa-solid fa-${icon}`} style={{ fontSize: '11px' }} /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   ENTRY CARD (Detail Ledger)
══════════════════════════════════════ */
function EntryCard({ entry, onEdit, onDelete }) {
  const isPay = entry.type === 'payment'
  return (
    <div style={{
      background: '#fff', border: `1.5px solid #e2e8f0`,
      borderLeft: `4px solid ${isPay ? SUCCESS : DANGER}`,
      borderRadius: '13px', overflow: 'hidden', marginBottom: '10px',
      boxShadow: '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)',
      transition: 'all .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,.09)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)'}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, background: isPay ? '#d1fae5' : '#fee2e2', color: isPay ? SUCCESS : DANGER }}>
          <i className={`fa-solid fa-${isPay ? 'money-bill-wave' : 'hand-holding-dollar'}`} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>{entry.desc || '—'}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="fa-regular fa-calendar" style={{ fontSize: '10px' }} />{entry.date}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '17px', fontWeight: 900, color: isPay ? SUCCESS : DANGER }}>
            {isPay ? '+ ' : '- '}{fmt(Math.abs(entry.udharAmt))}
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{isPay ? 'Payment' : 'Udhar'}</div>
        </div>
      </div>

      {/* Products */}
      {!isPay && entry.products && entry.products.length > 0 && (
        <div style={{ borderTop: '1px solid #e2e8f0' }}>
          {entry.products.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 16px', borderBottom: i < entry.products.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>Qty: {p.qty} &nbsp;×&nbsp; ₨ {Number(p.price).toLocaleString('en-PK')}</div>
              </div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '13px', fontWeight: 800, color: WARN }}>₨ {Number(p.qty * p.price).toLocaleString('en-PK')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 16px', background: '#f5f7fa', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {!isPay && entry.total > 0 ? (
            <>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><i className="fa-solid fa-receipt" />Bill: {fmt(entry.total)}</span>
              <span style={{ fontSize: '12px', color: SUCCESS, display: 'flex', alignItems: 'center', gap: '4px' }}><i className="fa-solid fa-circle-minus" />Advance: {fmt(entry.advance)}</span>
              <span style={{ fontSize: '12px', color: DANGER, display: 'flex', alignItems: 'center', gap: '4px' }}><i className="fa-solid fa-triangle-exclamation" />Due: {fmt(entry.udharAmt)}</span>
            </>
          ) : (
            <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><i className="fa-solid fa-check-circle" />Payment Recorded</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {!isPay && (
            <button onClick={() => onEdit(entry.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '7px', border: 'none', background: '#e0f2fe', color: '#0369a1', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              onMouseEnter={e => e.currentTarget.style.background = '#bae6fd'}
              onMouseLeave={e => e.currentTarget.style.background = '#e0f2fe'}
            >
              <i className="fa-solid fa-pen-to-square" /> Edit
            </button>
          )}
          <button onClick={() => onDelete(entry.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '7px', border: 'none', background: '#fee2e2', color: DANGER, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
            onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
          >
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   PRODUCT ROW (inside Udhar modal)
══════════════════════════════════════ */
function ProductRow({ row, onChange, onDelete }) {
  const handleSelect = e => {
    const selected = PRODUCTS_LIST.find(p => p.name === e.target.value)
    onChange({ ...row, name: e.target.value, price: selected ? selected.price : row.price })
  }
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
      <select value={row.name} onChange={handleSelect} style={{ ...inputSt, flex: 2, minWidth: 0, padding: '9px 10px' }} onFocus={focIn} onBlur={focOut}>
        <option value="">-- Product --</option>
        {PRODUCTS_LIST.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
      </select>
      <input type="number" placeholder="Qty" min="1" value={row.qty}
        onChange={e => onChange({ ...row, qty: e.target.value })}
        style={{ ...inputSt, width: '72px', padding: '9px 10px' }} onFocus={focIn} onBlur={focOut}
      />
      <input type="number" placeholder="Price" min="0" value={row.price}
        onChange={e => onChange({ ...row, price: e.target.value })}
        style={{ ...inputSt, width: '96px', padding: '9px 10px', background: 'rgba(245,158,11,.07)', borderColor: 'rgba(245,158,11,.3)', color: WARN, fontWeight: 700 }}
        onFocus={e => { e.target.style.borderColor = WARN; e.target.style.background = '#fffbeb'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,.1)' }}
        onBlur={e => { e.target.style.borderColor = 'rgba(245,158,11,.3)'; e.target.style.background = 'rgba(245,158,11,.07)'; e.target.style.boxShadow = 'none' }}
      />
      <button onClick={onDelete} style={{ width: '36px', height: '40px', flexShrink: 0, border: 'none', background: '#fee2e2', color: DANGER, borderRadius: '9px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
        onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
      >
        <i className="fa-solid fa-xmark" />
      </button>
    </div>
  )
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function Toast({ msg, show }) {
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      background: '#1e293b', color: '#fff', padding: '12px 18px',
      borderRadius: '12px', fontSize: '13.5px', fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 8px 30px rgba(0,0,0,.2)',
      transform: show ? 'translateY(0)' : 'translateY(80px)',
      opacity: show ? 1 : 0,
      transition: 'all .35s cubic-bezier(.34,1.56,.64,1)',
      zIndex: 9999, pointerEvents: 'none',
    }}>
      <i className="fa-solid fa-circle-check" style={{ color: SUCCESS }} />
      {msg}
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function UdharManagement() {
  const ctx = useOutletContext() || {}
  const sharedOrders = ctx.sharedOrders ?? []

  /* ── State ── */
  const [shops,  setShops]  = useState(INIT_SHOPS)
  const [ledger, setLedger] = useState(INIT_LEDGER)
  const [nextId, setNextId] = useState(300)

  // Sync Udaar orders from admin order panel into ledger
  useEffect(() => {
    const udaarOrders = sharedOrders.filter(o => o.payment === 'Udaar')
    if (udaarOrders.length === 0) return

    setShops(prev => {
      let updated = [...prev]
      udaarOrders.forEach(order => {
        const shopKey = order.shop || order.shopName || ''
        const existing = updated.find(s => s.shopName.toLowerCase() === shopKey.toLowerCase())
        if (!existing && shopKey) {
          updated = [...updated, {
            id: 'ord_' + order.id,
            shopName: shopKey,
            ownerName: order.customer || '',
            phone: order.phone || '',
            _fromOrder: true,
          }]
        }
      })
      return updated
    })

    setLedger(prev => {
      let updated = [...prev]
      udaarOrders.forEach(order => {
        const shopKey = order.shop || order.shopName || ''
        const total = order.products ? order.products.reduce((s,p) => s + p.qty * p.price, 0) : (order.total || 0)
        const advAmt = order.advance || 0
        const baki = Math.max(0, total - advAmt)
        if (baki <= 0) return

        // Find or create ledger for this shop
        const shopRef = INIT_SHOPS.find(s => s.shopName.toLowerCase() === shopKey.toLowerCase()) ||
          { id: 'ord_' + order.id }
        const shopId = shopRef.id

        const entryId = 'sync_' + order.id
        const existingLedger = updated.find(l => l.shopId === shopId)
        const alreadyHas = existingLedger?.entries?.some(e => e.id === entryId)
        if (alreadyHas) return

        const newEntry = {
          id: entryId,
          date: order.date ? order.date.replace(/(\d+) (\w+) (\d+)/, '$3-$2-$1').replace(/Jan/,'01').replace(/Feb/,'02').replace(/Mar/,'03').replace(/Apr/,'04').replace(/May/,'05').replace(/Jun/,'06').replace(/Jul/,'07').replace(/Aug/,'08').replace(/Sep/,'09').replace(/Oct/,'10').replace(/Nov/,'11').replace(/Dec/,'12') : todayStr(),
          type: 'udhar',
          desc: 'Order ' + order.id + (order.salesman ? ' — ' + order.salesman : ''),
          products: order.products ? order.products.map(p => ({ name: p.name, qty: p.qty, price: p.price })) : [],
          total, advance: advAmt, udharAmt: baki,
        }

        if (existingLedger) {
          updated = updated.map(l => l.shopId === shopId ? { ...l, entries: [...l.entries, newEntry] } : l)
        } else {
          updated = [...updated, { shopId, entries: [newEntry] }]
        }
      })
      return updated
    })
  }, [sharedOrders])

  const [view,   setView]   = useState('list') // 'list' | 'detail'
  const [selId,  setSelId]  = useState(null)   // selected shop id

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('pending')

  // Toast
  const [toast, setToast]   = useState({ show: false, msg: '' })

  // Customer Modal
  const [custModal, setCustModal] = useState(false)
  const [custEdit,  setCustEdit]  = useState(null)
  const [custForm,  setCustForm]  = useState({ shopName: '', ownerName: '', phone: '' })
  const [custErr,   setCustErr]   = useState('')

  // Udhar Modal
  const [udharModal,   setUdharModal]   = useState(false)
  const [udharShopId,  setUdharShopId]  = useState(null)
  const [editEntryId,  setEditEntryId]  = useState(null)
  const [udharForm,    setUdharForm]    = useState({ date: todayStr(), desc: '', advance: '0' })
  const [prodRows,     setProdRows]     = useState([{ name: '', qty: 1, price: '' }])

  // Payment Modal
  const [payModal, setPayModal] = useState(false)
  const [payShopId,setPayShopId]= useState(null)
  const [payForm,  setPayForm]  = useState({ date: todayStr(), amount: '', note: '' })

  /* ── Helpers ── */
  const showToast = useCallback(msg => {
    setToast({ show: true, msg })
    setTimeout(() => setToast({ show: false, msg: '' }), 3000)
  }, [])

  const ensureLedger = useCallback((sId, prev) => {
    if (prev.find(l => l.shopId === sId)) return prev
    return [...prev, { shopId: sId, entries: [] }]
  }, [])

  /* ── SUMMARY TOTALS ── */
  const sumDiya  = shops.reduce((s, sh) => s + getTotalGiven(ledger, sh.id), 0)
  const sumWapas = shops.reduce((s, sh) => s + getTotalReceived(ledger, sh.id), 0)
  const sumBaki  = shops.reduce((s, sh) => s + Math.max(0, getBalance(ledger, sh.id)), 0)

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return shops.filter(sh => {
      if (q && !sh.shopName.toLowerCase().includes(q) && !sh.ownerName.toLowerCase().includes(q)) return false
      const bal = getBalance(ledger, sh.id)
      if (filter === 'pending') return bal > 0
      if (filter === 'cleared') return bal <= 0
      return true
    })
  }, [shops, ledger, search, filter])

  /* ── Detail shop ── */
  const detailShop = selId ? shops.find(s => s.id === selId) : null
  const detailEntries = selId ? [...(getLedger(ledger, selId))].reverse() : []

  /* ══ CUSTOMER HANDLERS ══ */
  function openAddCustomer() {
    setCustEdit(null)
    setCustForm({ shopName: '', ownerName: '', phone: '' })
    setCustErr('')
    setCustModal(true)
  }
  function openEditCustomer(shopId) {
    const sh = shops.find(s => s.id === shopId)
    setCustEdit(shopId)
    setCustForm({ shopName: sh.shopName, ownerName: sh.ownerName, phone: sh.phone || '' })
    setCustErr('')
    setCustModal(true)
  }
  function saveCustomer() {
    const { shopName, ownerName, phone } = custForm
    if (!shopName.trim() || !ownerName.trim()) { setCustErr('Shop name aur owner name zaroor bharo!'); return }
    setCustErr('')
    if (custEdit) {
      setShops(prev => prev.map(s => s.id === custEdit ? { ...s, shopName: shopName.trim(), ownerName: ownerName.trim(), phone: phone.trim() } : s))
      showToast('Customer updated!')
      if (view === 'detail' && selId === custEdit) {
        // refresh detail
      }
    } else {
      const newShop = { id: Date.now(), shopName: shopName.trim(), ownerName: ownerName.trim(), phone: phone.trim() }
      setShops(prev => [...prev, newShop])
      showToast('Customer added!')
    }
    setCustModal(false)
  }
  function deleteCustomer(shopId) {
    const sh = shops.find(s => s.id === shopId)
    if (!confirm(`Delete "${sh?.shopName}" and all their ledger data?`)) return
    setShops(prev => prev.filter(s => s.id !== shopId))
    setLedger(prev => prev.filter(l => l.shopId !== shopId))
    showToast('Customer deleted.')
    setView('list')
  }

  /* ══ UDHAR HANDLERS ══ */
  function openAddUdhar(shopId) {
    setUdharShopId(shopId)
    setEditEntryId(null)
    setUdharForm({ date: todayStr(), desc: '', advance: '0' })
    setProdRows([{ name: '', qty: 1, price: '' }])
    setUdharModal(true)
  }
  function openEditEntry(entryId) {
    const entry = getLedger(ledger, selId).find(e => e.id === entryId)
    if (!entry) return
    setUdharShopId(selId)
    setEditEntryId(entryId)
    setUdharForm({ date: entry.date, desc: entry.desc || '', advance: String(entry.advance || 0) })
    const prods = entry.products && entry.products.length ? entry.products : [{ name: '', qty: 1, price: entry.total || '' }]
    setProdRows(prods.map(p => ({ name: p.name, qty: p.qty, price: String(p.price) })))
    setUdharModal(true)
  }
  function saveUdhar() {
    const sId = udharShopId
    if (!sId) { showToast('Customer select karo!'); return }
    const validProds = prodRows.filter(p => p.name && parseFloat(p.qty) > 0)
    if (!validProds.length) { showToast('Kam az kam ek product add karo!'); return }
    const advance = parseFloat(udharForm.advance) || 0
    const total   = validProds.reduce((s, p) => s + (parseFloat(p.qty) || 0) * (parseFloat(p.price) || 0), 0)
    const udharAmt = Math.max(0, total - advance)
    if (udharAmt === 0) { showToast('Udhar zero nahi ho sakta!'); return }
    const desc = udharForm.desc.trim() || validProds.map(p => p.name).join(', ')
    const products = validProds.map(p => ({ name: p.name, qty: parseFloat(p.qty), price: parseFloat(p.price) || 0 }))

    setLedger(prev => {
      const base = ensureLedger(sId, prev)
      return base.map(l => {
        if (l.shopId !== sId) return l
        if (editEntryId) {
          return { ...l, entries: l.entries.map(e => e.id === editEntryId ? { ...e, date: udharForm.date, desc, products, total, advance, udharAmt } : e) }
        }
        const newId = nextId + 1
        setNextId(newId)
        return { ...l, entries: [...l.entries, { id: newId, date: udharForm.date, type: 'udhar', desc, products, total, advance, udharAmt }] }
      })
    })
    setUdharModal(false)
    showToast('Udhar saved!')
  }

  /* ══ PAYMENT HANDLERS ══ */
  function openPayment(shopId) {
    setPayShopId(shopId)
    setPayForm({ date: todayStr(), amount: '', note: '' })
    setPayModal(true)
  }
  function savePayment() {
    const amount = parseFloat(payForm.amount) || 0
    if (amount <= 0) { showToast('Amount bharo!'); return }
    const note = payForm.note.trim() || 'Payment received'
    setLedger(prev => {
      const base = ensureLedger(payShopId, prev)
      return base.map(l => {
        if (l.shopId !== payShopId) return l
        const newId = nextId + 1
        setNextId(newId)
        return { ...l, entries: [...l.entries, { id: newId, date: payForm.date, type: 'payment', desc: note, products: [], total: 0, advance: 0, udharAmt: -amount }] }
      })
    })
    setPayModal(false)
    showToast('Payment recorded!')
  }

  /* ══ DELETE ENTRY ══ */
  function deleteEntry(entryId) {
    if (!confirm('Delete this entry?')) return
    setLedger(prev => prev.map(l => l.shopId === selId ? { ...l, entries: l.entries.filter(e => e.id !== entryId) } : l))
    showToast('Entry deleted.')
  }

  /* ── Udhar calc ── */
  const udharTotal   = prodRows.reduce((s, p) => s + (parseFloat(p.qty) || 0) * (parseFloat(p.price) || 0), 0)
  const udharAdvance = parseFloat(udharForm.advance) || 0
  const udharRemain  = Math.max(0, udharTotal - udharAdvance)

  // Print Udhar Invoice for a customer
  const printUdharInvoice = (shop) => {
    const bizInfo = (() => { try { return JSON.parse(localStorage.getItem('wholesale_biz') || '{}') } catch { return {} } })()
    const bizName    = bizInfo.name    || 'WholesalePro'
    const bizPhone   = bizInfo.phone   || '03287458137'
    const bizAddress = bizInfo.address || 'Wholesale Distribution Center'

    const bal = Math.max(0, getBalance(ledger, shop.id))
    const given = getTotalGiven(ledger, shop.id)
    const recd = getTotalReceived(ledger, shop.id)
    const entries = getLedger(ledger, shop.id)
    const fmtR = n => 'Rs ' + Number(n).toLocaleString('en-PK')

    const rowsHTML = entries.map((e, i) => {
      const isUdhar = e.type === 'udhar'
      // FIXED: use udharAmt (positive for udhar, negative for payment)
      const amount = Math.abs(e.udharAmt != null ? e.udharAmt
        : e.amount != null ? e.amount
        : (e.products ? e.products.reduce((s,p) => s + (p.qty||1)*(p.price||p.rate||0), 0) : 0))

      // Advance breakdown for udhar entries
      const advancePaid = isUdhar && e.advance > 0 ? e.advance : 0
      const orderTotal  = isUdhar && e.total > 0 ? e.total : (isUdhar ? amount : 0)
      const baqi        = isUdhar ? Math.max(0, orderTotal - advancePaid) : 0

      const advanceRow = isUdhar && advancePaid > 0 ? `
        <tr style="background:#f0fdf4">
          <td class="c" style="color:#aaa;font-size:11px">&nbsp;</td>
          <td style="font-size:11px;color:#555;padding-left:22px">↳ Order Total</td>
          <td class="r" style="font-size:11px;color:#111">${fmtR(orderTotal)}</td>
        </tr>
        <tr style="background:#f0fdf4">
          <td class="c" style="color:#aaa;font-size:11px">&nbsp;</td>
          <td style="font-size:11px;color:#16a34a;padding-left:22px">↳ Advance Paid at Order</td>
          <td class="r" style="font-size:11px;color:#16a34a">- ${fmtR(advancePaid)}</td>
        </tr>
        <tr style="background:#f0fdf4;border-bottom:2px solid #e5e5e5">
          <td class="c" style="color:#aaa;font-size:11px">&nbsp;</td>
          <td style="font-size:11px;font-weight:700;color:#c00;padding-left:22px">↳ Remaining Udhar</td>
          <td class="r" style="font-size:11px;font-weight:700;color:#c00">= ${fmtR(baqi)}</td>
        </tr>` : ''

      return `<tr>
        <td class="c">${i+1}</td>
        <td>${e.date || ''}</td>
        <td>${isUdhar ? (e.note || e.desc || 'Udhar Diya') : (e.note || e.desc || 'Payment Received')}</td>
        <td class="r" style="color:${isUdhar ? '#c00' : '#16a34a'}">${isUdhar ? '- ' + fmtR(amount) : '+ ' + fmtR(amount)}</td>
      </tr>${advanceRow}`
    }).join('')

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Udhar Statement — ${shop.shopName}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#e8e8e8;color:#111;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:24px 10px}
  .page{background:#fff;width:100%;max-width:720px;border:1px solid #ccc;box-shadow:0 2px 16px rgba(0,0,0,.12)}
  .header{padding:22px 30px 18px;border-bottom:2px solid #111;display:flex;justify-content:space-between;align-items:flex-start}
  .company-name{font-size:22px;font-weight:900;color:#111}
  .company-detail{font-size:12px;color:#333;margin-top:5px;line-height:1.6}
  .inv-block{text-align:right}
  .inv-label{font-size:24px;font-weight:900;color:#111;letter-spacing:2px}
  .inv-date{font-size:12px;color:#333;margin-top:4px}
  .customer-section{padding:16px 30px;border-bottom:1px solid #ccc;display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
  .cs-block .cs-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#111;border-bottom:1px solid #111;padding-bottom:3px;margin-bottom:8px}
  .cs-row{font-size:13px;color:#111;margin-bottom:4px}
  .summary{padding:12px 30px;background:#f7f7f7;border-bottom:1px solid #ccc;display:flex;gap:30px;flex-wrap:wrap}
  .sum-item .sum-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#555}
  .sum-item .sum-val{font-size:16px;font-weight:900;margin-top:2px}
  .tbl-wrap{padding:18px 30px}
  .tbl-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#111;margin-bottom:10px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  thead tr{background:#111}
  thead th{padding:9px 12px;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;text-align:left}
  thead th.c{text-align:center}
  thead th.r{text-align:right}
  tbody tr{border-bottom:1px solid #e5e5e5}
  tbody tr:nth-child(even){background:#f9f9f9}
  td{padding:9px 12px;vertical-align:middle}
  td.c{text-align:center}
  td.r{text-align:right;font-weight:700}
  .balance-row{padding:12px 30px 20px;display:flex;justify-content:flex-end}
  .bal-box{width:270px;border:1px solid #ccc}
  .bal-item{display:flex;justify-content:space-between;padding:8px 13px;font-size:13px;border-bottom:1px solid #ddd}
  .bal-item:last-child{border-bottom:none;background:#111;color:#fff;font-weight:800}
  .bal-item:last-child span{color:#fff}
  .bal-lbl{color:#555}
  .footer{border-top:2px solid #111;padding:13px 30px;display:flex;justify-content:space-between;font-size:12px;color:#111}
  @media print{body{background:#fff;padding:0}.page{box-shadow:none;border:none;max-width:100%}.no-print{display:none!important}thead tr{background:#111!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.bal-item:last-child{background:#111!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="company-name">${bizName}</div>
      <div class="company-detail">Wholesale Management System<br>Phone: ${bizPhone}<br>TechRiwaayat Company</div>
    </div>
    <div class="inv-block">
      <div class="inv-label">UDHAR STATEMENT</div>
      <div class="inv-date">Date: ${new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</div>
    </div>
  </div>
  <div class="customer-section">
    <div class="cs-block">
      <div class="cs-label">Customer Details</div>
      <div class="cs-row"><strong>Shop:</strong> ${shop.shopName}</div>
      <div class="cs-row"><strong>Owner:</strong> ${shop.ownerName || '—'}</div>
      ${shop.phone ? `<div class="cs-row"><strong>Phone:</strong> ${shop.phone}</div>` : ''}
      <div class="cs-row"><strong>Address:</strong> ${bizAddress}</div>
    </div>
    <div class="cs-block">
      <div class="cs-label">Statement Summary</div>
      <div class="cs-row"><strong>Total Entries:</strong> ${entries.length}</div>
      <div class="cs-row"><strong>Total Given:</strong> ${fmtR(given)}</div>
      <div class="cs-row"><strong>Total Received:</strong> ${fmtR(recd)}</div>
    </div>
  </div>
  <div class="summary">
    <div class="sum-item"><div class="sum-label">Total Invoice Given</div><div class="sum-val" style="color:#c00">${fmtR(given)}</div></div>
    <div class="sum-item"><div class="sum-label">Total Received (Adv+Pay)</div><div class="sum-val" style="color:#16a34a">${fmtR(recd)}</div></div>
    <div class="sum-item"><div class="sum-label">Balance Due</div><div class="sum-val" style="color:${bal > 0 ? '#c00' : '#16a34a'}">${bal > 0 ? fmtR(bal) : 'Cleared ✓'}</div></div>
  </div>
  <div class="tbl-wrap">
    <div class="tbl-title">Transaction History</div>
    <table>
      <thead><tr><th class="c" style="width:36px">#</th><th>Date</th><th>Description</th><th class="r">Amount</th></tr></thead>
      <tbody>${rowsHTML}</tbody>
    </table>
  </div>
  <div class="balance-row">
    <div class="bal-box">
      <div class="bal-item"><span class="bal-lbl">Total Invoice Given</span><span style="color:#c00;font-weight:700">${fmtR(given)}</span></div>
      <div class="bal-item"><span class="bal-lbl">Total Received (Adv+Pay)</span><span style="color:#16a34a;font-weight:700">${fmtR(recd)}</span></div>
      <div class="bal-item"><span class="bal-lbl">Balance Due</span><span>${bal > 0 ? fmtR(bal) : 'Cleared ✓'}</span></div>
    </div>
  </div>
  <div class="footer">
    <span>Thank you for your continued business.</span>
    <span>Software by <strong>TechRiwaayat Company</strong> · 03287458137</span>
  </div>
</div>
<div class="no-print" style="text-align:center;margin-top:20px;padding-bottom:24px">
  <button onclick="window.print()" style="background:#111;color:#fff;border:none;padding:12px 36px;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.5px">Print Statement</button>
</div>
</body></html>`

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

  const filterBtns = [
    { key: 'all',     label: 'All',     icon: 'border-all' },
    { key: 'pending', label: 'Pending', icon: 'clock',        iconColor: DANGER  },
    { key: 'cleared', label: 'Cleared', icon: 'circle-check', iconColor: SUCCESS },
  ]

  /* ════════════════════════════════════
     DETAIL VIEW
  ════════════════════════════════════ */
  if (view === 'detail' && detailShop) {
    const baki   = getBalance(ledger, selId)
    const diya   = getTotalGiven(ledger, selId)
    const wapas  = getTotalReceived(ledger, selId)
    const cleared = baki <= 0

    return (
      <div>
        {/* Header Card */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <button onClick={() => setView('list')} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#f5f7fa', border: '1.5px solid #e2e8f0', color: '#475569', padding: '8px 16px', borderRadius: '9px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = WARN; e.currentTarget.style.color = WARN }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569' }}
            >
              <i className="fa-solid fa-arrow-left" /> Back to Customers
            </button>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => openEditCustomer(selId)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#e0f2fe', color: '#0369a1', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.background = '#bae6fd'}
                onMouseLeave={e => e.currentTarget.style.background = '#e0f2fe'}
              >
                <i className="fa-solid fa-pen-to-square" /> Edit Customer
              </button>
              <button onClick={() => deleteCustomer(selId)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: DANGER, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
              >
                <i className="fa-solid fa-trash" /> Delete
              </button>
            </div>
          </div>

          {/* Info Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'linear-gradient(135deg,#fef3c7,#fee2e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif", fontSize: '22px', fontWeight: 900, color: WARN, flexShrink: 0 }}>
              {detailShop.shopName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '18px', color: '#1e293b', marginBottom: '4px' }}>{detailShop.shopName}</div>
              <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <i className="fa-solid fa-user" style={{ fontSize: '11px' }} />{detailShop.ownerName}
                {detailShop.phone && <><span>&nbsp;·&nbsp;</span>
                  <a href={`tel:${detailShop.phone}`} style={{ color: ACCENT, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-solid fa-phone" style={{ fontSize: '11px' }} />{detailShop.phone}
                  </a></>}
              </div>
            </div>
          </div>

          {/* Detail Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            {[
              { val: fmt(diya),  color: WARN,   lbl: 'Total Given'  },
              { val: fmt(wapas), color: SUCCESS, lbl: 'Received'     },
              { val: fmt(Math.max(0, baki)), color: DANGER, lbl: 'Balance Due' },
            ].map(({ val, color, lbl }) => (
              <div key={lbl} style={{ background: '#f5f7fa', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '16px', fontWeight: 900, marginBottom: '3px', color }}>{val}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Balance Due Banner */}
        <div style={{
          background: cleared ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'linear-gradient(135deg,#fff5f5,#ffe4e6)',
          border: `1.5px solid ${cleared ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: '14px', padding: '16px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>Total Balance Due</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '26px', fontWeight: 900, color: cleared ? SUCCESS : DANGER }}>
              {cleared ? 'All Cleared ✓' : fmt(Math.max(0, baki))}
            </div>
          </div>
          <i className={`fa-solid fa-${cleared ? 'circle-check' : 'triangle-exclamation'}`} style={{ fontSize: '28px', color: cleared ? SUCCESS : DANGER, opacity: .7 }} />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => openPayment(selId)} style={{
            flex: 1, minWidth: '130px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px 16px', borderRadius: '10px', border: 'none',
            background: SUCCESS, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 2px 10px rgba(16,185,129,.3)', transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = SUCCESS; e.currentTarget.style.transform = '' }}
          >
            <i className="fa-solid fa-money-bill-wave" /> Payment Received
          </button>
          <button onClick={() => openAddUdhar(selId)} style={{
            flex: 1, minWidth: '130px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px 16px', borderRadius: '10px', border: 'none',
            background: WARN, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 2px 10px rgba(245,158,11,.3)', transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d97706'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = WARN; e.currentTarget.style.transform = '' }}
          >
            <i className="fa-solid fa-plus" /> Add Udhar
          </button>
          <button onClick={() => printUdharInvoice(detailShop)} style={{
            minWidth: '130px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px 16px', borderRadius: '10px', border: 'none',
            background: '#1e293b', color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,.2)', transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = '' }}
          >
            <i className="fa-solid fa-print" /> Print Statement
          </button>
        </div>

        {/* Ledger */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-book-open" style={{ color: WARN }} />
            Ledger / Transaction History
          </div>
          <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
            <strong style={{ color: '#1e293b' }}>{detailEntries.length}</strong> entr{detailEntries.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>

        {detailEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <i className="fa-solid fa-book-open" style={{ fontSize: '48px', marginBottom: '14px', display: 'block', opacity: .3 }} />
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: '#64748b' }}>No entries yet</div>
            <div style={{ fontSize: '13px' }}>Add an udhar to start the ledger</div>
          </div>
        ) : detailEntries.map(entry => (
          <EntryCard key={entry.id} entry={entry} onEdit={openEditEntry} onDelete={deleteEntry} />
        ))}

        {/* Edit Customer Modal (in detail view) */}
        <CustomerModal
          show={custModal} onClose={() => setCustModal(false)}
          title={custEdit ? 'Edit Customer' : 'Add New Customer'}
          form={custForm} setForm={setCustForm}
          onSave={saveCustomer} err={custErr}
          isEdit={!!custEdit}
        />

        {/* Udhar Modal */}
        <UdharModal
          show={udharModal} onClose={() => setUdharModal(false)}
          shops={shops} udharShopId={udharShopId} showShopSelect={false}
          form={udharForm} setForm={setUdharForm}
          prodRows={prodRows} setProdRows={setProdRows}
          total={udharTotal} advance={udharAdvance} remain={udharRemain}
          onSave={saveUdhar} isEdit={!!editEntryId}
        />

        {/* Payment Modal */}
        <PaymentModal
          show={payModal} onClose={() => setPayModal(false)}
          baki={payShopId ? Math.max(0, getBalance(ledger, payShopId)) : 0}
          form={payForm} setForm={setPayForm}
          onSave={savePayment}
        />

        <Toast show={toast.show} msg={toast.msg} />
        <div style={{ height: '30px' }} />
      </div>
    )
  }

  /* ════════════════════════════════════
     LIST VIEW
  ════════════════════════════════════ */
  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
            <i className="fa-solid fa-handshake-angle" style={{ color: WARN }} />
            Udhar Management
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Track credit, dues and payment history for all customers</div>
        </div>
        <button onClick={openAddCustomer} style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: WARN, color: '#fff', border: 'none',
          padding: '10px 20px', borderRadius: '10px',
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 2px 10px rgba(245,158,11,.3)', transition: 'all .2s', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#d97706'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = WARN; e.currentTarget.style.transform = '' }}
        >
          <i className="fa-solid fa-user-plus" /> Add Customer
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }} className="ud-stats">
        <StatCard borderColor={DANGER}  iconBg="#fee2e2" iconColor={DANGER}  icon="triangle-exclamation" bgIcon="arrow-trend-up"  bgIconColor={DANGER}  label="Total Due"           value={fmt(sumBaki)}  sub="Outstanding balance" />
        <StatCard borderColor={WARN}    iconBg="#fef3c7" iconColor={WARN}    icon="hand-holding-dollar"  bgIcon="layer-group"     bgIconColor={WARN}    label="Total Given (Udhar)" value={fmt(sumDiya)}  sub="All credit extended" />
        <StatCard borderColor={SUCCESS} iconBg="#d1fae5" iconColor={SUCCESS} icon="money-bill-wave"       bgIcon="circle-check"    bgIconColor={SUCCESS} label="Total Received"      value={fmt(sumWapas)} sub="Payments collected" />
      </div>
      <style>{`@media(max-width:768px){.ud-stats{grid-template-columns:repeat(2,1fr) !important;}}`}</style>

      {/* Toolbar */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
          <input type="text" placeholder="Search by customer name or owner..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #e2e8f0', borderRadius: '9px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', background: '#f5f7fa', color: '#1e293b', outline: 'none' }}
            onFocus={e => { e.target.style.borderColor = WARN; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,.1)'; e.target.style.background = '#fff' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f5f7fa' }}
          />
        </div>
        <button onClick={openAddCustomer} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: WARN, color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '10px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#d97706'}
          onMouseLeave={e => e.currentTarget.style.background = WARN}
        >
          <i className="fa-solid fa-user-plus" /> Add Customer
        </button>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {filterBtns.map(({ key, label, icon, iconColor }) => {
            const isAct = filter === key
            return (
              <button key={key} onClick={() => setFilter(key)} style={{
                padding: '7px 13px', borderRadius: '8px',
                border: `1px solid ${isAct ? WARN : '#e2e8f0'}`,
                background: isAct ? WARN : '#f5f7fa',
                color: isAct ? '#fff' : '#64748b',
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '12.5px',
                fontWeight: isAct ? 600 : 500, cursor: 'pointer', transition: 'all .18s', whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { if (!isAct) { e.currentTarget.style.borderColor = WARN; e.currentTarget.style.color = WARN; e.currentTarget.style.background = '#fffbeb' } }}
                onMouseLeave={e => { if (!isAct) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#f5f7fa' } }}
              >
                <i className={`fa-solid fa-${icon}`} style={{ fontSize: '11px', marginRight: '3px', color: isAct ? '#fff' : iconColor }} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results */}
      <div style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '14px' }}>
        Showing <strong style={{ color: '#1e293b' }}>{filtered.length}</strong> customer{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <i className="fa-solid fa-handshake" style={{ fontSize: '48px', marginBottom: '14px', display: 'block', opacity: .3 }} />
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: '#64748b' }}>No customers found</div>
          <div style={{ fontSize: '13px' }}>Add a customer to get started</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '16px' }}>
          {filtered.map(sh => (
            <CustomerCard
              key={sh.id} shop={sh} ledger={ledger}
              onView={id => { setSelId(id); setView('detail') }}
              onPay={openPayment}
              onUdhar={openAddUdhar}
              onEdit={openEditCustomer}
              onPrint={printUdharInvoice}
            />
          ))}
        </div>
      )}

      {/* ── MODALS ── */}
      <CustomerModal
        show={custModal} onClose={() => setCustModal(false)}
        title={custEdit ? 'Edit Customer' : 'Add New Customer'}
        form={custForm} setForm={setCustForm}
        onSave={saveCustomer} err={custErr} isEdit={!!custEdit}
      />

      <UdharModal
        show={udharModal} onClose={() => setUdharModal(false)}
        shops={shops} udharShopId={udharShopId} showShopSelect={!selId}
        onShopChange={setUdharShopId}
        form={udharForm} setForm={setUdharForm}
        prodRows={prodRows} setProdRows={setProdRows}
        total={udharTotal} advance={udharAdvance} remain={udharRemain}
        onSave={saveUdhar} isEdit={!!editEntryId}
      />

      <PaymentModal
        show={payModal} onClose={() => setPayModal(false)}
        baki={payShopId ? Math.max(0, getBalance(ledger, payShopId)) : 0}
        form={payForm} setForm={setPayForm}
        onSave={savePayment}
      />

      <Toast show={toast.show} msg={toast.msg} />
      <div style={{ height: '30px' }} />
    </div>
  )
}

/* ══════════════════════════════════════
   CUSTOMER MODAL
══════════════════════════════════════ */
function CustomerModal({ show, onClose, title, form, setForm, onSave, err, isEdit }) {
  const sf = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  return (
    <Modal show={show} onClose={onClose} maxWidth={480}>
      <ModalHeader title={title} sub="Enter customer / shop details below" onClose={onClose} />
      {err && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', fontWeight: 600 }}><i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }} />{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ gridColumn: '1/-1' }}>
          <MLabel icon="store">Shop / Customer Name</MLabel>
          <input style={inputSt} placeholder="e.g. Hassan Electronics" value={form.shopName} onChange={sf('shopName')} onFocus={focIn} onBlur={focOut} />
        </div>
        <div>
          <MLabel icon="user">Owner Name</MLabel>
          <input style={inputSt} placeholder="e.g. Ali Hassan" value={form.ownerName} onChange={sf('ownerName')} onFocus={focIn} onBlur={focOut} />
        </div>
        <div>
          <MLabel icon="phone">Phone Number</MLabel>
          <input style={inputSt} type="tel" placeholder="+92-300-1234567" value={form.phone} onChange={sf('phone')} onFocus={focIn} onBlur={focOut} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '9px', marginTop: '20px' }}>
        <button onClick={onSave} style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', background: WARN, color: '#fff', transition: 'all .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#d97706'}
          onMouseLeave={e => e.currentTarget.style.background = WARN}
        >
          <i className={`fa-solid fa-${isEdit ? 'floppy-disk' : 'user-plus'}`} style={{ marginRight: '5px' }} />
          {isEdit ? 'Save Changes' : 'Add Customer'}
        </button>
        <button onClick={onClose} style={{ padding: '11px 18px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.background = '#f5f7fa'}
        >Cancel</button>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════════════
   UDHAR MODAL
══════════════════════════════════════ */
function UdharModal({ show, onClose, shops, udharShopId, showShopSelect, onShopChange, form, setForm, prodRows, setProdRows, total, advance, remain, onSave, isEdit }) {
  const sf = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <Modal show={show} onClose={onClose} maxWidth={520}>
      <ModalHeader title={isEdit ? 'Edit Udhar Entry' : 'Add New Udhar'} sub="Enter sale / credit details below" onClose={onClose} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

        {showShopSelect && (
          <div style={{ gridColumn: '1/-1' }}>
            <MLabel icon="store">Select Customer</MLabel>
            <select value={udharShopId || ''} onChange={e => onShopChange && onShopChange(parseInt(e.target.value))} style={inputSt} onFocus={focIn} onBlur={focOut}>
              <option value="">-- Select Customer --</option>
              {shops.map(s => <option key={s.id} value={s.id}>{s.shopName} ({s.ownerName})</option>)}
            </select>
          </div>
        )}

        <div>
          <MLabel icon="calendar">Date</MLabel>
          <input type="date" style={inputSt} value={form.date} onChange={sf('date')} onFocus={focIn} onBlur={focOut} />
        </div>
        <div>
          <MLabel icon="file-lines">Note (Optional)</MLabel>
          <input style={inputSt} placeholder="e.g. Order #123" value={form.desc} onChange={sf('desc')} onFocus={focIn} onBlur={focOut} />
        </div>

        {/* Products */}
        <div style={{ gridColumn: '1/-1' }}>
          <MLabel icon="boxes-stacked">Products (Name · Qty · Price)</MLabel>
          {prodRows.map((row, i) => (
            <ProductRow key={i} row={row}
              onChange={updated => setProdRows(prev => prev.map((r, ri) => ri === i ? updated : r))}
              onDelete={() => setProdRows(prev => prev.filter((_, ri) => ri !== i))}
            />
          ))}
          <button onClick={() => setProdRows(prev => [...prev, { name: '', qty: 1, price: '' }])} style={{
            width: '100%', padding: '10px', background: 'transparent', border: '1.5px dashed #e2e8f0',
            borderRadius: '9px', color: '#94a3b8', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all .18s', marginTop: '4px',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = WARN; e.currentTarget.style.color = WARN }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <i className="fa-solid fa-plus" /> Add Product
          </button>
        </div>

        {/* Advance */}
        <div style={{ gridColumn: '1/-1' }}>
          <MLabel icon="money-bill">Advance Paid (0 if none)</MLabel>
          <input type="number" style={inputSt} placeholder="0" min="0" value={form.advance} onChange={sf('advance')} onFocus={focIn} onBlur={focOut} />
        </div>

        {/* Calc Box */}
        <div style={{ gridColumn: '1/-1', background: '#f5f7fa', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px' }}>
          {[
            { lbl: 'Total Bill',       icon: 'receipt',                iconColor: '#94a3b8', val: `₨ ${total.toLocaleString('en-PK')}`,   color: WARN    },
            { lbl: 'Advance',          icon: 'circle-minus',           iconColor: SUCCESS,   val: `₨ ${advance.toLocaleString('en-PK')}`, color: SUCCESS },
            { lbl: 'Remaining Udhar',  icon: 'triangle-exclamation',   iconColor: DANGER,    val: `₨ ${remain.toLocaleString('en-PK')}`,  color: DANGER  },
          ].map(({ lbl, icon, iconColor, val, color }, i, arr) => (
            <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className={`fa-solid fa-${icon}`} style={{ color: iconColor }} />{lbl}
              </span>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: '16px', fontWeight: 900, color }}>{val}</span>
            </div>
          ))}
        </div>

      </div>
      <div style={{ display: 'flex', gap: '9px', marginTop: '20px' }}>
        <button onClick={onSave} style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', background: WARN, color: '#fff', transition: 'all .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#d97706'}
          onMouseLeave={e => e.currentTarget.style.background = WARN}
        >
          <i className="fa-solid fa-floppy-disk" style={{ marginRight: '5px' }} />
          {isEdit ? 'Save Changes' : 'Save Udhar'}
        </button>
        <button onClick={onClose} style={{ padding: '11px 18px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.background = '#f5f7fa'}
        >Cancel</button>
      </div>
    </Modal>
  )
}

/* ══════════════════════════════════════
   PAYMENT MODAL
══════════════════════════════════════ */
function PaymentModal({ show, onClose, baki, form, setForm, onSave }) {
  const sf = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  return (
    <Modal show={show} onClose={onClose} maxWidth={480}>
      <ModalHeader title="Payment Received" sub="Record a payment from this customer" onClose={onClose} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

        {/* Balance Due info box */}
        <div style={{ gridColumn: '1/-1', background: '#fff5f5', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Current Balance Due</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '18px', fontWeight: 900, color: DANGER }}>₨ {baki.toLocaleString('en-PK')}</div>
          </div>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '22px', color: DANGER, opacity: .6 }} />
        </div>

        <div>
          <MLabel icon="calendar">Date</MLabel>
          <input type="date" style={inputSt} value={form.date} onChange={sf('date')} onFocus={focIn} onBlur={focOut} />
        </div>
        <div>
          <MLabel icon="money-bill-wave">Amount Received</MLabel>
          <input type="number" style={inputSt} placeholder="0" min="1" value={form.amount} onChange={sf('amount')} onFocus={focIn} onBlur={focOut} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <MLabel icon="note-sticky">Note (Optional)</MLabel>
          <input style={inputSt} placeholder="e.g. Cash received" value={form.note} onChange={sf('note')} onFocus={focIn} onBlur={focOut} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '9px', marginTop: '20px' }}>
        <button onClick={onSave} style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', background: SUCCESS, color: '#fff', transition: 'all .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#059669'}
          onMouseLeave={e => e.currentTarget.style.background = SUCCESS}
        >
          <i className="fa-solid fa-check" style={{ marginRight: '5px' }} />Record Payment
        </button>
        <button onClick={onClose} style={{ padding: '11px 18px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.background = '#f5f7fa'}
        >Cancel</button>
      </div>
    </Modal>
  )
}
