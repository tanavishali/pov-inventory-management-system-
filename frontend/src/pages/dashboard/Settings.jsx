import { useState, useRef, useEffect } from 'react'
import { useGetProfileQuery, useUpdateProfileMutation, useGetBusinessSettingsQuery, useUpdateBusinessSettingsMutation } from '../../store/slices/authApiSlice'
import { io } from 'socket.io-client'

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
  const { data: user, isLoading: profileLoading } = useGetProfileQuery()
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation()

  const [form, setForm] = useState({
    fname: '', lname: '',
    email: '', phone: '',
    address: '', city: '', lang: 'English',
  })
  const [avatarSrc, setAvatarSrc] = useState(null)
  const avatarInputRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  // Populate form from user profile data
  useEffect(() => {
    if (user && !loaded) {
      const nameParts = (user.name || '').split(' ')
      setForm({
        fname: nameParts[0] || '',
        lname: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        lang: user.language || 'English',
      })
      setAvatarSrc(user.avatar || null)
      setLoaded(true)
    }
  }, [user, loaded])

  const sf = key => e => setForm(p => ({ ...p, [key]: e.target.value }))

  function handleAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setAvatarSrc(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleReset() {
    if (user) {
      const nameParts = (user.name || '').split(' ')
      setForm({
        fname: nameParts[0] || '',
        lname: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        lang: user.language || 'English',
      })
      setAvatarSrc(user.avatar || null)
    } else {
      setAvatarSrc(null)
    }
  }

  async function handleSave() {
    try {
      const fullName = `${form.fname} ${form.lname}`.trim()
      const res = await updateProfile({
        name: fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        language: form.lang,
        avatar: avatarSrc,
      }).unwrap()
      if (res.success) {
        showToast('Profile saved successfully!')
      }
    } catch (err) {
      showToast(err?.data?.message || 'Error saving profile!')
    }
  }

  if (profileLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '28px', color: ACCENT2 }} />
      </div>
    )
  }

  const statusBg = user?.status === 'Active' ? '#dcfce7' : user?.status === 'Locked' ? '#fee2e2' : '#fef3c7'
  const statusColor = user?.status === 'Active' ? '#16a34a' : user?.status === 'Locked' ? '#dc2626' : '#d97706'
  const roleLabel = user?.role === 'admin' ? 'System Administrator' : user?.role === 'super-admin' ? 'Super Admin' : 'Salesman'

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
              {roleLabel} &nbsp;
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: statusBg, color: statusColor }}>
                <i className="fa-solid fa-circle" style={{ fontSize: '7px', marginRight: '3px' }} />{user?.status || 'Active'}
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
          <div>
            <FLabel icon="envelope">Email Address</FLabel>
            <FInput value={form.email} onChange={sf('email')} type="email" />
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
        onSave={handleSave}
        saveLabel={saving ? 'Saving...' : 'Save Profile'}
      />
    </div>
  )
}

