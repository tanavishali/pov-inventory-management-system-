import { useState } from 'react'
import { useGetReportsQuery } from '../../store/slices/reportsApiSlice'

const MONTHS       = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CHART_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#94a3b8']
const CARD_SHADOW  = '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)'

const fmt = n => 'Rs ' + Number(n).toLocaleString('en-PK')

/* ══════════════════════════════════════
   STAT CARD
══════════════════════════════════════ */
function StatCard({ borderColor, iconBg, iconColor, icon, bgIcon, bgIconColor, label, value, trendUp, trendText }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderTop: `3px solid ${borderColor}`, borderRadius: '14px',
      padding: '18px 20px', boxShadow: CARD_SHADOW,
      transition: 'transform .2s,box-shadow .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = CARD_SHADOW }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', background: iconBg, color: iconColor }}>
          <i className={`fa-solid fa-${icon}`} />
        </div>
        <i className={`fa-solid fa-${bgIcon}`} style={{ color: bgIconColor, fontSize: '16px', opacity: .3 }} />
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '26px', fontWeight: 900, lineHeight: 1, letterSpacing: '-.5px', color: borderColor }}>{value}</div>
      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {trendUp !== undefined && trendText ? (
          <>
            <span style={{ color: trendUp ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <i className={`fa-solid fa-caret-${trendUp ? 'up' : 'down'}`} /> {trendText}
            </span>
            <span>vs last period</span>
          </>
        ) : (
          <span style={{ color: '#cbd5e1' }}>—</span>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   BAR + LINE CHART (SVG)
══════════════════════════════════════ */
function SalesBarChart({ monthlyRevenue, monthlyOrders }) {
  const [tooltip, setTooltip] = useState(null)

  const revenue = (monthlyRevenue && monthlyRevenue.length) ? monthlyRevenue : Array(12).fill(0)
  const orders  = (monthlyOrders  && monthlyOrders.length)  ? monthlyOrders  : Array(12).fill(0)

  const W = 580, H = 220
  const PAD = { top: 16, right: 50, bottom: 32, left: 56 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top  - PAD.bottom

  const maxRev = Math.max(...revenue, 1)
  const maxOrd = Math.max(...orders,  1)
  const barW   = (chartW / revenue.length) * 0.55
  const barGap = chartW / revenue.length

  const bars = revenue.map((v, i) => {
    const bH = (v / maxRev) * chartH
    const x  = PAD.left + i * barGap + (barGap - barW) / 2
    const y  = PAD.top  + chartH - bH
    return { x, y, w: barW, h: bH, v, i }
  })

  const linePoints = orders.map((v, i) => {
    const cx = PAD.left + i * barGap + barGap / 2
    const cy = PAD.top  + chartH - (v / maxOrd) * chartH
    return { cx, cy, v, i }
  })
  const linePath = linePoints.map((p, i) => {
    if (i === 0) return `M ${p.cx},${p.cy}`
    const prev = linePoints[i - 1]
    const mx   = (prev.cx + p.cx) / 2
    return `C ${mx},${prev.cy} ${mx},${p.cy} ${p.cx},${p.cy}`
  }).join(' ')
  const areaPath = linePath + ` L ${linePoints[linePoints.length - 1].cx},${PAD.top + chartH} L ${linePoints[0].cx},${PAD.top + chartH} Z`

  const revTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y:     PAD.top + chartH - f * chartH,
    label: f === 0 ? '0' : `${Math.round(maxRev * f / 1000)}K`,
  }))

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="rptBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0ea5e9" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="rptAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {revTicks.map(t => (
          <g key={t.y}>
            <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={PAD.left - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{t.label}</text>
          </g>
        ))}

        {bars.map(b => (
          <rect key={b.i}
            x={b.x} y={b.y} width={b.w} height={b.h}
            fill="url(#rptBarGrad)" rx="5" ry="5"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setTooltip({ x: b.x + b.w / 2, y: b.y - 8, rev: b.v, ord: orders[b.i], month: MONTHS[b.i] })}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}

        <path d={areaPath} fill="url(#rptAreaGrad)" />
        <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {linePoints.map(p => (
          <circle key={p.i} cx={p.cx} cy={p.cy} r="4" fill="#6366f1" stroke="#fff" strokeWidth="2"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setTooltip({ x: p.cx, y: p.cy - 10, rev: revenue[p.i], ord: p.v, month: MONTHS[p.i] })}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}

        {MONTHS.map((m, i) => (
          <text key={m} x={PAD.left + i * barGap + barGap / 2} y={H - 6} textAnchor="middle" fontSize="10.5" fill="#94a3b8">{m}</text>
        ))}

        {[0, 0.5, 1].map(f => (
          <text key={f} x={W - PAD.right + 8} y={PAD.top + chartH - f * chartH + 4} fontSize="10" fill="#6366f1">
            {Math.round(maxOrd * f)}
          </text>
        ))}

        {tooltip && (
          <g>
            <rect x={tooltip.x - 62} y={tooltip.y - 46} width="124" height="44" rx="8" fill="#1e293b" />
            <text x={tooltip.x} y={tooltip.y - 30} textAnchor="middle" fontSize="11.5" fill="#94a3b8" fontWeight="600">{tooltip.month}</text>
            <text x={tooltip.x - 4} y={tooltip.y - 14} textAnchor="middle" fontSize="11" fill="#0ea5e9">Rs {tooltip.rev.toLocaleString()}</text>
            <text x={tooltip.x + 44} y={tooltip.y - 14} textAnchor="end" fontSize="11" fill="#6366f1"> · {tooltip.ord} orders</text>
          </g>
        )}
      </svg>
    </div>
  )
}

/* ══════════════════════════════════════
   DONUT CHART (SVG)
══════════════════════════════════════ */
function DonutChart({ cityData }) {
  const [hovered, setHovered] = useState(null)

  const labels = cityData?.map(c => c.city) ?? []
  const values = cityData?.map(c => c.pct)  ?? []
  const colors = CHART_COLORS.slice(0, labels.length)

  if (!labels.length) {
    return (
      <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '13px' }}>
        No order data yet
      </div>
    )
  }

  const cx = 90, cy = 90, r = 68, inner = 46
  const total = values.reduce((a, b) => a + b, 0) || 1

  let cumAngle = -90
  const slices = values.map((val, i) => {
    const startAngle = cumAngle
    const sweep      = (val / total) * 360
    cumAngle += sweep
    const s   = startAngle * Math.PI / 180
    const e   = (startAngle + sweep) * Math.PI / 180
    const x1  = cx + r     * Math.cos(s), y1  = cy + r     * Math.sin(s)
    const x2  = cx + r     * Math.cos(e), y2  = cy + r     * Math.sin(e)
    const ix1 = cx + inner * Math.cos(s), iy1 = cy + inner * Math.sin(s)
    const ix2 = cx + inner * Math.cos(e), iy2 = cy + inner * Math.sin(e)
    const large = sweep > 180 ? 1 : 0
    const path  = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 ${large} 0 ${ix1} ${iy1} Z`
    return { path, color: colors[i], val, label: labels[i] }
  })

  const hov = hovered !== null ? slices[hovered] : null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 180 180" style={{ width: '170px', height: '170px' }}>
          {slices.map((s, i) => {
            const midAngle = (-90 + (values.slice(0, i).reduce((a, b) => a + b, 0) + s.val / 2) / total * 360) * Math.PI / 180
            return (
              <path key={i} d={s.path} fill={s.color}
                transform={hovered === i ? `translate(${Math.cos(midAngle) * 4},${Math.sin(midAngle) * 4})` : ''}
                style={{ cursor: 'pointer', transition: 'all .2s', filter: hovered === i ? 'brightness(1.1)' : 'none' }}
                stroke="#fff" strokeWidth="2"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            )
          })}
          <text x="90" y="85" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1e293b" fontFamily="Outfit,sans-serif">
            {hov ? `${hov.val}%` : 'Cities'}
          </text>
          <text x="90" y="101" textAnchor="middle" fontSize="10" fill="#94a3b8">
            {hov ? hov.label : 'Sales Split'}
          </text>
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '10px' }}>
        {labels.map((lbl, i) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', cursor: 'default' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: colors[i], flexShrink: 0 }} />
              <span style={{ color: '#475569' }}>{lbl}</span>
            </div>
            <strong style={{ color: '#1e293b', fontFamily: "'Outfit',sans-serif" }}>{values[i]}%</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   SKELETON
══════════════════════════════════════ */
function Skeleton({ w = '100%', h = '18px', r = '8px' }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'skeletonShimmer 1.4s infinite' }} />
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function Reports() {
  const today   = new Date().toISOString().split('T')[0]
  const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [dateFrom, setDateFrom] = useState(yearAgo)
  const [dateTo,   setDateTo]   = useState(today)
  const [range,    setRange]    = useState('1y')

  const { data, isLoading, isFetching } = useGetReportsQuery({ from: dateFrom, to: dateTo })

  const loading = isLoading || isFetching

  function applyRange(r) {
    setRange(r)
    const now  = new Date()
    let   from = new Date()
    if      (r === '7d')  from.setDate(now.getDate() - 7)
    else if (r === '30d') from.setDate(now.getDate() - 30)
    else if (r === '3m')  from.setMonth(now.getMonth() - 3)
    else if (r === '1y')  from.setFullYear(now.getFullYear() - 1)
    else                  from = new Date('2020-01-01')
    setDateFrom(from.toISOString().split('T')[0])
    setDateTo(now.toISOString().split('T')[0])
  }

  function exportCSV() {
    const rev  = data?.monthlyRevenue ?? Array(12).fill(0)
    const ords = data?.monthlyOrders  ?? Array(12).fill(0)
    let csv = 'Month,Revenue (Rs),Orders\n'
    MONTHS.forEach((m, i) => { csv += `${m},${rev[i]},${ords[i]}\n` })
    const blob = new Blob([csv], { type: 'text/csv' })
    const a    = document.createElement('a')
    const url  = URL.createObjectURL(blob)
    a.href     = url
    a.download = 'wholesalepro_report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const rangeBtns = [
    { key: '7d',  label: '7 Days'   },
    { key: '30d', label: '30 Days'  },
    { key: '3m',  label: '3 Months' },
    { key: '1y',  label: '1 Year'   },
    { key: 'all', label: 'All Time' },
  ]

  const statusStyle = {
    paid:      { bg: '#dcfce7', color: '#16a34a', icon: 'circle-check', label: 'Paid'      },
    pending:   { bg: '#fef9c3', color: '#b45309', icon: 'clock',        label: 'Pending'   },
    cancelled: { bg: '#fee2e2', color: '#dc2626', icon: 'xmark',        label: 'Cancelled' },
  }

  const rankStyle = i =>
    i === 0 ? { bg: '#fef9c3', color: '#b45309' } :
    i === 1 ? { bg: '#f1f5f9', color: '#475569' } :
    i === 2 ? { bg: '#fef3c7', color: '#92400e' } :
              { bg: '#f5f7fa', color: '#94a3b8'  }

  const stats         = data?.stats ?? {}
  const trendRevenue  = stats.revenueTrend
  const trendOrders   = stats.ordersTrend

  return (
    <div>
      <style>{`
        @keyframes skeletonShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { to { transform: rotate(360deg) } }
        @media(max-width:768px){
          .rpt-stats      { grid-template-columns: repeat(2,1fr) !important; }
          .rpt-charts-row { grid-template-columns: 1fr !important; }
          .rpt-bottom-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
            <i className="fa-solid fa-chart-pie" style={{ color: '#0ea5e9' }} />
            Reports & Analytics
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Business performance overview — WholesalePro</div>
        </div>
        <div style={{ display: 'flex', gap: '9px', flexWrap: 'wrap', alignItems: 'center' }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
              <div style={{ width: '14px', height: '14px', border: '2px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              Loading…
            </div>
          )}
          <button onClick={() => window.print()} style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: '#fff', color: '#475569', border: '1.5px solid #e2e8f0',
            padding: '9px 16px', borderRadius: '10px',
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.color = '#0ea5e9'; e.currentTarget.style.background = '#f0f9ff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#fff' }}
          >
            <i className="fa-solid fa-print" /> Print
          </button>
          <button onClick={exportCSV} style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: '#0ea5e9', color: '#fff', border: 'none',
            padding: '10px 18px', borderRadius: '10px',
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 2px 10px rgba(14,165,233,.3)', transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0284c7'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0ea5e9'; e.currentTarget.style.transform = '' }}
          >
            <i className="fa-solid fa-file-arrow-down" /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Date Filter Bar ── */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px',
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
        flexWrap: 'wrap', marginBottom: '20px', boxShadow: CARD_SHADOW,
      }}>
        <i className="fa-regular fa-calendar-days" style={{ color: '#94a3b8', fontSize: '14px' }} />
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.4px' }}>From</label>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setRange('') }} style={{
          padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '9px',
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', color: '#1e293b',
          background: '#f5f7fa', outline: 'none', cursor: 'pointer',
        }}
          onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)' }}
          onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
        />
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.4px' }}>To</label>
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setRange('') }} style={{
          padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '9px',
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', color: '#1e293b',
          background: '#f5f7fa', outline: 'none', cursor: 'pointer',
        }}
          onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)' }}
          onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
        />
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {rangeBtns.map(({ key, label }) => {
            const isAct = range === key
            return (
              <button key={key} onClick={() => applyRange(key)} style={{
                padding: '7px 13px', borderRadius: '8px',
                border:     `1px solid ${isAct ? '#0ea5e9' : '#e2e8f0'}`,
                background: isAct ? '#0ea5e9' : '#f5f7fa',
                color:      isAct ? '#fff'    : '#64748b',
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '12px',
                fontWeight: isAct ? 700 : 500, cursor: 'pointer', transition: 'all .18s',
              }}
                onMouseEnter={e => { if (!isAct) { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.color = '#0ea5e9'; e.currentTarget.style.background = '#f0f9ff' } }}
                onMouseLeave={e => { if (!isAct) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#f5f7fa' } }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '22px' }} className="rpt-stats">
        <StatCard
          borderColor="#10b981" iconBg="#d1fae5" iconColor="#10b981"
          icon="sack-dollar" bgIcon="arrow-trend-up" bgIconColor="#10b981"
          label="Total Revenue"
          value={isLoading ? '—' : fmt(stats.totalRevenue ?? 0)}
          trendUp={trendRevenue != null ? trendRevenue >= 0 : undefined}
          trendText={trendRevenue != null ? `${trendRevenue >= 0 ? '+' : ''}${trendRevenue}%` : undefined}
        />
        <StatCard
          borderColor="#0ea5e9" iconBg="#e0f2fe" iconColor="#0ea5e9"
          icon="bag-shopping" bgIcon="layer-group" bgIconColor="#0ea5e9"
          label="Total Orders"
          value={isLoading ? '—' : (stats.totalOrders ?? 0).toLocaleString()}
          trendUp={trendOrders != null ? trendOrders >= 0 : undefined}
          trendText={trendOrders != null ? `${trendOrders >= 0 ? '+' : ''}${trendOrders}%` : undefined}
        />
        <StatCard
          borderColor="#6366f1" iconBg="#ede9fe" iconColor="#6366f1"
          icon="store" bgIcon="signal" bgIconColor="#6366f1"
          label="Active Shops"
          value={isLoading ? '—' : (stats.activeShops ?? 0).toString()}
          trendUp={undefined} trendText={undefined}
        />
        <StatCard
          borderColor="#f59e0b" iconBg="#fef3c7" iconColor="#f59e0b"
          icon="user-tie" bgIcon="users" bgIconColor="#f59e0b"
          label="Active Salesmen"
          value={isLoading ? '—' : (stats.activeSalesmen ?? 0).toString()}
          trendUp={undefined} trendText={undefined}
        />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '22px' }} className="rpt-charts-row">

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: CARD_SHADOW }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '15px', color: '#1e293b' }}>
                <i className="fa-solid fa-chart-column" style={{ color: '#0ea5e9', marginRight: '7px' }} />Monthly Sales Revenue
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                January – December {new Date().getFullYear()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[{ color: '#0ea5e9', label: 'Revenue' }, { color: '#6366f1', label: 'Orders' }].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: color }} />{label}
                </div>
              ))}
            </div>
          </div>
          {isLoading
            ? <Skeleton h="160px" r="10px" />
            : <SalesBarChart monthlyRevenue={data?.monthlyRevenue} monthlyOrders={data?.monthlyOrders} />
          }
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: CARD_SHADOW }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '15px', color: '#1e293b' }}>
              <i className="fa-solid fa-chart-pie" style={{ color: '#6366f1', marginRight: '7px' }} />Sales by City
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Top performing cities</div>
          </div>
          {isLoading
            ? <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Skeleton w="150px" h="150px" r="50%" /></div>
            : <DonutChart cityData={data?.cityBreakdown} />
          }
        </div>
      </div>

      {/* ── Bottom Row: Tables ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }} className="rpt-bottom-row">

        {/* Top Salesmen */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '15px' }}>
              <i className="fa-solid fa-trophy" style={{ color: '#f59e0b', marginRight: '7px' }} />Top Salesmen
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>By Revenue</span>
          </div>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} h="32px" />)}
            </div>
          ) : !data?.topSalesmen?.length ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 0', fontSize: '13px' }}>No sales data in this period</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['#', 'Name', 'Orders', 'Revenue'].map(h => (
                      <th key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.topSalesmen.map((s, i) => {
                    const rs = rankStyle(i)
                    return (
                      <tr key={s.name}
                        onMouseEnter={e => { Array.from(e.currentTarget.cells).forEach(c => c.style.background = '#f8fafc') }}
                        onMouseLeave={e => { Array.from(e.currentTarget.cells).forEach(c => c.style.background = '') }}
                      >
                        <td style={{ padding: '10px 10px', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", background: rs.bg, color: rs.color }}>{i + 1}</span>
                        </td>
                        <td style={{ padding: '10px 10px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#1e293b', fontSize: '13px' }}>
                          <i className="fa-solid fa-user-tie" style={{ color: '#94a3b8', fontSize: '11px', marginRight: '5px' }} />{s.name}
                        </td>
                        <td style={{ padding: '10px 10px', borderBottom: '1px solid #f1f5f9', fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: '#6366f1', fontSize: '13px' }}>{s.orders}</td>
                        <td style={{ padding: '10px 10px', borderBottom: '1px solid #f1f5f9', fontFamily: "'Outfit',sans-serif", fontWeight: 800, color: '#10b981', fontSize: '13px' }}>Rs {s.revenue.toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: CARD_SHADOW, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '15px' }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ color: '#0ea5e9', marginRight: '7px' }} />Recent Orders
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Latest 8</span>
          </div>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} h="32px" />)}
            </div>
          ) : !data?.recentOrders?.length ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 0', fontSize: '13px' }}>No orders in this period</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Order ID', 'Shop', 'Amount', 'Status'].map(h => (
                      <th key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map(o => {
                    const st = statusStyle[o.status] ?? statusStyle.pending
                    return (
                      <tr key={o.id}
                        onMouseEnter={e => { Array.from(e.currentTarget.cells).forEach(c => c.style.background = '#f8fafc') }}
                        onMouseLeave={e => { Array.from(e.currentTarget.cells).forEach(c => c.style.background = '') }}
                      >
                        <td style={{ padding: '10px 10px', borderBottom: '1px solid #f1f5f9', fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: '#0ea5e9', fontSize: '12.5px' }}>{o.id}</td>
                        <td style={{ padding: '10px 10px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#1e293b', fontSize: '13px' }}>{o.shop}</td>
                        <td style={{ padding: '10px 10px', borderBottom: '1px solid #f1f5f9', fontFamily: "'Outfit',sans-serif", fontWeight: 800, color: '#10b981', fontSize: '13px' }}>Rs {o.amount.toLocaleString()}</td>
                        <td style={{ padding: '10px 10px', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ padding: '2px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: st.bg, color: st.color }}>
                            <i className={`fa-solid fa-${st.icon}`} style={{ fontSize: '9px', marginRight: '3px' }} />{st.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Shop Performance Ranking ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: CARD_SHADOW, marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '15px' }}>
            <i className="fa-solid fa-ranking-star" style={{ color: '#6366f1', marginRight: '7px' }} />Shop Performance Ranking
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>By Orders Received</span>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} h="40px" />)}
          </div>
        ) : !data?.topShops?.length ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 0', fontSize: '13px' }}>No shop data in this period</div>
        ) : (
          data.topShops.map((s, i) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < data.topShops.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '13px', color: '#94a3b8', width: '20px', textAlign: 'center', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'linear-gradient(135deg,#e0f2fe,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#6366f1', flexShrink: 0 }}>
                <i className="fa-solid fa-store" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                {s.city && (
                  <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                    <i className="fa-solid fa-location-dot" style={{ fontSize: '10px', marginRight: '3px' }} />{s.city}
                  </div>
                )}
              </div>
              <div style={{ width: '120px', flexShrink: 0 }}>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.pct}%`, borderRadius: '999px', background: 'linear-gradient(90deg,#6366f1,#0ea5e9)', transition: 'width .6s ease' }} />
                </div>
              </div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '13px', color: '#6366f1', width: '70px', textAlign: 'right', flexShrink: 0 }}>{s.orders} orders</div>
            </div>
          ))
        )}
      </div>

      <div style={{ height: '10px' }} />
    </div>
  )
}
