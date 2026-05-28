import { useState, useMemo } from 'react'
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../../store/slices/productsApiSlice'
export const INITIAL_PRODUCTS = []

const CATEGORIES = [
  'Grains', 'Spices', 'Oil & Ghee', 'Snacks', 'Beverages',
  'Sweets', 'Cleaning', 'Personal Care', 'Packed Food',
  'Baby Products', 'Dairy', 'Frozen',
]

const fmt = n => '₨' + Number(n).toLocaleString('en-PK')

function getStatus(p) {
  if (p.stock === 0) return 'out'
  const thresh = p.threshold !== undefined && p.threshold !== null ? Number(p.threshold) : 10
  if (p.stock <= thresh) return 'low'
  return 'in-stock'
}

/* ─── Stat Card ─── */
function StatCard({ color, borderColor, iconBg, iconColor, icon, bgIcon, label, value, sub }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderTop: `3px solid ${borderColor}`,
      borderRadius: '14px', padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.07),0 4px 16px rgba(0,0,0,0.05)',
      transition: 'transform .2s,box-shadow .2s', cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07),0 4px 16px rgba(0,0,0,0.05)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', background: iconBg, color: iconColor }}>
          <i className={`fa-solid fa-${icon}`} />
        </div>
        <i className={`fa-solid fa-${bgIcon}`} style={{ color, fontSize: '16px', opacity: .35 }} />
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '28px', fontWeight: 900, lineHeight: 1, letterSpacing: '-.5px', color }}>{value}</div>
      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '3px' }}>{sub}</div>
    </div>
  )
}

