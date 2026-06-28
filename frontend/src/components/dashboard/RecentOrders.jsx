import { Link } from 'react-router-dom'

const badgeStyles = {
  ok:  { background: '#dcfce7', color: '#16a34a' },
  mid: { background: '#fef9c3', color: '#b45309' },
  low: { background: '#fee2e2', color: '#dc2626' },
}

export default function RecentOrders({ recentOrders = [] }) {
  const orders = recentOrders
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px',
      padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>Recent Orders</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Latest transactions</div>
        </div>
        <Link to="/orders" style={{ fontSize: '12px', color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
      </div>

      {/* Desktop table */}
      <div className="ro-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
        <table style={{ minWidth: '500px', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date'].map(h => (
                <th key={h} style={{ textAlign: 'left', fontSize: '11px', color: '#94a3b8', padding: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(({ id, customer, items, amount, status, statusLabel, date }) => (
              <tr key={id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 0', color: '#0ea5e9', fontWeight: 700, fontSize: '13px' }}>{id}</td>
                <td style={{ padding: '10px 0', fontWeight: 500, fontSize: '13px' }}>{customer}</td>
                <td style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px' }}>{items}</td>
                <td style={{ padding: '10px 0', fontWeight: 700, fontSize: '13px' }}>{amount}</td>
                <td style={{ padding: '10px 0' }}>
                  <span style={{ padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, ...badgeStyles[status] }}>
                    {statusLabel}
                  </span>
                </td>
                <td style={{ padding: '10px 0', color: '#94a3b8', fontSize: '13px' }}>{date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="ro-cards" style={{ display: 'none', flexDirection: 'column', gap: '10px' }}>
        {orders.map(({ id, customer, items, amount, status, statusLabel, date }) => (
          <div key={id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', background: '#f5f7fa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#0ea5e9', fontWeight: 700, fontSize: '13px' }}>{id}</span>
              <span style={{ padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, ...badgeStyles[status] }}>{statusLabel}</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{customer}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
              <span>{items}</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{amount}</span>
              <span>{date}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media(max-width:560px){
          .ro-table { display: none !important; }
          .ro-cards { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
