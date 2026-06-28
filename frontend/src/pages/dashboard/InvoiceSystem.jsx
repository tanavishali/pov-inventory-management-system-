import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { INITIAL_ORDERS } from './OrderManagement'

const fmt = n => '₨' + (Number(n) || 0).toLocaleString('en-PK')
const orderTotal = o => (o.products || []).reduce((s, p) => s + p.qty * p.price, 0)

const STATUS_COLORS = {
  pending:    { bg: '#fef9c3', color: '#b45309' },
  approved:   { bg: '#ede9fe', color: '#6d28d9' },
  dispatched: { bg: '#e0f2fe', color: '#0369a1' },
  completed:  { bg: '#dcfce7', color: '#16a34a' },
  cancelled:  { bg: '#fee2e2', color: '#dc2626' },
}
const STATUS_LABELS = {
  pending: 'Pending', approved: 'Approved',
  dispatched: 'Dispatched', completed: 'Completed', cancelled: 'Cancelled',
}

export function buildInvoiceHTML(order, invoiceNumber) {
  const biz = (() => { try { return JSON.parse(localStorage.getItem('wholesale_biz') || '{}') } catch { return {} } })()
  const inv = (() => { try { return JSON.parse(localStorage.getItem('wholesale_inv') || '{}') } catch { return {} } })()
  const bizName    = biz.name      || 'WholesalePro'
  const ownerName  = biz.ownerName || ''
  const ownerPhone = biz.ownerPhone || '03246770536'
  const bizPhone   = biz.phone     || '+92-42-1234567'
  const bizEmail   = biz.email     || ''
  const bizAddress = biz.address   || 'Wholesale Distribution Center'
  const taxRate    = parseFloat(inv.tax) || 0
  const footerNote = inv.footer    || 'Thank you for your business. Goods once sold will not be returned.'
  const invNo      = invoiceNumber || order.id
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
  .header{padding:24px 32px 20px;border-bottom:2px solid #111;display:flex;justify-content:space-between;align-items:flex-start}
  .company-name{font-size:24px;font-weight:900;color:#111;letter-spacing:-.3px;line-height:1.1}
  .company-detail{font-size:12px;color:#333;margin-top:5px;line-height:1.7}
  .inv-block{text-align:right}
  .inv-label{font-size:28px;font-weight:900;color:#111;letter-spacing:3px;line-height:1}
  .inv-no{font-size:14px;font-weight:700;color:#111;margin-top:5px}
  .inv-date{font-size:12px;color:#333;margin-top:3px}
  .from-to{display:flex;border-bottom:1px solid #ccc}
  .from-to > div{flex:1;padding:18px 32px}
  .from-to > div:first-child{border-right:1px solid #ccc}
  .ft-section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#111;border-bottom:1px solid #111;padding-bottom:4px;margin-bottom:10px}
  .ft-row{font-size:12.5px;color:#111;margin-bottom:5px;display:flex;gap:6px}
  .ft-key{font-weight:700;color:#111;min-width:110px;flex-shrink:0}
  .ft-val{color:#111}

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
<script>window.addEventListener('load',function(){if(window.screen.width>768){window.print();}});</script>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="company-name">${bizName}</div>
      <div class="company-detail">
        ${ownerName ? `Owner: ${ownerName}<br>` : ''}${ownerPhone ? `Owner Phone: ${ownerPhone}<br>` : ''}${bizPhone ? `Business Phone: ${bizPhone}` : ''}
      </div>
    </div>
    <div class="inv-block">
      <div class="inv-label">INVOICE</div>
      <div class="inv-no">Invoice No: ${invNo}</div>
      <div class="inv-date">Date: ${order.date}</div>
      <div class="inv-date">Time: ${order.time}</div>
    </div>
  </div>
  <div class="from-to">
    <div>
      <div class="ft-section-label">Invoice From</div>
      <div class="ft-row"><span class="ft-key">Company Name:</span><span class="ft-val">${bizName}</span></div>
      ${ownerName ? `<div class="ft-row"><span class="ft-key">Owner:</span><span class="ft-val">${ownerName}</span></div>` : ''}
      ${bizPhone ? `<div class="ft-row"><span class="ft-key">Business Phone:</span><span class="ft-val">${bizPhone}</span></div>` : ''}
      <div class="ft-row"><span class="ft-key">Address:</span><span class="ft-val">${bizAddress}</span></div>
      ${order.salesman ? `<div class="ft-row"><span class="ft-key">Salesman:</span><span class="ft-val">${order.salesman}</span></div>` : ''}
    </div>
    <div>
      <div class="ft-section-label">Invoice To</div>
      <div class="ft-row"><span class="ft-key">Customer Name:</span><span class="ft-val">${order.customer}</span></div>
      <div class="ft-row"><span class="ft-key">Shop Name:</span><span class="ft-val">${order.shop}</span></div>
      ${order.phone ? `<div class="ft-row"><span class="ft-key">Phone:</span><span class="ft-val">${order.phone}</span></div>` : ''}
      <div class="ft-row"><span class="ft-key">Payment:</span><span class="ft-val" style="font-weight:700">${order.payment}</span></div>
    </div>
  </div>
  
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
      <tbody>${rowsHTML}</tbody>
    </table>
  </div>
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
  <div class="footer">
    <div class="footer-msg">${footerNote}</div>
    <div class="footer-right">Software by <strong>TechRiwaayat Company</strong><br>${ownerPhone}</div>
  </div>
</div>
<div class="no-print" style="text-align:center;margin-top:20px;padding-bottom:24px">
  <button onclick="window.print()" style="background:#111;color:#fff;border:none;padding:12px 36px;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.5px">
    Print Invoice
  </button>
</div>
</body></html>`
}

/* ─── Invoice Card ─── */
function InvoiceCard({ order, onPrint, invNumber }) {
  const total = orderTotal(order)
  const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending
  const advAmt = order.payment === 'Udaar' ? (order.advance || 0) : 0
  const baki = Math.max(0, total - advAmt)
  const isPaid = order.payment === 'Paid'

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px',
      overflow: 'hidden', transition: 'all .22s',
      boxShadow: '0 2px 8px rgba(0,0,0,.06)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,.1)'; e.currentTarget.style.borderColor = '#c7d2fe' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)'; e.currentTarget.style.borderColor = '#e2e8f0' }}
    >
      {/* Top color strip */}
      <div style={{ height: '5px', background: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,#e0f2fe,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fa-solid fa-file-invoice" style={{ color: '#0ea5e9', fontSize: '16px' }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '16px', color: '#1e293b', letterSpacing: '-.2px' }}>
                {invNumber || order.id}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                {order.date} · {order.time}
              </div>
            </div>
          </div>
          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: sc.bg, color: sc.color, whiteSpace: 'nowrap' }}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        {/* Info grid */}
        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: 'user', label: 'Customer', val: order.customer },
              { icon: 'store', label: 'Shop', val: order.shop },
              { icon: 'user-tie', label: 'Salesman', val: order.salesman || '—' },
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

        {/* Amount section */}
        <div style={{ borderRadius: '10px', border: `1.5px solid ${isPaid ? '#bbf7d0' : '#fde68a'}`, background: isPaid ? '#f0fdf4' : '#fffbeb', padding: '10px 13px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>Total Amount</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '20px', color: '#1e293b', lineHeight: 1.1, marginTop: '2px' }}>{fmt(total)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: isPaid ? '#dcfce7' : '#fef9c3', color: isPaid ? '#16a34a' : '#b45309' }}>
                <i className={`fa-solid fa-${isPaid ? 'circle-check' : 'clock'}`} style={{ marginRight: '4px' }} />
                {isPaid ? 'Paid' : 'Udaar'}
              </span>
              {!isPaid && baki > 0 && (
                <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700, marginTop: '4px' }}>
                  Due: {fmt(baki)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Print button */}
        <button onClick={() => onPrint(order)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            padding: '10px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 3px 12px rgba(99,102,241,.3)', transition: 'all .2s',
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

function StatBox({ icon, label, value, color, bg, trend }) {
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
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '24px', color: '#1e293b', lineHeight: 1.1, marginTop: '3px' }}>{value}</div>
      </div>
    </div>
  )
}

export default function InvoiceSystem() {
  const ctx = useOutletContext() || {}
  const orders = ctx.sharedOrders ?? INITIAL_ORDERS

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [sort, setSort] = useState('newest')

  const getInvoiceNumber = (order) => order.id || '—'

  const handlePrint = (order) => {
    const html = buildInvoiceHTML(order, getInvoiceNumber(order))
    const blob = new Blob([html], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let list = orders.filter(o => {
      const ms = filterStatus === 'all' || o.status === filterStatus
      const mp = filterPayment === 'all' || o.payment === filterPayment
      const mq = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.shop.toLowerCase().includes(q)
      return ms && mp && mq
    })
    if (sort === 'newest') list = [...list].reverse()
    else if (sort === 'oldest') list = [...list]
    else if (sort === 'amount-h') list = [...list].sort((a, b) => orderTotal(b) - orderTotal(a))
    else if (sort === 'amount-l') list = [...list].sort((a, b) => orderTotal(a) - orderTotal(b))
    return list
  }, [orders, search, filterStatus, filterPayment, sort])

  // Stats always from ALL orders (not filtered)
  const totalInvoices = orders.length
  const paidCount    = orders.filter(o => o.payment === 'Paid').length
  const udaarCount   = orders.filter(o => o.payment === 'Udaar').length
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + orderTotal(o), 0)

  const selStyle = {
    padding: '9px 13px', border: '1.5px solid #e2e8f0', borderRadius: '10px',
    fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', color: '#1e293b',
    background: '#fff', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,.06)', cursor: 'pointer',
  }

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{
        background: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)',
        borderRadius: '18px', padding: '24px 28px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
        boxShadow: '0 4px 20px rgba(99,102,241,.25)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-file-invoice" style={{ color: '#fff', fontSize: '20px' }} />
            </div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '24px', color: '#fff' }}>
              Invoice System
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.8)', paddingLeft: '56px' }}>
            All orders with invoices — Paid and Credit included
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,.18)', borderRadius: '12px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-receipt" style={{ color: '#fff', fontSize: '18px' }} />
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.75)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Orders</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '22px', color: '#fff', lineHeight: 1 }}>{totalInvoices}</div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: '14px', marginBottom: '24px' }}>
        <StatBox icon="file-invoice"          label="Total Invoices"     value={totalInvoices} color="#0ea5e9" bg="#e0f2fe" />
        <StatBox icon="circle-check"          label="Paid Orders"        value={paidCount}     color="#16a34a" bg="#dcfce7" />
        <StatBox icon="clock"                 label="Udaar Orders"       value={udaarCount}    color="#b45309" bg="#fef9c3" />
        <StatBox icon="circle-dollar-to-slot" label="Completed Revenue"  value={fmt(totalRevenue)} color="#6d28d9" bg="#ede9fe" />
      </div>

      {/* ── Filters ── */}
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
            <input
              type="text" placeholder="Search by Invoice ID, customer or shop..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', background: '#f8fafc', color: '#1e293b', outline: 'none' }}
            />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selStyle}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="dispatched">Dispatched</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} style={selStyle}>
            <option value="all">All Payment</option>
            <option value="Paid">Paid</option>
            <option value="Udaar">Udaar</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} style={selStyle}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-h">Amount: High to Low</option>
            <option value="amount-l">Amount: Low to High</option>
          </select>
        </div>
      </div>

      <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className="fa-solid fa-filter" style={{ color: '#6366f1', fontSize: '11px' }} />
        <strong style={{ color: '#1e293b' }}>{filtered.length}</strong> invoice{filtered.length !== 1 ? 's' : ''} found
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1.5px dashed #e2e8f0' }}>
          <i className="fa-solid fa-file-circle-xmark" style={{ fontSize: '52px', marginBottom: '16px', display: 'block', opacity: .25 }} />
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>No invoice found</div>
          <div style={{ fontSize: '13px' }}>Try changing filter or search</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: '16px' }} className="inv-grid">
          {filtered.map(o => (
            <InvoiceCard key={o.id} order={o} onPrint={handlePrint} invNumber={getInvoiceNumber(o)} />
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '24px 0 6px', color: '#94a3b8', fontSize: '12px' }}>
        WholesalePro Management System © 2026
      </div>
      <style>{`@media(max-width:768px){.inv-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  )
}
