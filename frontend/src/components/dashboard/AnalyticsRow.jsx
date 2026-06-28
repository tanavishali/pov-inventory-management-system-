import { Link } from 'react-router-dom'

const cardStyle = {
  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px',
  padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)',
}

const badgeStyles = {
  low:  { background: '#fee2e2', color: '#dc2626' },
  ok:   { background: '#dcfce7', color: '#16a34a' },
  mid:  { background: '#fef9c3', color: '#b45309' },
}

function Badge({ type, children }) {
  return (
    <span style={{ padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, ...badgeStyles[type] }}>
      {children}
    </span>
  )
}

function LowStockTable({ lowStockAlerts = [] }) {
  const items = lowStockAlerts
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#f59e0b', marginRight: '6px' }} />
            Low Stock Alert
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Items needing restock</div>
        </div>
        <Link to="/products" style={{ fontSize: '12px', color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Product', 'Stock', 'Status'].map(h => (
              <th key={h} style={{ textAlign: 'left', fontSize: '11px', color: '#94a3b8', padding: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(({ name, cat, stock, status, label }) => (
            <tr key={name} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px 0' }}>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{name}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{cat}</div>
              </td>
              <td style={{ fontWeight: 600, fontSize: '13px', padding: '10px 0' }}>{stock}</td>
              <td style={{ padding: '10px 0' }}><Badge type={status}>{label}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TopProducts({ topSellingProducts = [] }) {
  const products = topSellingProducts
  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>
          <i className="fa-solid fa-fire" style={{ color: '#f59e0b', marginRight: '6px' }} />
          Top Selling Products
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>By revenue this period</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
        {products.map(({ name, revenue, pct, color }) => (
          <div key={name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
              <span style={{ fontWeight: 500 }}>{name}</span>
              <span style={{ color, fontWeight: 700 }}>{revenue}</span>
            </div>
            <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsRow({ lowStockAlerts, topSellingProducts }) {
  return (
    <>
      <div className="analytics-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '20px' }}>
        <LowStockTable lowStockAlerts={lowStockAlerts} />
        <TopProducts topSellingProducts={topSellingProducts} />
      </div>
      <style>{`
        @media (max-width: 900px) { .analytics-row { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) {
          .analytics-row > div { padding: 14px 12px !important; }
        }
      `}</style>
    </>
  )
}
