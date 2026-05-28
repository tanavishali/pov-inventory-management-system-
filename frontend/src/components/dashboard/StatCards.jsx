const MOCK_PERIOD_DATA = {
  daily:   { sales: '1,20,000', newC: '8',   stock: '23', profit: '31,000',   loss: '5,000',    orders: '44',   delivery: '41' },
  weekly:  { sales: '8,40,000', newC: '47',  stock: '23', profit: '2,10,000', loss: '34,000',   orders: '312',  delivery: '289' },
  monthly: { sales: '36,00,000',newC: '182', stock: '23', profit: '9,20,000', loss: '1,40,000', orders: '1,240',delivery: '1,158' },
}

function StatCard({ icon, iconClass, label, valueKey, trend, trendClass, sub, data }) {
  const iconColors = {
    'ic-blue': { bg: '#e0f2fe', color: '#0ea5e9' },
    'ic-teal': { bg: '#e0fdf4', color: '#10b981' },
    'ic-warn': { bg: '#fffbeb', color: '#f59e0b' },
    'ic-red':  { bg: '#fef2f2', color: '#ef4444' },
    'ic-indigo':{ bg: '#eef2ff', color: '#6366f1' },
  }
  const trendColors = {
    'trend-up':   { bg: '#dcfce7', color: '#16a34a' },
    'trend-down': { bg: '#fee2e2', color: '#dc2626' },
    'trend-warn': { bg: '#fef9c3', color: '#b45309' },
  }
  const ic = iconColors[iconClass] || iconColors['ic-blue']
  const tc = trendColors[trendClass] || trendColors['trend-up']

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px',
      padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: ic.bg, color: ic.color }}>
          <i className={`fa-solid fa-${icon}`} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px', background: tc.bg, color: tc.color }}>
          {trend}
        </span>
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '30px', fontWeight: 900, lineHeight: 1, color: '#1e293b', letterSpacing: '-0.5px' }}>
        {data[valueKey]}
      </div>
      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '5px' }}>{sub}</div>
    </div>
  )
}

export default function StatCards({ period, periodData }) {
  const data = periodData ? (periodData[period] || periodData.weekly) : { sales: '0', newC: '0', stock: '0', profit: '0', loss: '0', orders: '0', delivery: '0' }

  const cards = [
    { icon: 'sack-dollar',        iconClass: 'ic-blue',   label: 'Total Sales',       valueKey: 'sales',    trend: '↑ 12.5%',    trendClass: 'trend-up',   sub: '₨ — This Period' },
    { icon: 'user-plus',          iconClass: 'ic-teal',   label: 'New Customers',     valueKey: 'newC',     trend: '↑ 8%',       trendClass: 'trend-up',   sub: 'Joined this period' },
    { icon: 'triangle-exclamation',iconClass: 'ic-warn',  label: 'Low Stock Items',   valueKey: 'stock',    trend: '+5 items',   trendClass: 'trend-warn', sub: 'Need restock soon' },
    { icon: 'chart-line',         iconClass: 'ic-teal',   label: 'Gross Profit',      valueKey: 'profit',   trend: '↑ 18%',      trendClass: 'trend-up',   sub: '₨ — Net margin' },
    { icon: 'arrow-trend-down',   iconClass: 'ic-red',    label: 'Total Loss',        valueKey: 'loss',     trend: 'Returns',    trendClass: 'trend-down', sub: '₨ — Damage & returns' },
    { icon: 'boxes-stacked',      iconClass: 'ic-blue',   label: 'Orders Placed',     valueKey: 'orders',   trend: '+34 today',  trendClass: 'trend-up',   sub: 'This period' },
    { icon: 'truck',              iconClass: 'ic-teal',   label: 'Delivered Orders',  valueKey: 'delivery', trend: '93.2%',      trendClass: 'trend-up',   sub: 'Delivery rate' },
  ]

  return (
    <>
      <div className="stat-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {cards.map(c => <StatCard key={c.label} {...c} data={data} />)}
      </div>
      <style>{`
        @media (max-width: 1200px) {
          .stat-cards-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .stat-cards-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .stat-cards-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .stat-cards-grid > div { padding: 14px !important; }
          .stat-cards-grid > div > div:nth-child(2) > div:first-child { width: 36px !important; height: 36px !important; font-size: 15px !important; }
        }
        @media (max-width: 340px) {
          .stat-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
