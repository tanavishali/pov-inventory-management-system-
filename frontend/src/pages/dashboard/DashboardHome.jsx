import { useOutletContext } from 'react-router-dom'
import StatCards from '../../components/dashboard/StatCards'
import Charts from '../../components/dashboard/Charts'
import AnalyticsRow from '../../components/dashboard/AnalyticsRow'
import RecentOrders from '../../components/dashboard/RecentOrders'

export default function DashboardHome() {
  const { period, setPeriod, isMobile } = useOutletContext()

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
      <StatCards period={period} />
      <Charts />
      <AnalyticsRow />
      <RecentOrders />
      <div style={{ textAlign: 'center', padding: '12px 0 4px', color: '#94a3b8', fontSize: '12px' }}>
        WholesalePro Management System © 2026
      </div>
    </>
  )
}
