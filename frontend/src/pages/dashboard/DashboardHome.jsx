import { useOutletContext } from 'react-router-dom'
import StatCards from '../../components/dashboard/StatCards'
import Charts from '../../components/dashboard/Charts'
import AnalyticsRow from '../../components/dashboard/AnalyticsRow'
import RecentOrders from '../../components/dashboard/RecentOrders'
import { useGetDashboardStatsQuery } from '../../store/slices/dashboardApiSlice'

export default function DashboardHome() {
  const { period, setPeriod, isMobile } = useOutletContext()
  const { data, isLoading, error, refetch } = useGetDashboardStatsQuery()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#64748b' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '40px', color: '#0ea5e9', marginBottom: '16px' }} />
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '17px', color: '#1e293b' }}>Loading Dashboard Metrics...</div>
        <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>Compiling inventory, order, and ledger intelligence</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#dc2626', background: '#fff', borderRadius: '14px', border: '1px solid #fee2e2', maxWidth: '500px', margin: '40px auto' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '44px', marginBottom: '16px', color: '#ef4444' }} />
        <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b', marginBottom: '8px' }}>Failed to Load Dashboard</div>
        <div style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '20px' }}>
          An error occurred while establishing a secure link with the statistics service.
        </div>
        <button onClick={() => refetch()} style={{ padding: '9px 24px', borderRadius: '8px', background: '#0ea5e9', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', boxShadow: '0 2px 8px rgba(14,165,233,.2)' }}>
          Retry Connection
        </button>
      </div>
    )
  }

  return (
    <>
      {isMobile && (
        <div style={{ display: 'flex', gap: '3px', background: '#f5f7fa', padding: '3px', borderRadius: '9px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
          {['Daily', 'Weekly', 'Monthly'].map(p => (
            <button key={p} onClick={() => setPeriod(p.toLowerCase())}
              style={{
                flex: 1, padding: '6px 8px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: period === p.toLowerCase() ? 700 : 500,
                background: period === p.toLowerCase() ? '#ffffff' : 'transparent',
                color: period === p.toLowerCase() ? '#0ea5e9' : '#94a3b8',
                boxShadow: period === p.toLowerCase() ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >{p}</button>
          ))}
        </div>
      )}
      <StatCards period={period} periodData={data?.periodData} />
      <Charts />
      <AnalyticsRow lowStockAlerts={data?.lowStockAlerts} topSellingProducts={data?.topSellingProducts} />
      <RecentOrders recentOrders={data?.recentOrders} />
      <div style={{ textAlign: 'center', padding: '12px 0 4px', color: '#94a3b8', fontSize: '12px' }}>
        WholesalePro Management System © 2026
      </div>
    </>
  )
}