/* ─── Product Card (Grid) ─── */
function ProductCard({ product, onEdit, onDelete }) {
  const st = getStatus(product)
  const pillStyle = {
    'in-stock': { background: '#dcfce7', color: '#16a34a' },
    low:        { background: '#fef9c3', color: '#b45309' },
    out:        { background: '#fee2e2', color: '#dc2626' },
  }[st]
  const pillLabel = st === 'in-stock' ? 'In Stock' : st === 'low' ? 'Low Stock' : 'Out of Stock'

  return (
    <div style={{
      border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px',
      background: '#f5f7fa', display: 'flex', flexDirection: 'column',
      transition: 'all .2s', position: 'relative',
      minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(14,165,233,.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = '' }}
    >
      {/* Icon area */}
      <div style={{
        width: '100%', height: '90px', borderRadius: '9px',
        background: 'linear-gradient(135deg,#e0f2fe 0%,#ede9fe 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '11px', position: 'relative',
      }}>
        <i className="fa-solid fa-box" style={{ fontSize: '36px', color: '#6366f1', opacity: .7 }} />
        <span style={{
          position: 'absolute', top: '7px', right: '7px',
          padding: '2px 9px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, ...pillStyle,
        }}>{pillLabel}</span>
      </div>

      <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={product.name}>
        {product.name}
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>
        <i className="fa-solid fa-tag" style={{ fontSize: '9px', marginRight: '3px', opacity: .6 }} />{product.cat}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
        {[
          { label: 'Purchase', val: fmt(product.purchase), color: '#6366f1', icon: 'arrow-down' },
          { label: 'Selling',  val: fmt(product.selling),  color: '#10b981', icon: 'arrow-up' },
        ].map(({ label, val, color, icon }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '6px 9px' }}>
            <div style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: '2px' }}>
              <i className={`fa-solid fa-${icon}`} style={{ fontSize: '8px', marginRight: '2px' }} />{label}
            </div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '13px', color }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}><i className="fa-solid fa-cubes" style={{ marginRight: '3px', opacity: .6 }} />Stock</span>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>{product.stock} pcs</span>
      </div>
      {product.ctn > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}><i className="fa-solid fa-box" style={{ marginRight: '3px', opacity: .6 }} />CTN</span>
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '13px', color: '#6366f1' }}>{product.ctn} pcs/ctn</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '5px', marginTop: 'auto' }}>
        <button onClick={() => onEdit(product)} style={{
          flex: 1, padding: '7px 0', borderRadius: '7px', border: 'none',
          background: '#e0f2fe', color: '#0369a1', fontSize: '11.5px', fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px',
          transition: 'background .18s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#bae6fd'}
          onMouseLeave={e => e.currentTarget.style.background = '#e0f2fe'}
        >
          <i className="fa-solid fa-pen-to-square" /> Edit / Stock
        </button>
        <button onClick={() => onDelete(product.id)} style={{
          padding: '7px 10px', borderRadius: '7px', border: 'none',
          background: '#fef2f2', color: '#dc2626', cursor: 'pointer',
          fontSize: '11.5px', transition: 'background .18s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
          onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
        >
          <i className="fa-solid fa-trash" />
        </button>
      </div>
    </div>
  )
}

/* ─── Table Row ─── */
function TableView({ products, onEdit, onDelete }) {
  const badgeStyle = {
    'in-stock': { background: '#dcfce7', color: '#16a34a' },
    low:        { background: '#fef9c3', color: '#b45309' },
    out:        { background: '#fee2e2', color: '#dc2626' },
  }
  const badgeLabel = { 'in-stock': 'In Stock', low: 'Low Stock', out: 'Out of Stock' }

  if (!products.length) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
        <i className="fa-solid fa-box-open" style={{ fontSize: '44px', marginBottom: '12px', display: 'block', opacity: .4 }} />
        No products found
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
        <thead>
          <tr>
            {['Product', 'Category', 'Purchase Price', 'Selling Price', 'Stock', 'Status', ''].map(h => (
              <th key={h} style={{ textAlign: h === '' ? 'right' : 'left', fontSize: '11px', color: '#94a3b8', padding: '0 10px 10px 0', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map(p => {
            const st = getStatus(p)
            return (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '11px 10px 11px 0', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg,#e0f2fe,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fa-solid fa-box" style={{ fontSize: '16px', color: '#6366f1', opacity: .75 }} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                  </div>
                </td>
                <td style={{ padding: '11px 10px 11px 0', fontSize: '12px', color: '#94a3b8' }}>{p.cat}</td>
                <td style={{ padding: '11px 10px 11px 0' }}><span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '13px', color: '#6366f1' }}>{fmt(p.purchase)}</span></td>
                <td style={{ padding: '11px 10px 11px 0' }}><span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '13px', color: '#10b981' }}>{fmt(p.selling)}</span></td>
                <td style={{ padding: '11px 10px 11px 0' }}><span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '14px' }}>{p.stock}</span></td>
                <td style={{ padding: '11px 10px 11px 0' }}>
                  <span style={{ padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, ...badgeStyle[st] }}>{badgeLabel[st]}</span>
                </td>
                <td style={{ padding: '11px 0' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    {[
                      { cls: 'edit', icon: 'pen-to-square', bg: '#e0f2fe', color: '#0369a1', hov: '#bae6fd', action: () => onEdit(p) },
                      { cls: 'del',  icon: 'trash',          bg: '#fef2f2', color: '#dc2626', hov: '#fee2e2', action: () => onDelete(p.id) },
                    ].map(({ cls, icon, bg, color, hov, action }) => (
                      <button key={cls} onClick={action} style={{ width: '28px', height: '28px', borderRadius: '7px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', cursor: 'pointer', background: bg, color, transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = hov}
                        onMouseLeave={e => e.currentTarget.style.background = bg}
                      >
                        <i className={`fa-solid fa-${icon}`} />
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Modal ─── */
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
        backdropFilter: 'blur(4px)', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '26px',
        width: '100%', maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0,0,0,.15)',
        animation: 'modalIn .22s ease',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {title}
        {children}
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);}}`}</style>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 13px',
  border: '1.5px solid #e2e8f0', borderRadius: '9px',
  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px',
  color: '#1e293b', background: '#f5f7fa', outline: 'none',
  transition: 'border-color .2s',
}
const labelStyle = { fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'block' }

function FieldInput({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

/* ─── ADD MODAL ─── */
function AddModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', cat: '', purchase: '', selling: '', stock: '', threshold: '10', ctn: '' })
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = () => {
    if (!form.name.trim() || !form.cat) { setError('Product name and category are required.'); return }
    onAdd({
      name: form.name.trim(), cat: form.cat,
      purchase:  parseInt(form.purchase)  || 0,
      selling:   parseInt(form.selling)   || 0,
      stock:     parseInt(form.stock)     || 0,
      threshold: parseInt(form.threshold) || 10,
      ctn:       parseInt(form.ctn)       || 0,
    })
    setForm({ name: '', cat: '', purchase: '', selling: '', stock: '', threshold: '10', ctn: '' })
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '18px' }}>
          <i className="fa-solid fa-box" style={{ color: '#0ea5e9', marginRight: '8px' }} />Add New Product
        </div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Enter product details to add to inventory</div>
      </div>
    }>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 13px', fontSize: '13px', color: '#dc2626', marginBottom: '14px', fontWeight: 600 }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
        <div style={{ gridColumn: '1/-1' }}>
          <FieldInput label="Product Name">
            <input style={inputStyle} type="text" placeholder="e.g. Basmati Rice 5kg" value={form.name} onChange={e => set('name', e.target.value)}
              onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)' }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f5f7fa'; e.target.style.boxShadow = 'none' }}
            />
          </FieldInput>
        </div>
        <FieldInput label="Category">
          <select style={inputStyle} value={form.cat} onChange={e => set('cat', e.target.value)}>
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </FieldInput>
        <FieldInput label="Low Stock Alert (qty)">
          <input style={inputStyle} type="number" min="1" placeholder="10" value={form.threshold} onChange={e => set('threshold', e.target.value)} />
        </FieldInput>
        <FieldInput label="Purchase Price (₨)">
          <input style={inputStyle} type="number" min="0" placeholder="0" value={form.purchase} onChange={e => set('purchase', e.target.value)} />
        </FieldInput>
        <FieldInput label="Selling Price (₨)">
          <input style={inputStyle} type="number" min="0" placeholder="0" value={form.selling} onChange={e => set('selling', e.target.value)} />
        </FieldInput>
        <FieldInput label="CTN (Carton qty)">
          <input style={inputStyle} type="number" min="0" placeholder="e.g. 12" value={form.ctn} onChange={e => set('ctn', e.target.value)} />
        </FieldInput>
        <div style={{ gridColumn: '1/-1' }}>
          <FieldInput label="Initial Stock (qty)">
            <input style={inputStyle} type="number" min="0" placeholder="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
          </FieldInput>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '9px', marginTop: '6px' }}>
        <button onClick={handleAdd} style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', background: '#10b981', color: '#fff', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', transition: 'background .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#059669'}
          onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
        >
          <i className="fa-solid fa-plus" style={{ marginRight: '5px' }} />Add Product
        </button>
        <button onClick={onClose} style={{ padding: '11px 18px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </Modal>
  )
}

/* ─── EDIT MODAL ─── */
function EditModal({ isOpen, onClose, product, onSave }) {
  const [form, setForm] = useState({})
  const [stockQty, setStockQty] = useState('')
  const [curStock, setCurStock] = useState(0)

  // Reset when product changes
  const prevId = form.id
  if (product && product.id !== prevId) {
    setForm({ ...product })
    setCurStock(product.stock)
    setStockQty('')
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const applyStock = (action) => {
    const qty = parseInt(stockQty)
    if (!qty || qty <= 0) return
    if (action === 'add') {
      setCurStock(s => s + qty)
      setForm(f => ({ ...f, stock: f.stock + qty }))
    } else {
      if (qty > curStock) { alert(`Cannot reduce more than current stock (${curStock})`); return }
      setCurStock(s => s - qty)
      setForm(f => ({ ...f, stock: f.stock - qty }))
    }
    setStockQty('')
  }

  const handleSave = () => {
    if (!form.name?.trim() || !form.cat) { alert('Name and category required.'); return }
    onSave({ ...form, purchase: parseInt(form.purchase) || 0, selling: parseInt(form.selling) || 0, threshold: parseInt(form.threshold) || 10 })
    onClose()
  }

  if (!product) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '18px' }}>
          <i className="fa-solid fa-box" style={{ color: '#6366f1', marginRight: '8px' }} />Edit Product
        </div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Editing: {product.name}</div>
      </div>
    }>
      {/* Stock Control */}
      <div style={{ background: '#f5f7fa', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '10px' }}>
          <i className="fa-solid fa-cubes" style={{ marginRight: '5px' }} />Stock Control
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Current Stock:</span>
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '22px', color: '#1e293b' }}>{curStock}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input style={{ ...inputStyle, flex: 1 }} type="number" min="1" placeholder="Qty" value={stockQty} onChange={e => setStockQty(e.target.value)} />
          {[
            { label: 'Add Stock', icon: 'plus', action: 'add', bg: '#dcfce7', color: '#16a34a', hov: '#bbf7d0' },
            { label: 'Reduce',    icon: 'minus', action: 'sub', bg: '#fee2e2', color: '#dc2626', hov: '#fecaca' },
          ].map(({ label, icon, action, bg, color, hov }) => (
            <button key={action} onClick={() => applyStock(action)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: bg, color, fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background .18s' }}
              onMouseEnter={e => e.currentTarget.style.background = hov}
              onMouseLeave={e => e.currentTarget.style.background = bg}
            >
              <i className={`fa-solid fa-${icon}`} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Edit Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
        <div style={{ gridColumn: '1/-1' }}>
          <FieldInput label="Product Name">
            <input style={inputStyle} type="text" value={form.name || ''} onChange={e => set('name', e.target.value)} />
          </FieldInput>
        </div>
        <FieldInput label="Category">
          <select style={inputStyle} value={form.cat || ''} onChange={e => set('cat', e.target.value)}>
            <option value="">Select</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </FieldInput>
        <FieldInput label="Low Stock Alert">
          <input style={inputStyle} type="number" min="1" value={form.threshold || ''} onChange={e => set('threshold', e.target.value)} />
        </FieldInput>
        <FieldInput label="Purchase Price (₨)">
          <input style={inputStyle} type="number" min="0" value={form.purchase || ''} onChange={e => set('purchase', e.target.value)} />
        </FieldInput>
        <FieldInput label="Selling Price (₨)">
          <input style={inputStyle} type="number" min="0" value={form.selling || ''} onChange={e => set('selling', e.target.value)} />
        </FieldInput>
        <FieldInput label="CTN (Carton qty)">
          <input style={inputStyle} type="number" min="0" placeholder="e.g. 12" value={form.ctn || ''} onChange={e => set('ctn', parseInt(e.target.value) || 0)} />
        </FieldInput>
      </div>

      <div style={{ display: 'flex', gap: '9px', marginTop: '6px' }}>
        <button onClick={handleSave} style={{ flex: 1, padding: '11px', borderRadius: '9px', border: 'none', background: '#0ea5e9', color: '#fff', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', transition: 'background .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
          onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
        >
          <i className="fa-solid fa-check" style={{ marginRight: '5px' }} />Save Changes
        </button>
        <button onClick={onClose} style={{ padding: '11px 18px', borderRadius: '9px', border: '1px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </Modal>
  )
}

/* ─── MAIN COMPONENT ─── */
export default function ProductManagement() {
  const { data: products = [], isLoading, isError, refetch } = useGetProductsQuery()
  const [createProduct] = useCreateProductMutation()
  const [updateProduct] = useUpdateProductMutation()
  const [deleteProduct] = useDeleteProductMutation()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('grid')
  const [sort, setSort] = useState('name')
  const [showAdd, setShowAdd] = useState(false)
  const [editProduct, setEditProduct] = useState(null)

  const counts = useMemo(() => ({
    total:   products.length,
    instock: products.filter(p => getStatus(p) === 'in-stock').length,
    low:     products.filter(p => getStatus(p) === 'low').length,
    out:     products.filter(p => getStatus(p) === 'out').length,
  }), [products])

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const matchFilter = filter === 'all' || getStatus(p) === filter
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.cat.toLowerCase().includes(search.toLowerCase())
      return matchFilter && matchSearch
    })
    if (sort === 'name')    list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'price-h') list = [...list].sort((a, b) => b.selling - a.selling)
    if (sort === 'price-l') list = [...list].sort((a, b) => a.selling - b.selling)
    if (sort === 'stock-l') list = [...list].sort((a, b) => a.stock - b.stock)
    return list
  }, [products, search, filter, sort])

  const handleAdd = async (data) => {
    try {
      await createProduct(data).unwrap()
    } catch (err) {
      console.error('Failed to create product:', err)
      alert('Product add karne mein masla hua.')
    }
  }

  const handleSave = async (updated) => {
    try {
      await updateProduct({ id: updated.id, ...updated }).unwrap()
    } catch (err) {
      console.error('Failed to update product:', err)
      alert('Product update karne mein masla hua.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    try {
      await deleteProduct(id).unwrap()
    } catch (err) {
      console.error('Failed to delete product:', err)
      alert('Product delete karne mein masla hua.')
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#64748b' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '40px', color: '#0ea5e9', marginBottom: '16px' }} />
        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '17px', color: '#1e293b' }}>Loading Inventory...</div>
        <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>Connecting to database, please wait</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#dc2626', background: '#fff', borderRadius: '14px', border: '1px solid #fee2e2', maxWidth: '500px', margin: '40px auto' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '44px', marginBottom: '16px', color: '#ef4444' }} />
        <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b', marginBottom: '8px' }}>Failed to Load Inventory</div>
        <div style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '20px' }}>
          An error occurred while establishing a secure link with the warehouse service.
        </div>
        <button onClick={refetch} style={{ padding: '9px 24px', borderRadius: '8px', background: '#0ea5e9', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', boxShadow: '0 2px 8px rgba(14,165,233,.2)' }}>
          Retry Connection
        </button>
      </div>
    )
  }

  const statsConfig = [
    { color: '#0ea5e9', borderColor: '#0ea5e9', iconBg: '#e0f2fe', iconColor: '#0ea5e9', icon: 'boxes-stacked', bgIcon: 'layer-group', label: 'Total Products', value: counts.total, sub: 'All registered items' },
    { color: '#10b981', borderColor: '#10b981', iconBg: '#d1fae5', iconColor: '#10b981', icon: 'circle-check',  bgIcon: 'check-double', label: 'In Stock',       value: counts.instock, sub: 'Ready to sell' },
    { color: '#f59e0b', borderColor: '#f59e0b', iconBg: '#fef3c7', iconColor: '#f59e0b', icon: 'triangle-exclamation', bgIcon: 'arrow-down', label: 'Low Stock', value: counts.low, sub: 'Reorder soon' },
    { color: '#ef4444', borderColor: '#ef4444', iconBg: '#fee2e2', iconColor: '#ef4444', icon: 'circle-xmark',  bgIcon: 'ban',          label: 'Out of Stock',  value: counts.out, sub: 'Urgent restock' },
  ]

  const filterBtns = [
    { key: 'all',      label: 'All',      icon: 'border-all',           iconColor: '' },
    { key: 'in-stock', label: 'In Stock', icon: 'circle-check',         iconColor: '#10b981' },
    { key: 'low',      label: 'Low',      icon: 'triangle-exclamation', iconColor: '#f59e0b' },
    { key: 'out',      label: 'Out',      icon: 'circle-xmark',         iconColor: '#ef4444' },
  ]

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '18px' }} className="pm-stats">
        {statsConfig.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Toolbar */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
          <input
            type="text" placeholder="Search by name or category..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #e2e8f0', borderRadius: '9px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', background: '#f5f7fa', color: '#1e293b', outline: 'none' }}
            onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)'; e.target.style.background = '#fff' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f5f7fa' }}
          />
        </div>

        {/* Add button */}
        <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#0ea5e9', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '9px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(14,165,233,.3)', whiteSpace: 'nowrap' }}>
          <i className="fa-solid fa-plus" /> Add Product
        </button>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {filterBtns.map(({ key, label, icon, iconColor }) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{
                padding: '7px 13px', borderRadius: '8px', cursor: 'pointer',
                border: `1px solid ${filter === key ? '#0ea5e9' : '#e2e8f0'}`,
                background: filter === key ? '#0ea5e9' : '#f5f7fa',
                color: filter === key ? '#fff' : '#64748b',
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '12.5px', fontWeight: filter === key ? 600 : 500,
                transition: 'all .18s', whiteSpace: 'nowrap',
              }}
            >
              <i className={`fa-solid fa-${icon}`} style={{ fontSize: '11px', marginRight: '4px', color: filter === key ? '#fff' : iconColor || 'inherit' }} />
              {label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: '2px', background: '#f5f7fa', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {[{ v: 'grid', icon: 'grip' }, { v: 'list', icon: 'list' }].map(({ v, icon }) => (
            <button key={v} onClick={() => setView(v)}
              style={{
                padding: '6px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px',
                background: view === v ? '#fff' : 'none',
                color: view === v ? '#0ea5e9' : '#94a3b8',
                boxShadow: view === v ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                transition: 'all .18s',
              }}
            >
              <i className={`fa-solid fa-${icon}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '15px' }}>All Products</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}</div>
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '12px', color: '#1e293b', background: '#f5f7fa', outline: 'none', cursor: 'pointer' }}>
            <option value="name">Sort: Name A–Z</option>
            <option value="price-h">Price: High–Low</option>
            <option value="price-l">Price: Low–High</option>
            <option value="stock-l">Stock: Low First</option>
          </select>
        </div>

        {view === 'grid' ? (
          filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
              <i className="fa-solid fa-box-open" style={{ fontSize: '44px', marginBottom: '12px', display: 'block', opacity: .4 }} />
              No products found
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px' }} className="pm-grid">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} onEdit={setEditProduct} onDelete={handleDelete} />
              ))}
            </div>
          )
        ) : (
          <TableView products={filtered} onEdit={setEditProduct} onDelete={handleDelete} />
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '14px 0 4px', color: '#94a3b8', fontSize: '12px' }}>
        WholesalePro Management System © 2026
      </div>

      <AddModal isOpen={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      <EditModal isOpen={!!editProduct} onClose={() => setEditProduct(null)} product={editProduct} onSave={handleSave} />

      <style>{`
        @media(max-width:1100px){ .pm-stats{ grid-template-columns: repeat(2,1fr) !important; } }
        @media(max-width:768px){
          .pm-stats{ grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .pm-grid{ grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }
          .pm-header-row{ flex-direction: column !important; align-items: flex-start !important; }
          .pm-search-row{ flex-wrap: wrap !important; }
          .pm-search-row > div:first-child { min-width: 100% !important; }
        }
        @media(max-width:480px){
          .pm-grid{ grid-template-columns: repeat(2,1fr) !important; gap: 8px !important; }
          .pm-stats{ grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width:360px){
          .pm-grid{ grid-template-columns: 1fr !important; }
        }
        .pm-grid > div { min-width: 0; max-width: 100%; box-sizing: border-box; }
      `}</style>
    </div>
  )
}
