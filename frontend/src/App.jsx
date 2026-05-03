import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useGetProfileQuery, useLogoutMutation } from './store/slices/authApiSlice'
import AuthPage from './pages/AuthPage'
import DashboardLayout from './pages/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import ProductManagement from './pages/dashboard/ProductManagement'
import OrderManagement from './pages/dashboard/OrderManagement'
import ShopsManagement from './pages/dashboard/ShopsManagement'
import SalesmanManagement from './pages/dashboard/SalesmanManagement'
import UdharManagement from './pages/dashboard/UdharManagement'
import Reports from './pages/dashboard/Reports'
import ActivityHistory from './pages/dashboard/ActivityHistory'
import Settings from './pages/dashboard/Settings'
import InvoiceSystem from './pages/dashboard/InvoiceSystem'
import InvoiceHistory from './pages/dashboard/InvoiceHistory'
import SAPayments from './pages/super-admin/SAPayments'
import SALayout from './pages/super-admin/SALayout'
import SADashboard from './pages/super-admin/SADashboard'
import SAUserManagement from './pages/super-admin/SAUserManagement'
import SalesmanLayout from './pages/salesman/SalesmanLayout'
import SalesmanDashboard from './pages/salesman/SalesmanDashboard'
import SalesmanOrder from './pages/salesman/SalesmanOrder'
import SalesmanHistory from './pages/salesman/SalesmanHistory'
import SalesmanUdhar from './pages/salesman/SalesmanUdhar'

export default function App() {
  const token = localStorage.getItem('wholesale_token')
  const [user, setUser] = useState(null)
  
  const [logoutApi] = useLogoutMutation()
  
  // Auto-sync profile if token exists
  const { data: profileData, isLoading, isError } = useGetProfileQuery(undefined, {
    skip: !token
  })

  useEffect(() => {
    if (profileData) {
      setUser(profileData)
    }
    if (isError) {
      handleLogout()
    }
  }, [profileData, isError])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap()
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      localStorage.removeItem('wholesale_token')
      setUser(null)
    }
  }

  if (token && isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '40px', color: '#3366ff', marginBottom: '16px' }} />
          <p style={{ fontFamily: 'Outfit', fontWeight: 600, color: '#64748b' }}>Aapka account load ho raha hai...</p>
        </div>
      </div>
    )
  }

  return (
    <HashRouter>
      <Routes>
        {!user ? (
          <Route path="*" element={<AuthPage onLogin={handleLogin} />} />
        ) : user.status === 'Locked' || user.status === 'Blocked' ? (
          <Route path="*" element={
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '20px' }}>
                <i className="fa-solid fa-lock" />
              </div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 900, color: '#1e293b', marginBottom: '10px' }}>Account Suspended</h1>
              <p style={{ color: '#64748b', maxWidth: '400px', lineHeight: '1.6', marginBottom: '24px' }}>
                Aapka account block kar diya gaya hai. Admin se rabta karein.
              </p>
              <button onClick={handleLogout} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                Return to Login
              </button>
            </div>
          } />
        ) : (
          <>
            {user.role === 'super-admin' ? (
              <Route path="/super-admin" element={<SALayout user={user} onLogout={handleLogout} />}>
                <Route index element={<SADashboard />} />
                <Route path="users"    element={<SAUserManagement />} />
                <Route path="payments" element={<SAPayments />} />
                <Route path="*"        element={<Navigate to="/super-admin" replace />} />
              </Route>
            ) : user.role === 'salesman' ? (
              <Route path="/salesman" element={<SalesmanLayout user={user} onLogout={handleLogout} />}>
                <Route index          element={<SalesmanDashboard />} />
                <Route path="order"   element={<SalesmanOrder />} />
                <Route path="history" element={<SalesmanHistory />} />
                <Route path="udhar"   element={<SalesmanUdhar />} />
                <Route path="*"       element={<Navigate to="/salesman" replace />} />
              </Route>
            ) : (
              <Route path="/" element={<DashboardLayout user={user} onLogout={handleLogout} />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard"  element={<DashboardHome />} />
                <Route path="products"   element={<ProductManagement />} />
                <Route path="orders"     element={<OrderManagement />} />
                <Route path="shops"      element={<ShopsManagement />} />
                <Route path="udhar"      element={<UdharManagement />} />
                <Route path="salesman"   element={<SalesmanManagement />} />
                <Route path="invoices"         element={<InvoiceSystem />} />
                <Route path="invoice-history" element={<InvoiceHistory />} />
                <Route path="reports"    element={<Reports />} />
                <Route path="activity"   element={<ActivityHistory />} />
                <Route path="settings"   element={<Settings />} />
                <Route path="*"          element={<Navigate to="/dashboard" replace />} />
              </Route>
            )}
            <Route path="*" element={<Navigate to={user.role === 'super-admin' ? '/super-admin' : user.role === 'salesman' ? '/salesman' : '/dashboard'} replace />} />
          </>
        )}
      </Routes>
    </HashRouter>
  )
}
