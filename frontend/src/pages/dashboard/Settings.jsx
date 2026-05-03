import { useState, useRef } from 'react'

/* ══════════════════════════════════════
   CONSTANTS
══════════════════════════════════════ */
const ACCENT2      = '#6366f1'
const ACCENT       = '#0ea5e9'
const SUCCESS      = '#10b981'
const CARD_SHADOW  = '0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.05)'

/* ══════════════════════════════════════
   REUSABLE SMALL COMPONENTS
══════════════════════════════════════ */

function FLabel({ icon, children }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
      <i className={`fa-solid fa-${icon}`} style={{ fontSize: '10px' }} />{children}
    </div>
  )
}

function FInput({ type = 'text', value, onChange, placeholder, children, hint, full, style = {} }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={full ? { gridColumn: '1/-1' } : {}}>
      {children}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 13px',
          border: `1.5px solid ${focused ? ACCENT2 : '#e2e8f0'}`,
          borderRadius: '9px',
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px',
          color: '#1e293b', background: focused ? '#fff' : '#f5f7fa',
          outline: 'none', transition: 'all .2s',
          boxShadow: focused ? '0 0 0 3px rgba(99,102,241,.1)' : 'none',
          ...style,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {hint && <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>{hint}</div>}
    </div>
  )
}

function FSelect({ value, onChange, children, full }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={full ? { gridColumn: '1/-1' } : {}}>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%', padding: '10px 13px',
          border: `1.5px solid ${focused ? ACCENT2 : '#e2e8f0'}`,
          borderRadius: '9px',
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px',
          color: '#1e293b', background: focused ? '#fff' : '#f5f7fa',
          outline: 'none', cursor: 'pointer', transition: 'all .2s',
          boxShadow: focused ? '0 0 0 3px rgba(99,102,241,.1)' : 'none',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {children}
      </select>
    </div>
  )
}

function SCard({ iconBg, iconColor, icon, title, sub, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '22px 24px', boxShadow: CARD_SHADOW }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, background: iconBg, color: iconColor }}>
          <i className={`fa-solid fa-${icon}`} />
        </div>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '16px' }}>{title}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{sub}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

function SaveRow({ onCancel, onSave, cancelLabel = 'Cancel', saveLabel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
      <button onClick={onCancel} style={{
        padding: '10px 18px', borderRadius: '9px', border: '1.5px solid #e2e8f0',
        background: '#f5f7fa', color: '#64748b',
        fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
        onMouseLeave={e => e.currentTarget.style.background = '#f5f7fa'}
      >{cancelLabel}</button>
      <button onClick={onSave} style={{
        display: 'inline-flex', alignItems: 'center', gap: '7px',
        background: ACCENT2, color: '#fff', border: 'none',
        padding: '10px 22px', borderRadius: '10px',
        fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 700,
        cursor: 'pointer', boxShadow: '0 2px 10px rgba(99,102,241,.3)', transition: 'all .2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.background = ACCENT2; e.currentTarget.style.transform = '' }}
      >
        <i className="fa-solid fa-floppy-disk" /> {saveLabel}
      </button>
    </div>
  )
}

function Toast({ show, msg }) {
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      background: '#1e293b', color: '#fff', padding: '12px 18px',
      borderRadius: '12px', fontSize: '13.5px', fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 8px 30px rgba(0,0,0,.2)',
      transform: show ? 'translateY(0)' : 'translateY(80px)',
      opacity: show ? 1 : 0,
      transition: 'all .35s cubic-bezier(.34,1.56,.64,1)',
      zIndex: 9999, pointerEvents: 'none',
    }}>
      <i className="fa-solid fa-circle-check" style={{ color: SUCCESS }} />
      {msg}
    </div>
  )
}

/* ══════════════════════════════════════
   TAB: PROFILE
══════════════════════════════════════ */
function ProfileTab({ showToast }) {
  const [form, setForm] = useState({
    fname: 'Admin', lname: 'User',
    email: 'admin@wholesalepro.pk', phone: '+92-300-0000000',
    address: '', city: 'Lahore', lang: 'English',
  })
  const [avatarSrc, setAvatarSrc] = useState(null)
  const avatarInputRef = useRef(null)

  const sf = key => e => setForm(p => ({ ...p, [key]: e.target.value }))

  function handleAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setAvatarSrc(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleReset() {
    setForm({ fname: 'Admin', lname: 'User', email: 'admin@wholesalepro.pk', phone: '+92-300-0000000', address: '', city: 'Lahore', lang: 'English' })
    setAvatarSrc(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <SCard iconBg="#ede9fe" iconColor={ACCENT2} icon="user" title="Profile Information" sub="Your personal details and display name">

        {/* Avatar Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '20px' }}>
          {/* Avatar Circle */}
          <div
            onClick={() => avatarInputRef.current?.click()}
            style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'linear-gradient(135deg,#ede9fe,#e0f2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: ACCENT2, flexShrink: 0, position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
            onMouseEnter={e => e.currentTarget.querySelector('.av-overlay').style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.querySelector('.av-overlay').style.opacity = '0'}
          >
            {avatarSrc
              ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} />
              : <i className="fa-solid fa-user-tie" />
            }
            <div className="av-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', opacity: 0, transition: 'opacity .2s' }}>
              <i className="fa-solid fa-camera" />
            </div>
          </div>

          {/* Avatar Info */}
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '16px' }}>{form.fname} {form.lname}</div>
            <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              System Administrator &nbsp;
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>
                <i className="fa-solid fa-circle" style={{ fontSize: '7px', marginRight: '3px' }} />Active
              </span>
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '7px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#f5f7fa', color: '#64748b', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all .18s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT2; e.currentTarget.style.color = ACCENT2 }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
            >
              <i className="fa-solid fa-camera" /> Change Photo
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
          </div>
        </div>

        {/* Form Grid */}
        <div className="s-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <FLabel icon="user">First Name</FLabel>
            <FInput value={form.fname} onChange={sf('fname')} />
          </div>
          <div>
            <FLabel icon="user">Last Name</FLabel>
            <FInput value={form.lname} onChange={sf('lname')} />
          </div>

          <div>
            <FLabel icon="phone">Phone Number</FLabel>
            <FInput value={form.phone} onChange={sf('phone')} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <FLabel icon="location-dot">Address</FLabel>
            <FInput value={form.address} onChange={sf('address')} placeholder="e.g. Main Market, Lahore" />
          </div>
          <div>
            <FLabel icon="city">City</FLabel>
            <FInput value={form.city} onChange={sf('city')} />
          </div>
          <div>
            <FLabel icon="globe">Language</FLabel>
            <FSelect value={form.lang} onChange={sf('lang')}>
              <option>English</option>
              <option>Urdu</option>
            </FSelect>
          </div>
        </div>
      </SCard>

      <SaveRow
        onCancel={handleReset}
        onSave={() => showToast('Profile saved successfully!')}
        saveLabel="Save Profile"
      />
    </div>
  )
}

