import { useState, useMemo } from 'react'

/* ══════════════════════════════════════
   DATA
══════════════════════════════════════ */
const INIT_ACTIVITIES = [
  // ── TODAY ──
  { id: 1,  date: '2024-12-18', time: '09:42', type: 'order',    user: 'Ahmed Khan',   title: 'New Order Placed',          desc: ['Order ', '#ORD-1091', ' placed for Hassan Electronics Store — Rs 18,500'],        tags: ['Order', 'Hassan Electronics', 'Rs 18,500'] },
  { id: 2,  date: '2024-12-18', time: '09:15', type: 'login',    user: 'Admin',        title: 'Admin Login',               desc: ['Admin logged in from IP ', '192.168.1.1'],                                          tags: ['Login', 'Admin Panel'] },
  { id: 3,  date: '2024-12-18', time: '08:55', type: 'payment',  user: 'Admin',        title: 'Payment Received',          desc: ['Payment of ', 'Rs 31,000', ' received from Khan Brothers Depot'],                   tags: ['Payment', 'Khan Brothers', 'Received'] },
  // ── YESTERDAY ──
  { id: 4,  date: '2024-12-17', time: '18:30', type: 'block',    user: 'Admin',        title: 'Salesman Blocked',          desc: ['Salesman ', 'Bilal Ahmed', ' has been blocked by Admin'],                           tags: ['Block', 'Salesman'] },
  { id: 5,  date: '2024-12-17', time: '16:11', type: 'order',    user: 'Sara Malik',   title: 'New Order Placed',          desc: ['Order ', '#ORD-1090', ' placed for Sana General Store — Rs 7,200'],                  tags: ['Order', 'Sana Store', 'Rs 7,200'] },
  { id: 6,  date: '2024-12-17', time: '14:45', type: 'shop',     user: 'Admin',        title: 'Shop Details Updated',      desc: ['Shop ', 'City Wholesale Market', ' details were updated by Admin'],                   tags: ['Edit', 'Shop', 'Rawalpindi'] },
  { id: 7,  date: '2024-12-17', time: '13:20', type: 'salesman', user: 'Admin',        title: 'New Salesman Added',        desc: ['Salesman ', 'Nida Fatima', ' was added to the system'],                             tags: ['Add', 'Salesman'] },
  { id: 8,  date: '2024-12-17', time: '11:05', type: 'payment',  user: 'Zara Hussain', title: 'Payment Received',          desc: ['Payment of ', 'Rs 22,800', ' received from Raza Trading Co.'],                     tags: ['Payment', 'Raza Trading', 'Received'] },
  { id: 9,  date: '2024-12-17', time: '09:30', type: 'login',    user: 'Sara Malik',   title: 'Salesman Login',            desc: ['', 'Sara Malik', ' logged in to salesman portal'],                                  tags: ['Login', 'Salesman Portal'] },
  // ── 2 DAYS AGO ──
  { id: 10, date: '2024-12-16', time: '17:50', type: 'order',    user: 'Zara Hussain', title: 'New Order Placed',          desc: ['Order ', '#ORD-1089', ' placed for Khan Brothers Depot — Rs 31,000'],                tags: ['Order', 'Khan Brothers', 'Rs 31,000'] },
  { id: 11, date: '2024-12-16', time: '15:22', type: 'block',    user: 'Admin',        title: 'Shop Unblocked',            desc: ['Shop ', 'Al-Noor Provisions', ' was unblocked by Admin'],                           tags: ['Unblock', 'Shop', 'Karachi'] },
  { id: 12, date: '2024-12-16', time: '13:10', type: 'shop',     user: 'Admin',        title: 'New Shop Added',            desc: ['New shop ', 'Hamza Store', ' was registered in Karachi'],                          tags: ['Add', 'Shop', 'Karachi'] },
  { id: 13, date: '2024-12-16', time: '11:40', type: 'payment',  user: 'Admin',        title: 'Payment Sent',              desc: ['Payment of ', 'Rs 5,400', ' processed for Al-Noor Provisions'],                    tags: ['Payment', 'Al-Noor', 'Sent'] },
  { id: 14, date: '2024-12-16', time: '10:15', type: 'system',   user: 'System',       title: 'System Backup Completed',  desc: ['Automatic daily backup completed successfully at ', '10:15 AM'],                     tags: ['System', 'Backup'] },
  // ── 3 DAYS AGO ──
  { id: 15, date: '2024-12-15', time: '19:05', type: 'order',    user: 'Ahmed Khan',   title: 'Order Cancelled',           desc: ['Order ', '#ORD-1085', ' was cancelled by customer — Al-Noor Provisions'],           tags: ['Cancel', 'Order'] },
  { id: 16, date: '2024-12-15', time: '16:30', type: 'salesman', user: 'Admin',        title: 'Salesman Profile Updated',  desc: ['Profile of ', 'Ahmed Khan', ' was updated by Admin'],                               tags: ['Edit', 'Salesman'] },
  { id: 17, date: '2024-12-15', time: '14:00', type: 'block',    user: 'Admin',        title: 'Shop Blocked',              desc: ['Shop ', 'City Wholesale Market', ' was blocked due to pending dues'],               tags: ['Block', 'Shop', 'Rawalpindi'] },
  { id: 18, date: '2024-12-15', time: '11:25', type: 'order',    user: 'Sara Malik',   title: 'New Order Placed',          desc: ['Order ', '#ORD-1086', ' placed for City Wholesale Market — Rs 14,300'],            tags: ['Order', 'City Market', 'Rs 14,300'] },
  { id: 19, date: '2024-12-15', time: '09:00', type: 'login',    user: 'Zara Hussain', title: 'Salesman Login',            desc: ['', 'Zara Hussain', ' logged in to salesman portal'],                                tags: ['Login', 'Salesman Portal'] },
  // ── 4 DAYS AGO ──
  { id: 20, date: '2024-12-14', time: '17:40', type: 'shop',     user: 'Admin',        title: 'Shop Address Updated',      desc: ['Address of ', 'Raza Trading Co.', ' was updated in Lahore'],                       tags: ['Edit', 'Shop', 'Lahore'] },
  { id: 21, date: '2024-12-14', time: '15:15', type: 'payment',  user: 'Ahmed Khan',   title: 'Payment Received',          desc: ['Payment of ', 'Rs 41,200', ' received from Hamza Store'],                         tags: ['Payment', 'Hamza Store', 'Received'] },
  { id: 22, date: '2024-12-14', time: '12:50', type: 'order',    user: 'Zara Hussain', title: 'New Order Placed',          desc: ['Order ', '#ORD-1084', ' placed for Hamza Store — Rs 41,200'],                      tags: ['Order', 'Hamza Store', 'Rs 41,200'] },
  { id: 23, date: '2024-12-14', time: '10:30', type: 'salesman', user: 'Admin',        title: 'New Salesman Added',        desc: ['Salesman ', 'Usman Tariq', ' was added to the system'],                            tags: ['Add', 'Salesman'] },
  { id: 24, date: '2024-12-14', time: '08:45', type: 'system',   user: 'System',       title: 'System Backup Completed',  desc: ['Automatic daily backup completed successfully at ', '08:45 AM'],                     tags: ['System', 'Backup'] },
]