/* ══════════════════════════════════════
   TAB: BUSINESS & INVOICE
══════════════════════════════════════ */
function BusinessTab({ showToast }) {
  const { data: settings, isLoading } = useGetBusinessSettingsQuery()
  const [updateSettings, { isLoading: saving }] = useUpdateBusinessSettingsMutation()

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
  
  const [biz, setBiz] = useState(DEFAULT_BIZ)
  const [inv, setInv] = useState(DEFAULT_INV)
  const [loaded, setLoaded] = useState(false)

  // Populate from database settings
  useEffect(() => {
    if (settings && !loaded) {
      setBiz({
        name: settings.businessName || '',
        ownerName: settings.ownerName || '',
        ownerPhone: settings.ownerPhone || '',
        phone: settings.businessPhone || '',
        email: settings.businessEmail || '',
        address: settings.businessAddress || '',
        ntn: settings.ntn || '',
        strn: settings.strn || '',
        currency: settings.currency || 'PKR — Pakistani Rupee (Rs)',
        fyear: settings.financialYearStart || 'July',
      })
      setInv({
        prefix: settings.invoicePrefix || 'INV-',
        tax: String(settings.invoiceTax ?? '17'),
        footer: settings.invoiceFooter || 'Thank you for your business. Goods once sold will not be returned.',
      })
      setLoaded(true)
    }
  }, [settings, loaded])

  const sb = key => e => setBiz(p => ({ ...p, [key]: e.target.value }))
  const si = key => e => setInv(p => ({ ...p, [key]: e.target.value }))

  function handleReset() {
    if (settings) {
      setBiz({
        name: settings.businessName || '',
        ownerName: settings.ownerName || '',
        ownerPhone: settings.ownerPhone || '',
        phone: settings.businessPhone || '',
        email: settings.businessEmail || '',
        address: settings.businessAddress || '',
        ntn: settings.ntn || '',
        strn: settings.strn || '',
        currency: settings.currency || 'PKR — Pakistani Rupee (Rs)',
        fyear: settings.financialYearStart || 'July',
      })
      setInv({
        prefix: settings.invoicePrefix || 'INV-',
        tax: String(settings.invoiceTax ?? '17'),
        footer: settings.invoiceFooter || 'Thank you for your business. Goods once sold will not be returned.',
      })
    } else {
      setBiz(DEFAULT_BIZ)
      setInv(DEFAULT_INV)
    }
  }

  async function handleSave() {
    try {
      const res = await updateSettings({
        businessName: biz.name,
        ownerName: biz.ownerName,
        ownerPhone: biz.ownerPhone,
        businessPhone: biz.phone,
        businessEmail: biz.email,
        businessAddress: biz.address,
        ntn: biz.ntn,
        strn: biz.strn,
        currency: biz.currency,
        financialYearStart: biz.fyear,
        invoicePrefix: inv.prefix,
        invoiceTax: Number(inv.tax || 0),
        invoiceFooter: inv.footer,
      }).unwrap()
      
      if (res.success) {
        showToast('Business & Invoice settings saved successfully!')
      }
    } catch (err) {
      showToast(err?.data?.message || 'Error saving settings!')
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '28px', color: ACCENT2 }} />
      </div>
    )
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
        saveLabel={saving ? 'Saving...' : 'Save Business Info'}
      />
    </div>
  )
}

/* ══════════════════════════════════════
   TAB: BRANDING
══════════════════════════════════════ */
function BrandingTab({ showToast }) {
  const { data: settings, isLoading } = useGetBusinessSettingsQuery()
  const [updateSettings, { isLoading: saving }] = useUpdateBusinessSettingsMutation()

  const [brandName,  setBrandName]  = useState('WholesalePro')
  const [logoSrc,    setLogoSrc]    = useState(null)
  const logoInputRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  // Populate from database settings
  useEffect(() => {
    if (settings && !loaded) {
      setBrandName(settings.brandName || 'WholesalePro')
      setLogoSrc(settings.logoSrc || null)
      setLoaded(true)
    }
  }, [settings, loaded])

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
  }

  async function handleSave() {
    try {
      const res = await updateSettings({
        brandName,
        logoSrc: logoSrc || '',
      }).unwrap()
      if (res.success) {
        showToast('Branding saved successfully!')
      }
    } catch (err) {
      showToast(err?.data?.message || 'Error saving branding!')
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '28px', color: ACCENT2 }} />
      </div>
    )
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
        onSave={handleSave}
        cancelLabel="Reset to Default"
        saveLabel={saving ? 'Saving...' : 'Save Branding'}
      />
    </div>
  )
}

/* ══════════════════════════════════════
   TAB: WHATSAPP BOT INTEGRATION
   ══════════════════════════════════════ */