/* ══════════════════════════════════════
   TAB: BUSINESS & INVOICE
══════════════════════════════════════ */
function BusinessTab({ showToast }) {
  const DEFAULT_BIZ = {
    name: 'WholesalePro Distributors',
    ownerName: '',
    ownerPhone: '',
    phone: '+92-42-1234567',
    email: 'info@wholesalepro.pk',
    address: 'Main Boulevard, Gulberg III, Lahore',
    ntn: '', strn: '',
    currency: 'PKR — Pakistani Rupee (Rs)',
    fyear: 'July',
  }
  const DEFAULT_INV = {
    prefix: 'INV-', tax: '17',
    footer: 'Thank you for your business. Goods once sold will not be returned.',
  }
  const [biz, setBiz] = useState(() => {
    try { return { ...DEFAULT_BIZ, ...JSON.parse(localStorage.getItem('wholesale_biz') || '{}') } }
    catch { return DEFAULT_BIZ }
  })
  const [inv, setInv] = useState(() => {
    try { return { ...DEFAULT_INV, ...JSON.parse(localStorage.getItem('wholesale_inv') || '{}') } }
    catch { return DEFAULT_INV }
  })

  const sb = key => e => setBiz(p => ({ ...p, [key]: e.target.value }))
  const si = key => e => setInv(p => ({ ...p, [key]: e.target.value }))

  function handleReset() {
    setBiz(DEFAULT_BIZ)
    setInv(DEFAULT_INV)
  }

  function handleSave() {
    localStorage.setItem('wholesale_biz', JSON.stringify(biz))
    localStorage.setItem('wholesale_inv', JSON.stringify(inv))
    showToast('Business info saved successfully!')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Business Info Card */}
      <SCard iconBg="#e0f2fe" iconColor={ACCENT} icon="building" title="Business Information" sub="Your company details shown on invoices and reports">
        <div className="s-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <FLabel icon="building">Business Name</FLabel>
            <FInput value={biz.name} onChange={sb('name')} />
          </div>
          <div>
            <FLabel icon="user-tie">Owner Name</FLabel>
            <FInput value={biz.ownerName} onChange={sb('ownerName')} placeholder="e.g. Muhammad Ali" />
          </div>
          <div>
            <FLabel icon="mobile-screen">Owner Phone</FLabel>
            <FInput value={biz.ownerPhone} onChange={sb('ownerPhone')} placeholder="e.g. 03246770536" />
          </div>
          <div>
            <FLabel icon="phone">Business Phone</FLabel>
            <FInput value={biz.phone} onChange={sb('phone')} />
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <FLabel icon="location-dot">Business Address</FLabel>
            <FInput value={biz.address} onChange={sb('address')} />
          </div>
          <div>
            <FLabel icon="id-badge">NTN Number</FLabel>
            <FInput value={biz.ntn} onChange={sb('ntn')} placeholder="e.g. 1234567-8" />
          </div>
          <div>
            <FLabel icon="receipt">STRN / GST</FLabel>
            <FInput value={biz.strn} onChange={sb('strn')} placeholder="e.g. 42-00-1234-567-89" />
          </div>
          <div>
            <FLabel icon="money-bill-wave">Currency</FLabel>
            <FSelect value={biz.currency} onChange={sb('currency')}>
              <option>PKR — Pakistani Rupee (Rs)</option>
              <option>USD — US Dollar ($)</option>
              <option>AED — UAE Dirham</option>
            </FSelect>
          </div>
          <div>
            <FLabel icon="calendar-days">Financial Year Start</FLabel>
            <FSelect value={biz.fyear} onChange={sb('fyear')}>
              <option>January</option>
              <option>July</option>
            </FSelect>
          </div>
        </div>
      </SCard>

      {/* Invoice Settings Card */}
      <SCard iconBg="#d1fae5" iconColor={SUCCESS} icon="file-invoice" title="Invoice Settings" sub="Default values used when generating invoices">
        <div className="s-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <FLabel icon="hashtag">Invoice Prefix</FLabel>
            <FInput value={inv.prefix} onChange={si('prefix')} hint="e.g. INV-0001" />
          </div>
          <div>
            <FLabel icon="percent">Default Tax (%)</FLabel>
            <FInput type="number" value={inv.tax} onChange={si('tax')} hint="GST / Sales Tax" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <FLabel icon="note-sticky">Invoice Footer Note</FLabel>
            <FInput value={inv.footer} onChange={si('footer')} />
          </div>
        </div>
      </SCard>

      <SaveRow
        onCancel={handleReset}
        onSave={handleSave}
        saveLabel="Save Business Info"
      />
    </div>
  )
}

