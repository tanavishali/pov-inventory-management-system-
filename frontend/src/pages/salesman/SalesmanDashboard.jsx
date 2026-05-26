import { useOutletContext, useNavigate } from 'react-router-dom'
import { useGetShopsQuery } from '../../store/slices/shopsApiSlice'
import { useGetProductsQuery } from '../../store/slices/productsApiSlice'

const fmt = n => 'Rs ' + Number(n).toLocaleString('en-PK')

function StatCard({ icon, label, value, color, bg, sub, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', border: '1.5px solid #e2e8f0', borderTop: `3px solid ${color}`,
      borderRadius: '14px', padding: '18px 20px', cursor: onClick ? 'pointer' : 'default',
      boxShadow: '0 1px 3px rgba(0,0,0,.07)', transition: 'all .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.07)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', color }}>
          <i className={`fa-solid fa-${icon}`} />
        </div>
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '26px', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '3px' }}>{sub}</div>}
    </div>
  )
}

export default function SalesmanDashboard() {
  const { user } = useOutletContext() || {}
  const navigate = useNavigate()

  // Read orders from localStorage
  const orders = (() => {
    try { return JSON.parse(localStorage.getItem('salesman_orders') || '[]') } catch { return [] }
  })()

  const { data: dbShops = [], isLoading: isLoadingShops } = useGetShopsQuery()
  const { data: dbProducts = [], isLoading: isLoadingProds } = useGetProductsQuery()

  if (isLoadingShops || isLoadingProds) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#0ea5e9', animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Loading dashboard statistics...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    )
  }

  const myOrders = orders.filter(o => o.salesmanEmail === user?.email)
  const totalSales = myOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0)
  const udaarOrders = myOrders.filter(o => o.payment === 'Udaar')
  const totalUdaar = udaarOrders.reduce((s, o) => s + Math.max(0, (o.total || 0) - (o.advance || 0)), 0)
  const lowStock = dbProducts.filter(p => p.stock === 0 || p.stock <= p.threshold)
  const activeShops = dbShops.filter(s => s.status === 'active')

  const stats = [
    { icon: 'chart-line',          label: 'My Total Sales',    value: fmt(totalSales),            color: '#0ea5e9', bg: '#e0f2fe',   sub: `${myOrders.length} orders placed` },
    { icon: 'cart-shopping',       label: 'Total Orders',      value: myOrders.length,            color: '#6366f1', bg: '#ede9fe',   sub: 'By me' },
    { icon: 'store',               label: 'Active Shops',      value: activeShops.length,         color: '#10b981', bg: '#dcfce7',   sub: 'Available shops' },
    { icon: 'box-open',            label: 'Total Products',    value: dbProducts.length,          color: '#f59e0b', bg: '#fef9c3',   sub: `${lowStock.length} low stock` },
    { icon: 'hand-holding-dollar', label: 'Total Udaar Due',   value: fmt(totalUdaar),            color: '#ef4444', bg: '#fee2e2',   sub: `${udaarOrders.length} udaar orders` },
  ]

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '22px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-gauge-high" style={{ color: '#0ea5e9' }} />
          Mera Dashboard
        </div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>
          Welcome back, {user?.name}! Yahan apna kaam dekhein.
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px', marginBottom: '28px' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Recent Orders */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>
            <i className="fa-solid fa-clock-rotate-left" style={{ color: '#0ea5e9', marginRight: '8px' }} />
            Mere Recent Orders
          </span>
          <button onClick={() => navigate('/salesman/history')} style={{ background: '#e0f2fe', color: '#0ea5e9', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
            All Dekho
          </button>
        </div>
        {myOrders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <i className="fa-solid fa-cart-shopping" style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }} />
            Abhi koi order nahi. Naya order dale!
          </div>
        ) : (
          <div>
            {[...myOrders].reverse().slice(0, 5).map(o => (
              <div key={o.id} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>{o.shopName}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{o.date} · {o.products?.length} items</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0ea5e9' }}>Rs {Number(o.total).toLocaleString()}</span>
                  <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: o.payment === 'Paid' ? '#dcfce7' : '#fef9c3', color: o.payment === 'Paid' ? '#16a34a' : '#b45309' }}>
                    {o.payment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