function WhatsAppTab({ showToast }) {
  const { data: user } = useGetProfileQuery()
  const token = localStorage.getItem('wholesale_token')

  const [allowedNumbers, setAllowedNumbers] = useState('')
  const [status, setStatus] = useState('disconnected') // 'disconnected', 'connecting', 'connected'
  const [isLoadingStatus, setIsLoadingStatus] = useState(true) // true until first WS status event
  const [qrCode, setQrCode] = useState(null)
  const [phone, setPhone] = useState(null)
  const [socket, setSocket] = useState(null)
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  // Fetch allowed numbers on mount
  useEffect(() => {
    if (!user) return
    
    const fetchSettings = async () => {
      setLoadingSettings(true)
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/whatsapp/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await res.json()
        if (data.allowedNumbers) {
          setAllowedNumbers(data.allowedNumbers.join(', '))
        }
      } catch (err) {
        console.error('Failed to fetch WhatsApp settings:', err)
      } finally {
        setLoadingSettings(false)
      }
    }

    fetchSettings()
  }, [user, token])

  // Manage Socket.IO status and QR pairing streams
  useEffect(() => {
    if (!user) return

    const shopId = user.id || user._id
    const newSocket = io(import.meta.env.VITE_API_URL)
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to WhatsApp WS Gateway')
      newSocket.emit('join-whatsapp', { shopId })
    })

    newSocket.on('whatsapp-status', (data) => {
      console.log('WS Status Update:', data)
      setIsLoadingStatus(false)
      setStatus(data.status)
      if (data.phone) {
        setPhone(data.phone)
      } else if (data.status === 'disconnected') {
        setPhone(null)
      }
      if (data.status === 'connected') {
        setQrCode(null)
      }
    })

    newSocket.on('whatsapp-qr', (data) => {
      console.log('WS QR Update received')
      setQrCode(data.qr)
      setStatus('connecting')
    })

    return () => {
      newSocket.disconnect()
    }
  }, [user])

  const handleConnect = () => {
    if (!socket || !user) return
    const shopId = user.id || user._id
    setStatus('connecting')
    socket.emit('whatsapp-connect', { shopId })
  }

  const handleDisconnect = () => {
    if (!socket || !user) return
    const shopId = user.id || user._id
    socket.emit('whatsapp-disconnect', { shopId })
  }

  const handleSaveSettings = async () => {
    if (!user) return
    setSavingSettings(true)
    try {
      const numbersArray = allowedNumbers
        .split(',')
        .map(n => n.trim().replace(/\s+/g, ''))
        .filter(n => n.length > 0)

      const res = await fetch(`${import.meta.env.VITE_API_URL}/whatsapp/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ allowedNumbers: numbersArray })
      })
      const data = await res.json()
      if (data.success) {
        setAllowedNumbers(data.allowedNumbers.join(', '))
        showToast('WhatsApp admin numbers updated!')
      }
    } catch (err) {
      console.error('Failed to save settings:', err)
      showToast('Error saving numbers!')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleResetSettings = () => {
    setAllowedNumbers('')
  }

  const commands = [
    { cmd: '/today', desc: "Today's sales performance audit", icon: 'chart-line', color: '#0ea5e9', preview: "📊 Orders: 7 | Sales: Rs.124,500" },
    { cmd: '/stock', desc: 'Get critical low-stock alert reports', icon: 'triangle-exclamation', color: '#f59e0b', preview: "⚠️ Chana Dal: 0 pcs | Sufi Oil: 3 pcs" },
    { cmd: '/bills', desc: 'List active remaining unpaid bills', icon: 'file-invoice-dollar', color: '#10b981', preview: "🧾 Sana Store: Rs.10,000 pending" },
    { cmd: '/udar', desc: 'Outstanding udhar credit ledgers', icon: 'sack-dollar', color: '#8b5cf6', preview: "💰 Credit Outstanding: Rs.41,500 total" },
    { cmd: '/shops', desc: 'List customer retail shops profiles', icon: 'store', color: '#ec4899', preview: "🏪 Hassan Electronics [Active]" },
    { cmd: '/orders', desc: 'Retrieve 10 most recent orders log', icon: 'box', color: '#6366f1', preview: "📦 #INV-102 | Completed | Rs.24,000" },
    { cmd: '/help', desc: 'Show chatbot help manual', icon: 'circle-question', color: '#64748b', preview: "🤖 Show commands guide" },
    { cmd: '/users', desc: 'List all salesmen & team members', icon: 'users', color: '#0891b2', preview: "👥 Ali Khan [Active] | Sales: 42" },
    { cmd: '/info', desc: 'Admin account & system summary', icon: 'circle-info', color: '#7c3aed', preview: "ℹ️ Plan: Premium | Shops: 12" },
  ]

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '28px', color: ACCENT2 }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ── Two Column Dashboard Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }} className="whatsapp-tab-grid">
        
        {/* Left Column: Connection Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <SCard iconBg="#e6fffa" iconColor="#0f766e" icon="comments" title="WhatsApp Connection Center" sub="Link your mobile device to enable instant automated reports">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center', padding: '10px 0' }}>
              
              {/* Pulsing Status indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: status === 'connected' ? '#dcfce7' : status === 'connecting' ? '#fef3c7' : '#f1f5f9', color: status === 'connected' ? '#16a34a' : status === 'connecting' ? '#d97706' : '#64748b', fontSize: '12px', fontWeight: 700 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', display: 'inline-block', animation: status === 'connected' || status === 'connecting' ? 'pulse 1.5s infinite' : 'none' }} />
                {status === 'connected' ? 'ACTIVE & ONLINE' : status === 'connecting' ? 'PAIRING / INITIALIZING' : 'DISCONNECTED'}
              </div>

              {/* Status View: DISCONNECTED */}
              {status === 'disconnected' && (
                <div style={{ width: '100%' }}>
                  {isLoadingStatus ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 0' }}>
                      <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Checking connection status…</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '15px auto', fontSize: '32px', color: '#94a3b8' }}>
                        <i className="fa-solid fa-qrcode" />
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', maxWidth: '300px', margin: '0 auto 20px auto' }}>
                        Scan a dynamically generated secure QR code from your phone's WhatsApp client to link this POS bot.
                      </p>
                      <button onClick={handleConnect} style={{
                        width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        background: '#10b981', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px',
                        fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(16,185,129,.3)', transition: 'all .2s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.transform = '' }}
                      >
                        <i className="fa-brands fa-whatsapp" style={{ fontSize: '18px' }} /> Pair WhatsApp Account
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Status View: CONNECTING / QR GENERATION */}
              {status === 'connecting' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {qrCode ? (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ background: '#fff', padding: '14px', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,.04)', display: 'inline-block', position: 'relative' }}>
                        <img src={qrCode} alt="WhatsApp Pairing QR" style={{ width: '200px', height: '200px', display: 'block' }} />
                      </div>
                      <div style={{ marginTop: '16px', fontSize: '12.5px', color: '#475569', textAlign: 'left', background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '320px', margin: '16px auto 0 auto' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><i className="fa-solid fa-circle-info" style={{ color: '#0ea5e9' }} /> Pairing Instructions:</div>
                        <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: '1.5' }}>
                          <li>Open <strong>WhatsApp</strong> on your phone</li>
                          <li>Tap <strong>Menu</strong> (⋮) or <strong>Settings</strong> (⚙️)</li>
                          <li>Select <strong>Linked Devices</strong> &rarr; <strong>Link a Device</strong></li>
                          <li>Point your camera at this QR code</li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '40px 0' }}>
                      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '36px', color: '#10b981', marginBottom: '14px' }} />
                      <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#475569' }}>Spawning secure WhatsApp Client...</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>This may take up to 10 seconds. Please wait.</p>
                    </div>
                  )}
                  
                  <button onClick={handleDisconnect} style={{
                    marginTop: '20px', width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: '#f1f5f9', color: '#64748b', border: '1.5px solid #e2e8f0', padding: '10px 20px', borderRadius: '10px',
                    fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'all .18s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
                  >
                    Cancel Pairing Session
                  </button>
                </div>
              )}

              {/* Status View: CONNECTED */}
              {status === 'connected' && (
                <div style={{ width: '100%' }}>
                  <div style={{ position: 'relative', width: '76px', height: '76px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '15px auto', fontSize: '36px' }}>
                    <i className="fa-solid fa-circle-check" />
                    <span style={{ position: 'absolute', right: '0', bottom: '0', width: '16px', height: '16px', border: '2.5px solid #fff', borderRadius: '50%', background: '#16a34a' }} />
                  </div>
                  
                  <div style={{ marginBottom: '22px' }}>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '17px', color: '#1e293b' }}>Connected Successfully!</div>
                    {phone && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <i className="fa-brands fa-whatsapp" style={{ color: '#16a34a' }} /> Linked Account: <strong style={{ color: '#334155' }}>+{phone}</strong>
                    </div>}
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', textAlign: 'left', marginBottom: '22px', fontSize: '12.5px', color: '#475569', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><i className="fa-solid fa-shield-halved" style={{ color: '#16a34a' }} /> Protected Live Guard:</div>
                    Your WhatsApp bot is responsive. To query stats securely, send commands in your <strong>direct message (DM) chat</strong>.
                  </div>

                  <button onClick={handleDisconnect} style={{
                    width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: '#ef4444', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px',
                    fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13.5px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(239,68,68,.3)', transition: 'all .2s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.transform = '' }}
                  >
                    <i className="fa-solid fa-link-slash" /> Unlink WhatsApp Device
                  </button>
                </div>
              )}

            </div>
          </SCard>

        </div>

        {/* Right Column: Security Gates & Configs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <SCard iconBg="#eef2ff" iconColor="#4338ca" icon="shield-halved" title="Bot Security Guardrails" sub="Configure allowed admin phone numbers permitted to query reports">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <FLabel icon="phone">Allowed WhatsApp Admin Numbers</FLabel>
                <input
                  type="text"
                  value={allowedNumbers}
                  onChange={e => setAllowedNumbers(e.target.value)}
                  placeholder="e.g. +923001234567, +923219876543"
                  disabled={loadingSettings}
                  style={{
                    width: '100%', padding: '10px 13px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '9px',
                    fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '13px',
                    color: '#1e293b', background: '#f5f7fa',
                    outline: 'none', transition: 'all .2s',
                  }}
                />
                <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>
                  Provide phone numbers with **country codes** (comma separated).
                  <br />
                  <span style={{ fontWeight: 600, color: '#64748b' }}>💡 Pro-Tip:</span> If left empty, **only you** chatting with yourself can query stats.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={handleResetSettings}
                  disabled={loadingSettings || savingSettings}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
                    background: '#fff', color: '#64748b', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={loadingSettings || savingSettings}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: ACCENT2, color: '#fff', border: 'none',
                    padding: '8px 16px', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(99,102,241,.25)'
                  }}
                >
                  {savingSettings ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-floppy-disk" />} Save Numbers
                </button>
              </div>
            </div>
          </SCard>

          {/* Commands Reference Guide */}
          <SCard iconBg="#fef3c7" iconColor="#d97706" icon="terminal" title="WhatsApp Commands Guide" sub="Send these commands on WhatsApp to trigger automated POS reports">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
              {commands.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9px', padding: '10px 12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${c.color}15`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, marginTop: '2px' }}>
                    <i className={`fa-solid fa-${c.icon}`} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{c.cmd}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', background: '#e2e8f0', padding: '1px 6px', borderRadius: '999px', fontFamily: 'monospace' }}>DM/Self</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{c.desc}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', marginTop: '4px', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                      Output: {c.preview}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SCard>

        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: .4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
          100% { opacity: .4; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .whatsapp-tab-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
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
    { key: 'whatsapp', icon: 'comments',      label: 'WhatsApp Bot'       },
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
          {activeTab === 'whatsapp' && <WhatsAppTab showToast={showToast} />}
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
