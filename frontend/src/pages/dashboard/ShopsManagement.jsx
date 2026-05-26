import { useState, useMemo } from 'react'
import {
  useGetShopsQuery,
  useCreateShopMutation,
  useUpdateShopMutation,
  useDeleteShopMutation,
} from '../../store/slices/shopsApiSlice';

/* ─── Initial Data (compatibility export) ─── */
export const INITIAL_SHOPS = [];

/* ─── Stat Card ─── */
function StatCard({ borderColor, iconBg, iconColor, icon, bgIcon, bgIconColor, label, value, sub }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderTop: `3px solid ${borderColor}`,
      borderRadius: '14px', padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)',
      transition: 'transform .2s,box-shadow .2s', cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)' }}
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

/* ─── Shop Card ─── */
function ShopCard({ shop, onView, onEdit, onToggleBlock, onDelete }) {
  const isActive = shop.status === 'active'
  const stripColor = isActive ? '#10b981' : '#ef4444'
  const pillStyle = isActive
    ? { background: '#dcfce7', color: '#16a34a' }
    : { background: '#fee2e2', color: '#dc2626' }

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #e2e8f0',
      borderRadius: '14px', overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)',
      transition: 'all .22s',
      opacity: isActive ? 1 : 0.8,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.1)'; e.currentTarget.style.borderColor = '#cbd5e1' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)'; e.currentTarget.style.borderColor = '#e2e8f0' }}
    >
      {/* Color Strip */}
      <div style={{ height: '4px', background: stripColor }} />

      <div style={{ padding: '16px' }}>
        {/* Head */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', gap: '10px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '11px', background: 'linear-gradient(135deg,#e0f2fe,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px', color: '#6366f1' }}>
            <i className="fa-solid fa-store" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '15px', color: '#1e293b', lineHeight: 1.2, marginBottom: '3px' }}>{shop.name}</div>
            <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <i className="fa-solid fa-user" style={{ fontSize: '10px', color: '#94a3b8' }} />{shop.owner}
            </div>
          </div>
          <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, flexShrink: 0, ...pillStyle }}>
            <i className={`fa-solid ${isActive ? 'fa-circle-check' : 'fa-ban'}`} style={{ fontSize: '9px', marginRight: '3px' }} />
            {isActive ? 'Active' : 'Blocked'}
          </span>
        </div>

        {/* Info Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
          {[
            { icon: 'fa-phone',        text: shop.phone },
            { icon: 'fa-id-card',      text: <><strong>CNIC:</strong> {shop.cnic || '—'}</> },
            { icon: 'fa-location-dot', text: <><strong>Address:</strong> {shop.address || '—'}</> },
            { icon: 'fa-city',         text: <><strong>City:</strong> {shop.city || '—'}</> },
            { icon: 'fa-regular fa-calendar', text: <><strong>Created:</strong> {shop.created || '—'}</> },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#475569' }}>
              <i className={`fa-solid ${row.icon}`} style={{ width: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '1px', flexShrink: 0 }} />
              <span style={{ lineHeight: 1.4 }}>{row.text}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 0' }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <ActionBtn onClick={() => onView(shop)} bg="#f1f5f9" color="#475569" hoverBg="#e2e8f0" icon="fa-eye" label="View" />
          <ActionBtn onClick={() => onEdit(shop)} bg="#e0f2fe" color="#0369a1" hoverBg="#bae6fd" icon="fa-pen-to-square" label="Edit" />
          {isActive
            ? <ActionBtn onClick={() => onToggleBlock(shop)} bg="#fef9c3" color="#b45309" hoverBg="#fef08a" icon="fa-ban" label="Block" />
            : <ActionBtn onClick={() => onToggleBlock(shop)} bg="#dcfce7" color="#16a34a" hoverBg="#bbf7d0" icon="fa-circle-check" label="Unblock" />
          }
          <ActionBtn onClick={() => onDelete(shop)} bg="#fee2e2" color="#dc2626" hoverBg="#fecaca" icon="fa-trash" label="Delete" />
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ onClick, bg, color, hoverBg, icon, label }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: '7px 11px', borderRadius: '8px', border: 'none',
      fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '12px', fontWeight: 600,
      cursor: 'pointer', background: bg, color, transition: 'all .18s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.background = bg; e.currentTarget.style.transform = '' }}
    >
      <i className={`fa-solid ${icon}`} style={{ fontSize: '11px' }} /> {label}
    </button>
  )
}

/* ─── Modal ─── */
function Modal({ show, onClose, children }) {
  if (!show) return null
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
        backdropFilter: 'blur(4px)', zIndex: 2000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px', overflowY: 'auto',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '26px',
        width: '100%', maxWidth: '500px',
        boxShadow: '0 24px 64px rgba(0,0,0,.18)',
        animation: 'shopMIn .22s ease', margin: 'auto',
      }}>
        <style>{`@keyframes shopMIn{from{opacity:0;transform:scale(.95) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);}}`}</style>
        {children}
      </div>
    </div>
  )
}