/* ══════════════════════════════════════
   CONFIG MAPS
══════════════════════════════════════ */
const TYPE_ICON = {
  order:    'fa-bag-shopping',
  shop:     'fa-store',
  salesman: 'fa-user-tie',
  block:    'fa-ban',
  payment:  'fa-money-bill-wave',
  login:    'fa-right-to-bracket',
  system:   'fa-gear',
}

const TYPE_ICON_STYLE = {
  order:    { bg: '#e0f2fe', color: '#0ea5e9' },
  shop:     { bg: '#d1fae5', color: '#10b981' },
  salesman: { bg: '#ede9fe', color: '#6366f1' },
  block:    { bg: '#fee2e2', color: '#ef4444' },
  payment:  { bg: '#d1fae5', color: '#10b981' },
  login:    { bg: '#fef3c7', color: '#f59e0b' },
  system:   { bg: '#f1f5f9', color: '#64748b' },
}

// Special overrides per activity
const ICON_OVERRIDE = {
  11: { bg: '#dcfce7', color: '#16a34a' }, // unblock
  12: { bg: '#d1fae5', color: '#10b981' }, // new shop
  7:  { bg: '#ede9fe', color: '#6366f1' }, // add salesman
  23: { bg: '#ede9fe', color: '#6366f1' }, // add salesman
  16: { bg: '#e0f2fe', color: '#0369a1' }, // edit salesman
  6:  { bg: '#e0f2fe', color: '#0369a1' }, // edit shop
  20: { bg: '#e0f2fe', color: '#0369a1' }, // edit shop
}

