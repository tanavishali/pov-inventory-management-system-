import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import { INITIAL_PRODUCTS } from './dashboard/ProductManagement'
import { INITIAL_ORDERS } from './dashboard/OrderManagement'
import { useGetOrdersQuery } from '../store/slices/ordersApiSlice'
import { io } from 'socket.io-client'
import { useGetProductsQuery } from '../store/slices/productsApiSlice'

const routeToNav = {
  '/dashboard': 'Dashboard',
  '/products': 'Product Management',
  '/orders': 'Order Management',
  '/shops': 'Shops Management',
  '/udhar': 'Udhar Management',
  '/salesman': 'Salesman Management',
  '/invoices': 'Invoice System',
  '/invoice-history': 'Invoice History',
  '/reports': 'Reports',
  '/activity': 'Activity History',
  '/settings': 'System Settings',
  '/super-admin': 'Super Admin Panel',
}

export default function DashboardLayout({ user, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [period, setPeriod] = useState('weekly')
  // Helper: normalize salesman orders and assign proper prefixed IDs
  function normalizeSalesmanOrders(salesmanOrders, existingOrders = []) {
    const invSettings = (() => { try { return JSON.parse(localStorage.getItem('wholesale_inv') || '{}') } catch { return {} } })()
    const prefix = invSettings.prefix || 'INV-'
    // Find max numeric ID already used
    const allIds = [...existingOrders, ...salesmanOrders]
    const usedNums = allIds.map(o => { const n = parseInt((o.adminId || o.id || '').replace(/[^0-9]/g, '')); return isNaN(n) ? 0 : n }).filter(n => n > 0)
    let counter = usedNums.length ? Math.max(...usedNums) : 0
    return salesmanOrders.map(o => {
      // If already has an adminId keep it, else assign new one
      const adminId = o.adminId || (() => { counter++; return prefix + String(counter).padStart(3, '0') })()
      return {
        ...o,
        id: adminId,
        adminId,
        shop: o.shopName || o.shop || '',
        customer: o.shopOwner || o.customer || '',
        salesman: o.salesmanName || '',
        _fromSalesman: true,
      }
    })
  }

  const { data: dbOrders = [] } = useGetOrdersQuery()
  const { data: dbProducts = [] } = useGetProductsQuery()
  const [sharedOrders, setSharedOrders] = useState([])

  useEffect(() => {
    try {
      const salesmanOrders = JSON.parse(localStorage.getItem('salesman_orders') || '[]')
      const normalized = normalizeSalesmanOrders(salesmanOrders, dbOrders)
      setSharedOrders([...dbOrders, ...normalized])
    } catch {
      setSharedOrders(dbOrders)
    }
  }, [dbOrders])

  // Sync salesman orders when localStorage changes (cross-tab support)
  useEffect(() => {
    function syncSalesmanOrders() {
      try {
        const salesmanOrders = JSON.parse(localStorage.getItem('salesman_orders') || '[]')
        setSharedOrders(prev => {
          const nonSalesman = prev.filter(o => !o._fromSalesman)
          const normalized = normalizeSalesmanOrders(salesmanOrders, nonSalesman)
          return [...nonSalesman, ...normalized]
        })
      } catch {}
    }
    window.addEventListener('storage', syncSalesmanOrders)
    // Also poll every 5 seconds for same-tab updates
    const interval = setInterval(syncSalesmanOrders, 5000)
    return () => {
      window.removeEventListener('storage', syncSalesmanOrders)
      clearInterval(interval)
    }
  }, [])

  const [lowStockItems, setLowStockItems] = useState([])

  useEffect(() => {
    if (!user) return
    const shopId = user.role === 'admin' ? user._id || user.id : user.shopId
    if (!shopId) return

    // Connect to backend Socket.io server
    const socket = io('http://localhost:3000')

    socket.on('connect', () => {
      console.log('Connected to WebSocket server')
      // Join the shop's tenant room
      socket.emit('join-shop', { shopId })
    });

    // Listen for low stock status
    socket.on('stock-status', (data) => {
      if (data && data.lowStockItems) {
        setLowStockItems(data.lowStockItems)
      }
    });

    // Listen for real-time stock alert push notifications
    socket.on('low-stock-alert', (data) => {
      console.log('Low stock alert received:', data)
      if (data && data.product) {
        setLowStockItems(prev => {
          const exists = prev.some(p => p.id === data.product.id)
          if (exists) {
            return prev.map(p => p.id === data.product.id ? data.product : p)
          } else {
            return [...prev, data.product]
          }
        })
      }
    });

    return () => {
      socket.disconnect()
    }
  }, [user])

  // Sync lowStockItems dynamically with the live database products list
  useEffect(() => {
    if (dbProducts.length > 0) {
      const items = dbProducts
        .filter(p => p.stock === 0 || p.stock <= (p.threshold !== undefined && p.threshold !== null ? Number(p.threshold) : 10))
        .map(p => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
          threshold: p.threshold !== undefined && p.threshold !== null ? Number(p.threshold) : 10,
        }))
      setLowStockItems(items)
    } else {
      setLowStockItems([])
    }
  }, [dbProducts])

  if (!user) return <Navigate to="/auth" replace />

  const activeNav = routeToNav[location.pathname] || 'Dashboard'

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(true)
      else setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNavClick = (label, path) => {
    navigate(path)
    if (isMobile) setSidebarOpen(false)
  }

  return (
    <div style={{ background: '#f0f4f8', minHeight: '100vh', overflowX: 'hidden' }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
          zIndex: 999, backdropFilter: 'blur(2px)'
        }} />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        activeNav={activeNav}
        onNavClick={handleNavClick}
        onLogout={onLogout}
        isMobile={isMobile}
        user={user}
      />

      <Topbar
        sidebarOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(p => !p)}
        pageTitle={activeNav}
        period={period}
        onPeriodChange={setPeriod}
        isMobile={isMobile}
        showPeriodTabs={location.pathname === '/dashboard' || location.pathname === '/'}
        lowStockItems={lowStockItems}
      />

      <main style={{
        marginLeft: (!isMobile && sidebarOpen) ? '260px' : 0,
        marginTop: '60px',
        padding: isMobile ? '10px 8px' : '24px 28px',
        transition: 'margin-left 0.3s ease',
        minHeight: 'calc(100vh - 60px)',
        background: '#f0f4f8',
        overflowX: 'hidden',
      }}>
        <Outlet context={{ period, setPeriod, isMobile, sharedOrders, setSharedOrders }} />
      </main>
    </div>
  )
}