function ModalInput({ label, icon, ...props }) {
  return (
    <div>
      <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>
        <i className={`fa-solid fa-${icon}`} style={{ marginRight: '4px' }} />{label}
      </label>
      <input style={{
        width: '100%', padding: '10px 13px',
        border: '1.5px solid #e2e8f0', borderRadius: '9px',
        fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', color: '#1e293b',
        background: '#f5f7fa', outline: 'none', transition: 'border-color .2s',
      }}
        onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)' }}
        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none' }}
        {...props}
      />
    </div>
  )
}

/* ─── Main Component ─── */
export default function ShopsManagement() {
  const { data: shops = [], isLoading, isError, refetch } = useGetShopsQuery();
  const [createShop] = useCreateShopMutation();
  const [updateShop] = useUpdateShopMutation();
  const [deleteShop] = useDeleteShopMutation();

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  // Add/Edit Modal
  const [shopModal, setShopModal] = useState(false)
  const [editShop, setEditShop] = useState(null) // null = add mode
  const [form, setForm] = useState({ name: '', owner: '', phone: '', cnic: '', address: '', city: '', status: 'active' })
  const [formError, setFormError] = useState('')

  // View Modal
  const [viewModal, setViewModal] = useState(false)
  const [viewShopData, setViewShopData] = useState(null)

  /* ── Filtered shops ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return shops.filter(s => {
      const matchFilter = filter === 'all' || s.status === filter
      const matchQ = !q || s.name.toLowerCase().includes(q) || s.owner.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.phone.includes(q)
      return matchFilter && matchQ
    })
  }, [shops, search, filter])

  const totalShops   = shops.length
  const activeShops  = shops.filter(s => s.status === 'active').length
  const blockedShops = shops.filter(s => s.status === 'blocked').length

  /* ── Handlers ── */
  function openAdd() {
    setEditShop(null)
    setForm({ name: '', owner: '', phone: '', cnic: '', address: '', city: '', status: 'active' })
    setFormError('')
    setShopModal(true)
  }

  function openEdit(shop) {
    setEditShop(shop)
    setForm({ name: shop.name, owner: shop.owner, phone: shop.phone, cnic: shop.cnic || '', address: shop.address || '', city: shop.city || '', status: shop.status })
    setFormError('')
    setShopModal(true)
  }

  function openView(shop) {
    setViewShopData(shop)
    setViewModal(true)
  }

  async function confirmShop() {
    if (!form.name.trim() || !form.owner.trim() || !form.phone.trim()) {
      setFormError('Shop name, owner name and phone are required.')
      return
    }
    setFormError('')
    try {
      if (editShop) {
        await updateShop({ id: editShop.id, ...form }).unwrap();
      } else {
        await createShop(form).unwrap();
      }
      setShopModal(false)
    } catch (err) {
      console.error(err)
      setFormError(err?.data?.message || 'Error occurred while saving customer shop.')
    }
  }

  async function toggleBlock(shop) {
    const action = shop.status === 'active' ? 'block' : 'unblock'
    if (!confirm(`Are you sure you want to ${action} "${shop.name}"?`)) return
    try {
      const nextStatus = shop.status === 'active' ? 'blocked' : 'active';
      await updateShop({ id: shop.id, status: nextStatus }).unwrap();
      if (viewShopData?.id === shop.id) {
        setViewShopData(prev => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      console.error(err)
      alert('Error updating status.')
    }
  }

  async function handleDeleteShop(shop) {
    if (!confirm(`Delete "${shop.name}"? This cannot be undone.`)) return
    try {
      await deleteShop(shop.id).unwrap();
      if (viewShopData?.id === shop.id) {
        setViewModal(false)
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting shop.')
    }
  }

  const filterBtns = [
    { key: 'all',     label: 'All',     icon: 'border-all' },
    { key: 'active',  label: 'Active',  icon: 'circle-check', iconColor: '#10b981' },
    { key: 'blocked', label: 'Blocked', icon: 'ban',          iconColor: '#ef4444' },
  ]

  // Loading state UI
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '14px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#0ea5e9', animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Shops load ho rahi hain...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    )
  }

  // Error state UI
  if (isError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '14px' }}>
        <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '48px', color: '#ef4444' }} />
        <div style={{ fontSize: '15px', color: '#dc2626', fontWeight: 700 }}>Shops load karne mein error aaya</div>
        <button onClick={refetch} style={{ padding: '9px 18px', borderRadius: '9px', background: '#0ea5e9', color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
            <i className="fa-solid fa-store" style={{ color: '#0ea5e9' }} />
            Shops Management
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Manage all registered shops and their details</div>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: '#0ea5e9', color: '#fff', border: 'none',
          padding: '10px 20px', borderRadius: '10px',
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 2px 10px rgba(14,165,233,.3)', transition: 'all .2s',
          whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#0284c7'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0ea5e9'; e.currentTarget.style.transform = '' }}
        >
          <i className="fa-solid fa-plus" /> Add Shop
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }} className="sm-stats">
        <StatCard borderColor="#0ea5e9" iconBg="#e0f2fe" iconColor="#0ea5e9" icon="store"        bgIcon="layer-group"  bgIconColor="#0ea5e9" label="Total Shops"   value={totalShops}   sub="All registered" />
        <StatCard borderColor="#10b981" iconBg="#d1fae5" iconColor="#10b981" icon="circle-check" bgIcon="signal"       bgIconColor="#10b981" label="Active Shops"  value={activeShops}  sub="Currently active" />
        <StatCard borderColor="#ef4444" iconBg="#fee2e2" iconColor="#ef4444" icon="ban"          bgIcon="lock"         bgIconColor="#ef4444" label="Blocked Shops" value={blockedShops} sub="Access restricted" />
      </div>
      <style>{`@media(max-width:768px){.sm-stats{grid-template-columns:repeat(2,1fr) !important;}}`}</style>

      {/* Toolbar */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px',
        padding: '13px 16px', display: 'flex', alignItems: 'center', gap: '10px',
        flexWrap: 'wrap', marginBottom: '18px',
        boxShadow: '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
          <input
            type="text"
            placeholder="Search by shop name, owner, city or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 34px',
              border: '1px solid #e2e8f0', borderRadius: '9px',
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px',
              background: '#f5f7fa', color: '#1e293b', outline: 'none',
              transition: 'border-color .2s,box-shadow .2s',
            }}
            onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)'; e.target.style.background = '#fff' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f5f7fa' }}
          />
        </div>

        {/* Add button (toolbar) */}
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: '#0ea5e9', color: '#fff', border: 'none',
          padding: '9px 16px', borderRadius: '10px',
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 700,
          cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
          onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
        >
          <i className="fa-solid fa-plus" /> Add Shop
        </button>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {filterBtns.map(({ key, label, icon, iconColor }) => {
            const isActive = filter === key
            return (
              <button key={key} onClick={() => setFilter(key)} style={{
                padding: '7px 13px', borderRadius: '8px',
                border: `1px solid ${isActive ? '#0ea5e9' : '#e2e8f0'}`,
                background: isActive ? '#0ea5e9' : '#f5f7fa',
                color: isActive ? '#fff' : '#64748b',
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '12.5px',
                fontWeight: isActive ? 600 : 500, cursor: 'pointer',
                transition: 'all .18s', whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.color = '#0ea5e9'; e.currentTarget.style.background = '#f0f9ff' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#f5f7fa' } }}
              >
                <i className={`fa-solid fa-${icon}`} style={{ fontSize: '11px', marginRight: '3px', color: isActive ? '#fff' : iconColor }} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results Label */}
      <div style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '14px' }}>
        Showing <strong style={{ color: '#1e293b' }}>{filtered.length}</strong> shop{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Shops Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <i className="fa-solid fa-store-slash" style={{ fontSize: '48px', marginBottom: '14px', display: 'block', opacity: .3 }} />
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: '#64748b' }}>No shops found</div>
          <div style={{ fontSize: '13px' }}>Try a different filter or search term</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '16px' }}>
          {filtered.map(shop => (
            <ShopCard
              key={shop.id}
              shop={shop}
              onView={openView}
              onEdit={openEdit}
              onToggleBlock={toggleBlock}
              onDelete={handleDeleteShop}
            />
          ))}
        </div>
      )}

      {/* ═══ ADD / EDIT MODAL ═══ */}
      <Modal show={shopModal} onClose={() => setShopModal(false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '19px' }}>
            {editShop ? 'Edit Shop' : 'Add New Shop'}
          </div>
          <button onClick={() => setShopModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px', padding: '4px', borderRadius: '6px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f7fa'; e.currentTarget.style.color = '#1e293b' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '18px' }}>
          {editShop ? 'Update shop details below' : 'Fill in shop details below'}
        </div>

        {formError && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', fontWeight: 600 }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }} />{formError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <ModalInput label="Shop Name" icon="store" placeholder="e.g. Hassan Electronics Store" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <ModalInput label="Owner Name" icon="user" placeholder="e.g. Ali Hassan" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
          <ModalInput label="Phone Number" icon="phone" placeholder="+92 300 1234567" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          <div style={{ gridColumn: '1/-1' }}>
            <ModalInput label="CNIC" icon="id-card" placeholder="42101-1234567-1" value={form.cnic} onChange={e => setForm(p => ({ ...p, cnic: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <ModalInput label="Address" icon="location-dot" placeholder="e.g. Main Market, Mall Road" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          </div>
          <ModalInput label="City" icon="city" placeholder="e.g. Lahore" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: '4px' }} />Status
            </label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{
              width: '100%', padding: '10px 13px',
              border: '1.5px solid #e2e8f0', borderRadius: '9px',
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', color: '#1e293b',
              background: '#f5f7fa', outline: 'none',
            }}>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '9px', marginTop: '20px' }}>
          <button onClick={confirmShop} style={{
            flex: 1, padding: '11px', borderRadius: '9px', border: 'none',
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 700,
            cursor: 'pointer', background: '#0ea5e9', color: '#fff', transition: 'all .2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
            onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
          >
            <i className={`fa-solid ${editShop ? 'fa-check' : 'fa-plus'}`} style={{ marginRight: '5px' }} />
            {editShop ? 'Save Changes' : 'Add Shop'}
          </button>
          <button onClick={() => setShopModal(false)} style={{
            padding: '11px 18px', borderRadius: '9px', border: '1px solid #e2e8f0',
            background: '#f5f7fa', color: '#64748b',
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f5f7fa'}
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* ═══ VIEW MODAL ═══ */}
      <Modal show={viewModal} onClose={() => setViewModal(false)}>
        {viewShopData && (() => {
          const s = viewShopData
          const isActive = s.status === 'active'
          return (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '19px' }}>{s.name}</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, marginTop: '6px', background: isActive ? '#dcfce7' : '#fee2e2', color: isActive ? '#16a34a' : '#dc2626' }}>
                    <i className={`fa-solid ${isActive ? 'fa-circle-check' : 'fa-ban'}`} style={{ fontSize: '9px' }} />
                    {isActive ? 'Active' : 'Blocked'}
                  </span>
                </div>
                <button onClick={() => setViewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px', padding: '4px', borderRadius: '6px' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5f7fa'; e.currentTarget.style.color = '#1e293b' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8' }}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {[
                  { label: 'Owner', icon: 'user', val: s.owner, full: false },
                  { label: 'Phone', icon: 'phone', val: s.phone, full: false },
                  { label: 'CNIC', icon: 'id-card', val: s.cnic, full: true },
                  { label: 'Address', icon: 'location-dot', val: s.address, full: true },
                  { label: 'City', icon: 'city', val: s.city, full: false },
                  { label: 'Created', icon: 'calendar', val: s.created, full: false },
                ].map(({ label, icon, val, full }) => (
                  <div key={label} style={{ background: '#f5f7fa', borderRadius: '10px', padding: '11px 13px', gridColumn: full ? '1/-1' : undefined }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>
                      <i className={`fa-solid fa-${icon}`} style={{ marginRight: '4px' }} />{label}
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>{val || '—'}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => { setViewModal(false); openEdit(s) }} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 16px', borderRadius: '8px', border: 'none',
                  background: '#e0f2fe', color: '#0369a1',
                  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#bae6fd'}
                  onMouseLeave={e => e.currentTarget.style.background = '#e0f2fe'}
                >
                  <i className="fa-solid fa-pen-to-square" /> Edit
                </button>
                <button onClick={() => setViewModal(false)} style={{
                  padding: '9px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                  background: '#f5f7fa', color: '#64748b',
                  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f5f7fa'}
                >
                  Close
                </button>
              </div>
            </>
          )
        })()}
      </Modal>
    </div>
  )
}