const TYPE_PILL = {
  order:    { bg: '#e0f2fe', color: '#0369a1', label: 'Order'    },
  shop:     { bg: '#dcfce7', color: '#16a34a', label: 'Shop'     },
  salesman: { bg: '#ede9fe', color: '#6d28d9', label: 'Salesman' },
  block:    { bg: '#fee2e2', color: '#dc2626', label: 'Block'    },
  payment:  { bg: '#d1fae5', color: '#059669', label: 'Payment'  },
  login:    { bg: '#fef9c3', color: '#b45309', label: 'Login'    },
  system:   { bg: '#f1f5f9', color: '#64748b', label: 'System'   },
}

const CARD_SHADOW = '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)'

/* ══════════════════════════════════════
   DATE LABEL HELPER
══════════════════════════════════════ */
function formatDateLabel(dateStr) {
  const d     = new Date(dateStr)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff  = Math.round((today - d) / 86400000)
  if (diff === 0) return { icon: 'fa-circle', iconColor: '#10b981', text: 'Today' }
  if (diff === 1) return { icon: 'fa-clock',  iconColor: '#94a3b8', text: 'Yesterday' }
  if (diff <= 6)  return { icon: 'fa-calendar', iconColor: '#94a3b8', text: d.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'short' }) }
  return { icon: 'fa-calendar', iconColor: '#94a3b8', text: d.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) }
}

/* ══════════════════════════════════════
   STAT CARD
══════════════════════════════════════ */
function StatCard({ borderColor, iconBg, iconColor, icon, bgIcon, bgIconColor, label, value, sub }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderTop: `3px solid ${borderColor}`, borderRadius: '14px',
      padding: '18px 20px', boxShadow: CARD_SHADOW,
      transition: 'transform .2s,box-shadow .2s', cursor: 'default',
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
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '28px', fontWeight: 900, lineHeight: 1, letterSpacing: '-.5px', color: borderColor }}>{value}</div>
      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '3px' }}>{sub}</div>
    </div>
  )
}