/* ══════════════════════════════════════
   TAB: BRANDING
══════════════════════════════════════ */
function BrandingTab({ showToast }) {
  const [brandName,  setBrandName]  = useState('WholesalePro')
  const [logoSrc,    setLogoSrc]    = useState(null)
  const logoInputRef = useRef(null)

  function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setLogoSrc(ev.target.result)
    reader.readAsDataURL(file)
  }

  function removeLogo() {
    setLogoSrc(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  function resetBranding() {
    setBrandName('WholesalePro')
    removeLogo()
    showToast('Branding reset to default!')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <SCard iconBg="#ede9fe" iconColor={ACCENT2} icon="swatchbook" title="Navbar Branding" sub="Customize the logo and app name shown in the navigation bar">

        {/* App Name */}
        <div style={{ marginBottom: '20px' }}>
          <FLabel icon="pen">App / Brand Name</FLabel>
          <FInput
            value={brandName}
            onChange={e => setBrandName(e.target.value)}
            placeholder="e.g. MyBusiness"
            hint="This name will appear next to the logo in the navbar"
          />
        </div>

        {/* Logo Upload */}
        <FLabel icon="image">Navbar Logo Image</FLabel>
        <div style={{ marginTop: '10px', marginBottom: logoSrc ? '0' : '0' }}>

          {/* Upload Area (shown when no logo) */}
          {!logoSrc && (
            <div
              onClick={() => logoInputRef.current?.click()}
              style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: '#f5f7fa', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT2; e.currentTarget.style.background = '#f5f3ff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f5f7fa' }}
            >
              <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '28px', color: '#94a3b8', marginBottom: '8px', display: 'block' }} />
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#1e293b', marginBottom: '4px' }}>Click to upload logo</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>PNG, JPG, SVG · Max 2MB · Recommended: 64×64px</div>
            </div>
          )}

          {/* Logo Preview (shown after upload) */}
          {logoSrc && (
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-check-circle" style={{ color: SUCCESS }} /> Logo Uploaded
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={logoSrc} alt="logo" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '12px', border: '1.5px solid #e2e8f0', display: 'block' }} />
                  <button
                    onClick={removeLogo}
                    title="Remove logo"
                    style={{ position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px', background: '#ef4444', color: '#fff', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
                <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>Logo ready · Will appear in navbar</div>
              </div>
            </div>
          )}

          <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
        </div>

        {/* Live Preview */}
        <div style={{ background: '#f5f7fa', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginTop: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-solid fa-eye" /> Live Preview — Navbar
          </div>
          {/* Fake Navbar */}
          <div style={{ background: '#1e293b', borderRadius: '10px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: `linear-gradient(135deg,${ACCENT2},${ACCENT})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
              {logoSrc
                ? <img src={logoSrc} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '9px' }} />
                : <i className="fa-solid fa-store" />
              }
            </div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '15px', color: '#fff', letterSpacing: '.3px' }}>
              {brandName || 'WholesalePro'}
            </div>
          </div>
        </div>

      </SCard>

      <SaveRow
        onCancel={resetBranding}
        onSave={() => showToast('Branding saved successfully!')}
        cancelLabel="Reset to Default"
        saveLabel="Save Branding"
      />
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN SETTINGS COMPONENT
══════════════════════════════════════ */
export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [toast,     setToast]     = useState({ show: false, msg: '' })

  function showToast(msg = 'Settings saved successfully!') {
    setToast({ show: true, msg })
    setTimeout(() => setToast({ show: false, msg: '' }), 3000)
  }

  const tabs = [
    { key: 'profile',  icon: 'user',         label: 'Profile'            },
    { key: 'business', icon: 'file-invoice',  label: 'Invoice & Business' },
    { key: 'branding', icon: 'swatchbook',    label: 'Branding'           },
  ]

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
            <i className="fa-solid fa-gear" style={{ color: ACCENT2 }} />
            Settings
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>Manage your account, preferences and system configuration</div>
        </div>
        <button onClick={() => showToast('Settings saved successfully!')} style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: ACCENT2, color: '#fff', border: 'none',
          padding: '10px 22px', borderRadius: '10px',
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px', fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 2px 10px rgba(99,102,241,.3)', transition: 'all .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = ACCENT2; e.currentTarget.style.transform = '' }}
        >
          <i className="fa-solid fa-floppy-disk" /> Save Changes
        </button>
      </div>

      {/* ── Layout: Sidebar + Panel ── */}
      <div className="settings-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Sidebar Nav ── */}
        <nav className="settings-nav" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '10px', boxShadow: CARD_SHADOW, position: 'sticky', top: '22px' }}>
          {tabs.map(({ key, icon, label }) => {
            const isAct = activeTab === key
            return (
              <div
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 13px', borderRadius: '10px', cursor: 'pointer',
                  fontSize: '13.5px', fontWeight: isAct ? 700 : 600,
                  color: isAct ? ACCENT2 : '#64748b',
                  background: isAct ? 'linear-gradient(135deg,#ede9fe,#e0f2fe)' : 'transparent',
                  marginBottom: '2px', transition: 'all .18s',
                }}
                onMouseEnter={e => { if (!isAct) { e.currentTarget.style.background = '#f5f7fa'; e.currentTarget.style.color = '#1e293b' } }}
                onMouseLeave={e => { if (!isAct) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' } }}
              >
                <i className={`fa-solid fa-${icon}`} style={{ width: '18px', textAlign: 'center', fontSize: '14px', color: isAct ? ACCENT2 : 'inherit' }} />
                <span className="settings-nav-label">{label}</span>
              </div>
            )
          })}
        </nav>

        {/* ── Content Panel ── */}
        <div>
          {activeTab === 'profile'  && <ProfileTab  showToast={showToast} />}
          {activeTab === 'business' && <BusinessTab showToast={showToast} />}
          {activeTab === 'branding' && <BrandingTab showToast={showToast} />}
        </div>

      </div>

      <Toast show={toast.show} msg={toast.msg} />
      <div style={{ height: '30px' }} />
      <style>{`
        @media (max-width: 680px) {
          .settings-layout { grid-template-columns: 1fr !important; }
          .settings-nav { position: static !important; display: flex !important; flex-direction: row !important; overflow-x: auto !important; gap: 4px !important; padding: 8px !important; }
          .settings-nav > div { flex-shrink: 0 !important; padding: 8px 12px !important; margin-bottom: 0 !important; }
          .settings-nav-label { display: none !important; }
          .settings-nav > div > i { width: auto !important; font-size: 16px !important; margin: 0 !important; }
        }
        @media (max-width: 400px) {
          .settings-nav-label { display: inline !important; font-size: 11px !important; }
        }
        @media (max-width: 500px) {
          .s-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
