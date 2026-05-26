import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { useGetShopsQuery } from '../../store/slices/shopsApiSlice'
import { useGetProductsQuery } from '../../store/slices/productsApiSlice'

const fmt = n => 'Rs ' + Number(n).toLocaleString('en-PK')

/* ─── Step Indicator ─── */
function StepBar({ step }) {
  const steps = ['Select Shop', 'Products', 'Review & Send']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '28px' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: i < step ? '#10b981' : i === step ? '#0ea5e9' : '#e2e8f0',
              color: i <= step ? '#fff' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px',
            }}>
              {i < step ? <i className="fa-solid fa-check" /> : i + 1}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: i === step ? '#0ea5e9' : '#94a3b8', whiteSpace: 'nowrap' }}>{s}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: '2px', background: i < step ? '#10b981' : '#e2e8f0', margin: '0 6px', marginBottom: '20px' }} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── New Customer Modal ─── */
function NewCustomerModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', owner: '', phone: '', city: '' })
  const [err, setErr] = useState('')

  function handleAdd() {
    if (!form.name.trim()) { setErr('Shop name is required'); return }
    onAdd({
      id: 'custom_' + Date.now(),
      name: form.name.trim(),
      owner: form.owner.trim() || 'N/A',
      phone: form.phone.trim() || '',
      city: form.city.trim() || '',
      status: 'active',
      created: new Date().toISOString().slice(0, 10),
    })
    onClose()
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: 800, fontSize: '17px', color: '#1e293b' }}>
            <i className="fa-solid fa-store" style={{ color: '#0ea5e9', marginRight: '8px' }} />
            New Customer
          </h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#64748b' }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {[
          { key: 'name', label: 'Shop Name *', placeholder: 'E.g. Ali General Store' },
          { key: 'owner', label: 'Owner Name', placeholder: 'Owner name' },
          { key: 'phone', label: 'Phone Number', placeholder: '+92 3XX XXXXXXX' },
          { key: 'city', label: 'City', placeholder: 'Lahore, Karachi...' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '5px' }}>{f.label}</label>
            <input
              value={form[f.key]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${f.key === 'name' && err ? '#dc2626' : '#e2e8f0'}`, borderRadius: '9px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        ))}
        {err && <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '12px' }}>{err}</div>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '9px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleAdd} style={{ flex: 2, padding: '11px', borderRadius: '9px', background: '#0ea5e9', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            <i className="fa-solid fa-plus" style={{ marginRight: '7px' }} /> Add & Select
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SalesmanOrder() {
  const { user, isMobile } = useOutletContext() || {}
  const navigate = useNavigate()

  const { data: dbShops = [], isLoading: isLoadingShops } = useGetShopsQuery()
  const { data: dbProducts = [], isLoading: isLoadingProds } = useGetProductsQuery()

  const [step, setStep] = useState(0)
  const [selectedShop, setSelectedShop] = useState(null)
  const [cart, setCart] = useState({})
  const [payment, setPayment] = useState('Paid')
  const [advance, setAdvance] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Shop step state
  const [shopSearch, setShopSearch] = useState('')
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [extraShops, setExtraShops] = useState([])

  // Product step state
  const [prodSearch, setProdSearch] = useState('')
  const [selCat, setSelCat] = useState('All')

  const baseShops = dbShops.filter(s => s.status === 'active')
  const allShops = [...baseShops, ...extraShops]
  const products = dbProducts
  const categories = ['All', ...Array.from(new Set(products.map(p => p.cat)))]

  const filteredShops = allShops.filter(s => {
    const q = shopSearch.trim().toLowerCase()
    return !q || s.name.toLowerCase().includes(q) || s.owner.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
  })

  const filteredProds = products.filter(p => {
    const matchCat = selCat === 'All' || p.cat === selCat
    const matchSearch = !prodSearch.trim() || p.name.toLowerCase().includes(prodSearch.toLowerCase())
    return matchCat && matchSearch
  })

  const total = products.reduce((s, p) => s + (cart[p.id] || 0) * p.selling, 0)
  const advAmt = payment === 'Udaar' ? (Number(advance) || 0) : 0
  const baki = Math.max(0, total - advAmt)
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0)

  function setQty(pid, val) {
    const p = products.find(x => x.id === pid)
    const max = p.stock
    const n = Math.min(Math.max(0, parseInt(val) || 0), max)
    setCart(prev => {
      const next = { ...prev }
      if (n === 0) delete next[pid]
      else next[pid] = n
      return next
    })
  }

  function handleAddCustomer(shop) {
    setExtraShops(prev => [...prev, shop])
    setSelectedShop(shop)
    setShowNewCustomer(false)
  }

  function handleSubmit() {
    // Generate sequential SO number
    const existing = (() => { try { return JSON.parse(localStorage.getItem('salesman_orders') || '[]') } catch { return [] } })()
    const soNumbers = existing
      .map(o => { const m = o.id.match(/^SO-(\d+)$/); return m ? parseInt(m[1]) : 0 })
    const nextNum = soNumbers.length ? Math.max(...soNumbers) + 1 : 1
    const soId = 'SO-' + String(nextNum).padStart(3, '0')
    const order = {
      id: soId,
      salesmanEmail: user?.email,
      salesmanName: user?.name,
      shopId: selectedShop.id,
      shopName: selectedShop.name,
      shopOwner: selectedShop.owner,
      products: products.filter(p => cart[p.id]).map(p => ({
        id: p.id, name: p.name, qty: cart[p.id], price: p.selling, ctn: p.ctn || 0
      })),
      total,
      payment,
      advance: advAmt,
      baki,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      status: 'pending',
    }
    localStorage.setItem('salesman_orders', JSON.stringify([...existing, order]))
    setSubmitted(true)
  }

  if (isLoadingShops || isLoadingProds) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#0ea5e9', animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Loading active products and shops...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', color: '#16a34a', marginBottom: '20px' }}>
          <i className="fa-solid fa-circle-check" />
        </div>
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '24px', color: '#1e293b', marginBottom: '8px' }}>Order Sent Successfully!</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>{selectedShop?.name} order has been submitted successfully.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => { setStep(0); setSelectedShop(null); setCart({}); setPayment('Paid'); setAdvance(''); setSubmitted(false); setShopSearch(''); setProdSearch(''); setSelCat('All') }}
            style={{ padding: '11px 24px', borderRadius: '10px', background: '#0ea5e9', color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            <i className="fa-solid fa-plus" style={{ marginRight: '7px' }} /> New Order
          </button>
          <button onClick={() => navigate('/salesman/history')}
            style={{ padding: '11px 24px', borderRadius: '10px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '7px' }} /> View History
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '22px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-cart-plus" style={{ color: '#0ea5e9' }} /> New Order
        </div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Select a shop, add products, and send the order</div>
      </div>

      <StepBar step={step} />

      {/* ── STEP 0: Shop Select ── */}
      {step === 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>
              <i className="fa-solid fa-store" style={{ color: '#0ea5e9', marginRight: '8px' }} />Select shop for this order
            </div>
            <button onClick={() => setShowNewCustomer(true)} style={{
              display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '9px',
              background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', border: 'none',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(14,165,233,.3)',
            }}>
              <i className="fa-solid fa-plus" /> New Customer
            </button>
          </div>

          {/* Shop Search */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
            <input value={shopSearch} onChange={e => setShopSearch(e.target.value)} placeholder="Search by shop name, owner or city..."
              style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
          </div>

          {filteredShops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <i className="fa-solid fa-store-slash" style={{ fontSize: '32px', marginBottom: '10px', display: 'block' }} />
              No shop found. Add a new customer.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '12px' }}>
              {filteredShops.map(shop => (
                <div key={shop.id} onClick={() => setSelectedShop(shop)} style={{
                  background: '#fff', border: `2px solid ${selectedShop?.id === shop.id ? '#0ea5e9' : '#e2e8f0'}`,
                  borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all .18s',
                  boxShadow: selectedShop?.id === shop.id ? '0 0 0 3px rgba(14,165,233,.15)' : '0 1px 3px rgba(0,0,0,.07)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: extraShops.find(e => e.id === shop.id) ? '#fef9c3' : '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: extraShops.find(e => e.id === shop.id) ? '#b45309' : '#0ea5e9', flexShrink: 0 }}>
                      <i className="fa-solid fa-store" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{shop.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{shop.owner} · {shop.city}</div>
                      {extraShops.find(e => e.id === shop.id) && (
                        <span style={{ fontSize: '10px', background: '#fef9c3', color: '#b45309', borderRadius: '4px', padding: '1px 6px', fontWeight: 700, marginTop: '3px', display: 'inline-block' }}>New</span>
                      )}
                    </div>
                    {selectedShop?.id === shop.id && (
                      <i className="fa-solid fa-circle-check" style={{ color: '#0ea5e9', fontSize: '18px', flexShrink: 0 }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button onClick={() => selectedShop && setStep(1)} style={{
              padding: '11px 28px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none',
              background: selectedShop ? '#0ea5e9' : '#e2e8f0', color: selectedShop ? '#fff' : '#94a3b8',
            }}>
              Next Step <i className="fa-solid fa-arrow-right" style={{ marginLeft: '7px' }} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Products ── */}
      {step === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>
              <i className="fa-solid fa-box-open" style={{ color: '#0ea5e9', marginRight: '8px' }} />
              Select Products — {selectedShop?.name}
            </div>
            {cartCount > 0 && (
              <span style={{ background: '#0ea5e9', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 }}>
                {cartCount} items selected
              </span>
            )}
          </div>

          {/* Search + Category */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '12px' }} />
              <input value={prodSearch} onChange={e => setProdSearch(e.target.value)} placeholder="Search products..."
                style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <select value={selCat} onChange={e => setSelCat(e.target.value)}
              style={{ padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '13px', outline: 'none', background: '#fff', cursor: 'pointer', fontWeight: selCat !== 'All' ? 700 : 400, color: selCat !== 'All' ? '#0ea5e9' : '#1e293b' }}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {filteredProds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
              <i className="fa-solid fa-box-open" style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }} />
              No products found
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '12px', marginBottom: '20px' }}>
              {filteredProds.map(p => {
                const qty = cart[p.id] || 0
                const outOfStock = p.stock === 0
                return (
                  <div key={p.id} style={{
                    background: '#fff', border: `1.5px solid ${qty > 0 ? '#0ea5e9' : '#e2e8f0'}`,
                    borderRadius: '12px', padding: '14px', opacity: outOfStock ? 0.55 : 1,
                    boxShadow: qty > 0 ? '0 0 0 2px rgba(14,165,233,.15)' : '0 1px 3px rgba(0,0,0,.06)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#1e293b' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{p.cat}</div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: outOfStock ? '#fee2e2' : p.stock <= p.threshold ? '#fef9c3' : '#dcfce7', color: outOfStock ? '#dc2626' : p.stock <= p.threshold ? '#b45309' : '#16a34a', flexShrink: 0 }}>
                        Stock: {p.stock}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '15px', color: '#0ea5e9' }}>{fmt(p.selling)}</div>
                      {outOfStock ? (
                        <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>Out of Stock</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => setQty(p.id, qty - 1)} style={{ width: '28px', height: '28px', borderRadius: '7px', background: qty > 0 ? '#fee2e2' : '#f1f5f9', color: qty > 0 ? '#dc2626' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                          <input
                            type="number" min={0} max={p.stock}
                            value={qty === 0 ? '' : qty}
                            onChange={e => setQty(p.id, e.target.value)}
                            placeholder="0"
                            style={{ width: '44px', textAlign: 'center', border: '1.5px solid #e2e8f0', borderRadius: '7px', padding: '5px', fontWeight: 700, fontSize: '14px', outline: 'none' }}
                          />
                          <button onClick={() => setQty(p.id, qty + 1)} style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#e0f2fe', color: '#0ea5e9', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        </div>
                      )}
                    </div>
                    {qty > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#6366f1', fontWeight: 600, textAlign: 'right' }}>
                        Subtotal: {fmt(qty * p.selling)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {cartCount > 0 && (
            <div style={{ background: '#1e293b', color: '#fff', borderRadius: '12px', padding: '14px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '14px' }}><i className="fa-solid fa-cart-shopping" style={{ marginRight: '8px' }} />{cartCount} items</span>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '20px' }}>Total: {fmt(total)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(0)} style={{ padding: '10px 20px', borderRadius: '10px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: '7px' }} /> Back
            </button>
            <button onClick={() => cartCount > 0 && setStep(2)} style={{
              padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none',
              background: cartCount > 0 ? '#0ea5e9' : '#e2e8f0', color: cartCount > 0 ? '#fff' : '#94a3b8',
            }}>
              Review Order <i className="fa-solid fa-arrow-right" style={{ marginLeft: '7px' }} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Review ── */}
      {step === 2 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '16px' }}>
            <i className="fa-solid fa-file-invoice" style={{ color: '#0ea5e9', marginRight: '8px' }} />
            Order Review — {selectedShop?.name}
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1.5px solid #e2e8f0', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
              <i className="fa-solid fa-box-open" style={{ marginRight: '8px', color: '#0ea5e9' }} /> Selected Products
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    {['#', 'Product', 'Qty', 'Unit Price', 'Total'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.filter(p => cart[p.id]).map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '11px 12px', color: '#94a3b8' }}>{i + 1}</td>
                      <td style={{ padding: '11px 12px', fontWeight: 600, color: '#1e293b' }}>{p.name}</td>
                      <td style={{ padding: '11px 12px', color: '#64748b', fontWeight: 700 }}>{cart[p.id]}</td>
                      <td style={{ padding: '11px 12px', color: '#64748b' }}>{fmt(p.selling)}</td>
                      <td style={{ padding: '11px 12px', color: '#0ea5e9', fontWeight: 700 }}>{fmt(cart[p.id] * p.selling)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', marginBottom: '14px' }}>
              <i className="fa-solid fa-credit-card" style={{ color: '#0ea5e9', marginRight: '8px' }} /> Payment Type
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              {['Paid', 'Udaar'].map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 20px', borderRadius: '10px', border: `2px solid ${payment === type ? '#0ea5e9' : '#e2e8f0'}`, background: payment === type ? '#e0f2fe' : '#fff', flex: 1, justifyContent: 'center' }}>
                  <input type="radio" value={type} checked={payment === type} onChange={() => { setPayment(type); setAdvance('') }} style={{ display: 'none' }} />
                  <i className={`fa-solid fa-${type === 'Paid' ? 'check-circle' : 'clock'}`} style={{ color: payment === type ? '#0ea5e9' : '#94a3b8' }} />
                  <span style={{ fontWeight: 700, fontSize: '14px', color: payment === type ? '#0ea5e9' : '#64748b' }}>{type}</span>
                </label>
              ))}
            </div>

            {payment === 'Udaar' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', display: 'block' }}>Advance Amount (Rs)</label>
                <input
                  type="number" min={0} max={total}
                  value={advance}
                  onChange={e => setAdvance(e.target.value)}
                  placeholder="0"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '14px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div style={{ background: '#f8fafc', borderRadius: '10px', overflow: 'hidden' }}>
              {payment === 'Udaar' && advAmt > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>Subtotal</span>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{fmt(total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>Advance Paid</span>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#10b981' }}>− {fmt(advAmt)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>Balance Due</span>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#ef4444' }}>{fmt(baki)}</span>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)' }}>
                <span style={{ color: 'rgba(255,255,255,.85)', fontSize: '14px', fontWeight: 700 }}>Grand Total</span>
                <span style={{ color: '#fff', fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '18px' }}>{fmt(total)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => setStep(1)} style={{ padding: '11px 22px', borderRadius: '10px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: '7px' }} /> Back
            </button>
            <button onClick={handleSubmit} style={{ padding: '11px 28px', borderRadius: '10px', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(14,165,233,.35)' }}>
              <i className="fa-solid fa-paper-plane" style={{ marginRight: '8px' }} /> Send Order
            </button>
          </div>
        </div>
      )}

      {showNewCustomer && <NewCustomerModal onClose={() => setShowNewCustomer(false)} onAdd={handleAddCustomer} />}
    </div>
  )
}