/* ══════════════════════════════════════
   ACTIVITY ITEM
══════════════════════════════════════ */
function ActivityItem({ activity: a, onDelete }) {
  const iconSt  = ICON_OVERRIDE[a.id] || TYPE_ICON_STYLE[a.type] || { bg: '#f5f7fa', color: '#64748b' }
  const pillSt  = TYPE_PILL[a.type] || TYPE_PILL.system

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '14px',
      background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '13px',
      padding: '14px 16px', marginBottom: '8px', boxShadow: CARD_SHADOW,
      transition: 'all .2s', cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateX(3px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = CARD_SHADOW; e.currentTarget.style.transform = '' }}
    >
      {/* Icon */}
      <div style={{ width: '40px', height: '40px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0, background: iconSt.bg, color: iconSt.color }}>
        <i className={`fa-solid ${TYPE_ICON[a.type] || 'fa-circle-dot'}`} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>{a.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
            {/* Type pill */}
            <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: pillSt.bg, color: pillSt.color, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {pillSt.label}
            </span>
            {/* Time & user */}
            <span style={{ fontSize: '11.5px', color: '#94a3b8', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fa-regular fa-clock" /> {a.time}
              &nbsp;·&nbsp;
              <i className="fa-solid fa-user" style={{ fontSize: '10px' }} /> {a.user}
            </span>
          </div>
        </div>

        {/* Description */}
        <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
          {a.desc.map((part, i) =>
            i % 2 === 1
              ? <span key={i} style={{ color: '#6366f1', fontWeight: 600 }}>{part}</span>
              : <span key={i}>{part}</span>
          )}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '7px', flexWrap: 'wrap' }}>
          {a.tags.map(tag => (
            <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: '#f5f7fa', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
              <i className="fa-solid fa-tag" style={{ fontSize: '9px' }} />{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Delete button */}
      <button onClick={() => onDelete(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '13px', padding: '4px 6px', borderRadius: '7px', flexShrink: 0, alignSelf: 'flex-start', transition: 'all .18s' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8' }}
      >
        <i className="fa-solid fa-xmark" />
      </button>
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function ActivityHistory() {
  const [logs,        setLogs]        = useState(INIT_ACTIVITIES)
  const [search,      setSearch]      = useState('')
  const [typeFilter,  setTypeFilter]  = useState('all')
  const [userFilter,  setUserFilter]  = useState('all')
  const [dateFilter,  setDateFilter]  = useState('all')
  const [visibleCnt,  setVisibleCnt]  = useState(12)

  /* ── Counts ── */
  const cntTotal  = logs.length
  const cntOrders = logs.filter(a => a.type === 'order').length
  const cntShops  = logs.filter(a => a.type === 'shop').length
  const cntBlocks = logs.filter(a => a.type === 'block').length

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    const q     = search.toLowerCase()
    const today = new Date(); today.setHours(0, 0, 0, 0)

    return logs.filter(a => {
      const aDate = new Date(a.date)

      // date range
      if (dateFilter === 'today') {
        if (aDate.getTime() !== today.getTime()) return false
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7)
        if (aDate < weekAgo) return false
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today); monthAgo.setMonth(today.getMonth() - 1)
        if (aDate < monthAgo) return false
      }

      // type filter
      if (typeFilter !== 'all' && a.type !== typeFilter) return false

      // user filter
      if (userFilter !== 'all' && a.user !== userFilter) return false

      // search
      if (q) {
        const hay = (a.title + ' ' + a.desc.join(' ') + ' ' + a.user + ' ' + a.tags.join(' ')).toLowerCase()
        if (!hay.includes(q)) return false
      }

      return true
    })
  }, [logs, search, typeFilter, userFilter, dateFilter])

  const visible = filtered.slice(0, visibleCnt)

  /* ── Group by date ── */
  const groups = {}
  visible.forEach(a => {
    if (!groups[a.date]) groups[a.date] = []
    groups[a.date].push(a)
  })
  const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a))

  /* ── Actions ── */
  function deleteActivity(id) {
    setLogs(prev => prev.filter(a => a.id !== id))
  }

  function clearAll() {
    if (!confirm('Are you sure you want to clear all activity history? This cannot be undone.')) return
    setLogs([])
  }

  function exportLog() {
    let csv = 'ID,Date,Time,Type,User,Title,Description\n'
    filtered.forEach(a => {
      const desc = a.desc.join('').replace(/,/g, ' ')
      csv += `${a.id},${a.date},${a.time},${a.type},${a.user},"${a.title}","${desc}"\n`
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'activity_history.csv'
    link.click()
  }

  function handleDateFilter(f) {
    setDateFilter(f)
    setVisibleCnt(12)
  }

  const dateBtns = [
    { key: 'all',   label: 'All'        },
    { key: 'today', label: 'Today'      },
    { key: 'week',  label: 'This Week'  },
    { key: 'month', label: 'This Month' },
  ]

  const ACCENT = '#0ea5e9'

  const selectSt = {
    padding: '9px 13px', border: '1px solid #e2e8f0', borderRadius: '9px',
    fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px',
    color: '#1e293b', background: '#f5f7fa', outline: 'none', cursor: 'pointer',
  }

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
            <i className="fa-solid fa-clock-rotate-left" style={{ color: ACCENT }} />
            Activity History
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Complete log of all actions performed in WholesalePro</div>
        </div>
        <div style={{ display: 'flex', gap: '9px', flexWrap: 'wrap' }}>
          {/* Clear All */}
          <button onClick={clearAll} style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: '#fff', color: '#475569', border: '1.5px solid #e2e8f0',
            padding: '9px 16px', borderRadius: '10px',
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fff5f5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#fff' }}
          >
            <i className="fa-solid fa-trash-can" /> Clear All
          </button>
          {/* Export Log */}
          <button onClick={exportLog} style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: ACCENT, color: '#fff', border: 'none',
            padding: '10px 18px', borderRadius: '10px',
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 2px 10px rgba(14,165,233,.3)', transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0284c7'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = '' }}
          >
            <i className="fa-solid fa-file-arrow-down" /> Export Log
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }} className="ah-stats">
        <StatCard borderColor="#0ea5e9" iconBg="#e0f2fe" iconColor="#0ea5e9" icon="list-check"  bgIcon="layer-group"   bgIconColor="#0ea5e9" label="Total Activities" value={cntTotal}  sub="All time logs"            />
        <StatCard borderColor="#10b981" iconBg="#d1fae5" iconColor="#10b981" icon="bag-shopping" bgIcon="arrow-trend-up" bgIconColor="#10b981" label="Orders Placed"    value={cntOrders} sub="Total orders logged"       />
        <StatCard borderColor="#6366f1" iconBg="#ede9fe" iconColor="#6366f1" icon="store"        bgIcon="signal"        bgIconColor="#6366f1" label="Shop Actions"      value={cntShops}  sub="Add / Edit / Block"        />
        <StatCard borderColor="#ef4444" iconBg="#fee2e2" iconColor="#ef4444" icon="ban"          bgIcon="lock"          bgIconColor="#ef4444" label="Block Actions"     value={cntBlocks} sub="Shops & salesmen blocked"  />
      </div>
      <style>{`.ah-stats{} @media(max-width:768px){.ah-stats{grid-template-columns:repeat(2,1fr) !important;}}`}</style>

      {/* ── Toolbar ── */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px',
        padding: '13px 16px', display: 'flex', alignItems: 'center', gap: '10px',
        flexWrap: 'wrap', marginBottom: '18px', boxShadow: CARD_SHADOW,
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
          <input type="text" placeholder="Search by action, user or description..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #e2e8f0', borderRadius: '9px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', background: '#f5f7fa', color: '#1e293b', outline: 'none' }}
            onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)'; e.target.style.background = '#fff' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f5f7fa' }}
          />
        </div>

        {/* Type Filter */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectSt}
          onFocus={e => e.target.style.borderColor = ACCENT}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        >
          <option value="all">All Types</option>
          <option value="order">Order</option>
          <option value="shop">Shop</option>
          <option value="salesman">Salesman</option>
          <option value="payment">Payment</option>
          <option value="block">Block / Unblock</option>
          <option value="login">Login</option>
          <option value="system">System</option>
        </select>

        {/* User Filter */}
        <select value={userFilter} onChange={e => setUserFilter(e.target.value)} style={selectSt}
          onFocus={e => e.target.style.borderColor = ACCENT}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        >
          <option value="all">All Users</option>
          <option value="Admin">Admin</option>
          <option value="Ahmed Khan">Ahmed Khan</option>
          <option value="Sara Malik">Sara Malik</option>
          <option value="Zara Hussain">Zara Hussain</option>
        </select>

        {/* Date Range Buttons */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {dateBtns.map(({ key, label }) => {
            const isAct = dateFilter === key
            return (
              <button key={key} onClick={() => handleDateFilter(key)} style={{
                padding: '7px 13px', borderRadius: '8px',
                border: `1px solid ${isAct ? ACCENT : '#e2e8f0'}`,
                background: isAct ? ACCENT : '#f5f7fa',
                color: isAct ? '#fff' : '#64748b',
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '12.5px',
                fontWeight: isAct ? 600 : 500, cursor: 'pointer', transition: 'all .18s', whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { if (!isAct) { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; e.currentTarget.style.background = '#f0f9ff' } }}
                onMouseLeave={e => { if (!isAct) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#f5f7fa' } }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Results Label ── */}
      <div style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '14px' }}>
        Showing <strong style={{ color: '#1e293b' }}>{visible.length}</strong> of <strong style={{ color: '#1e293b' }}>{filtered.length}</strong> activit{filtered.length !== 1 ? 'ies' : 'y'}
      </div>

      {/* ── Timeline ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '70px 20px', color: '#94a3b8' }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '48px', marginBottom: '14px', display: 'block', opacity: .3 }} />
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: '#64748b' }}>No activities found</div>
          <div style={{ fontSize: '13px' }}>Try a different search or filter</div>
        </div>
      ) : (
        <div>
          {sortedDates.map(date => {
            const dlabel = formatDateLabel(date)
            return (
              <div key={date} style={{ marginBottom: '4px', marginTop: '8px' }}>
                {/* Date Group Header */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '999px', padding: '5px 14px', fontSize: '12px', fontWeight: 700, color: '#64748b', boxShadow: CARD_SHADOW, marginBottom: '10px' }}>
                  <i className={`fa-${dlabel.icon === 'fa-circle' ? 'solid' : 'regular'} ${dlabel.icon}`} style={{ fontSize: dlabel.icon === 'fa-circle' ? '8px' : '11px', color: dlabel.iconColor }} />
                  {dlabel.text}
                </div>

                {/* Activity Items */}
                {groups[date].map(a => (
                  <ActivityItem key={a.id} activity={a} onDelete={deleteActivity} />
                ))}
              </div>
            )
          })}

          {/* Load More */}
          {filtered.length > visibleCnt && (
            <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
              <button onClick={() => setVisibleCnt(p => p + 10)} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#fff', border: '1.5px solid #e2e8f0', color: '#64748b',
                padding: '10px 24px', borderRadius: '10px',
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', transition: 'all .2s', boxShadow: CARD_SHADOW,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
              >
                <i className="fa-solid fa-chevron-down" /> Load More Activities
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ height: '20px' }} />
    </div>
  )
}
