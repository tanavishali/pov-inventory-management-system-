import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateBookingMutation } from '../store/slices/bookingsApiSlice'

/* ── Tokens (themed via CSS variables on the .lp wrapper) ── */
const GRAD = 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)'
const INK = 'var(--ink)'
const MUTED = 'var(--muted)'
const LINE = 'var(--line)'
const CARD = 'var(--card)'
const PANEL = 'var(--panel)'
const SOFT = 'var(--soft)'
const SHADOW = 'var(--shadow)'
const WA = 'https://wa.me/923287458137?text=Assalam%20o%20Alaikum%2C%20I%20want%20a%20WholesalePro%20demo.'
const TEL = 'tel:+923287458137'

const DOTS = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26'%3E%3Ccircle cx='2' cy='2' r='1.4' fill='%2394a3b8' opacity='0.4'/%3E%3C/svg%3E\")"
const GRIDW = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cpath d='M44 0H0V44' fill='none' stroke='%23ffffff' stroke-opacity='0.14'/%3E%3C/svg%3E\")"

const ACCENTS = [
  ['rgba(14,165,233,.14)', '#0ea5e9'], ['rgba(99,102,241,.16)', '#6366f1'],
  ['rgba(16,163,74,.15)', '#16a34a'], ['rgba(217,119,6,.16)', '#d97706'],
  ['rgba(225,29,72,.14)', '#e11d48'], ['rgba(8,145,178,.15)', '#0891b2'],
  ['rgba(147,51,234,.15)', '#9333ea'], ['rgba(239,68,68,.14)', '#ef4444'],
]

const FEATURES = [
  { icon: 'cart-shopping', title: 'Order Management', desc: 'Track every order from pending to delivery — nothing slips through.' },
  { icon: 'boxes-stacked', title: 'Stock & Inventory', desc: 'Live stock, categories and low-stock alerts so you never run out.' },
  { icon: 'hand-holding-dollar', title: 'Credit (Udhar) Ledger', desc: 'Every shop’s credit, advance and balance tracked automatically.' },
  { icon: 'file-invoice', title: 'Invoice & Billing', desc: 'Generate a professional invoice in one click — print or share.' },
  { icon: 'mobile-screen-button', title: 'Salesman App', desc: 'Salesmen place orders on the go, straight into your system.' },
  { icon: 'chart-line', title: 'Reports & Profit', desc: 'Daily sales, losses and gross profit with clear analytics.' },
  { icon: 'comments', title: 'WhatsApp Ready', desc: 'Orders and alerts over WhatsApp — closer to your customers.' },
  { icon: 'user-shield', title: 'Multi-Role Access', desc: 'Admin, salesman and super-admin — each with the right access.' },
]
const STATS = [
  { target: 6, suffix: '+', label: 'Modules in one app', icon: 'layer-group' },
  { target: 8, suffix: '', label: 'Powerful features', icon: 'grip' },
  { target: 3, suffix: '', label: 'User roles', icon: 'users' },
  { target: 100, suffix: '%', label: 'Urdu + English', icon: 'language' },
]
const STEPS = [
  { n: '1', title: 'Book a free demo', desc: 'Get in touch and we’ll walk you through the whole system live.', icon: 'headset' },
  { n: '2', title: 'Add your data', desc: 'Add products, shops and salesmen — we’ll help you set it up.', icon: 'database' },
  { n: '3', title: 'Run your business', desc: 'Orders, credit and reports — all under your control.', icon: 'rocket' },
]
const AUDIENCE = [
  { icon: 'warehouse', title: 'Wholesalers', desc: 'Businesses supplying goods to many retail shops.' },
  { icon: 'truck-fast', title: 'Distributors', desc: 'FMCG and brand distributors running daily routes.' },
  { icon: 'store', title: 'Suppliers', desc: 'Godowns and stores that sell on credit.' },
]
const TESTIMONIALS = [
  { quote: 'I used to forget credit all the time. Now every shop’s balance is automatic — no more arguments at month-end.', name: 'Imran Traders', city: 'Lahore', icon: 'warehouse' },
  { quote: 'My salesmen take orders on their phones and I see them instantly. Stock and invoices are no longer a headache.', name: 'Al-Madina Distributors', city: 'Karachi', icon: 'truck-fast' },
  { quote: 'One dashboard for sales, profit and udhar. It paid for itself in the first month.', name: 'Bismillah Wholesale', city: 'Faisalabad', icon: 'store' },
]
const PLANS = [
  { name: 'Basic', price: '₨1,500', per: '/month', note: 'For a small shop or a fresh start', pop: false,
    items: ['Order & stock management', 'Credit (udhar) ledger', 'Invoice & billing', '1 admin account'], cta: 'Choose Basic' },
  { name: 'Premium', price: '₨3,000', per: '/month', note: 'For a growing wholesale business', pop: true,
    items: ['Everything in Basic', 'Salesman app + multi-user', 'Reports & profit analytics', 'WhatsApp orders & alerts'], cta: 'Choose Premium' },
  { name: 'Enterprise', price: 'Custom', per: '', note: 'For large distributors', pop: false,
    items: ['Everything in Premium', 'Unlimited users & shops', 'Priority support', 'Custom setup & training'], cta: 'Talk to us' },
]
const FAQS = [
  { q: 'Is there a free demo?', a: 'Yes. Contact us on WhatsApp or call and we’ll give you a full live walkthrough of the system before you decide.' },
  { q: 'Does it work on mobile and desktop?', a: 'Absolutely. The admin dashboard works great on desktop, and salesmen get a mobile-friendly app to place orders on the go.' },
  { q: 'Can salesmen take orders remotely?', a: 'Yes — salesmen log in from their phones, pick the shop and products, and the order flows straight into your system.' },
  { q: 'How is customer credit (udhar) handled?', a: 'Every shop has its own ledger. Advances, payments and balances are tracked automatically, so nothing is forgotten.' },
  { q: 'Do you help with setup?', a: 'Yes. We help you add your products, shops and salesmen, and guide your team so you’re up and running quickly.' },
  { q: 'Is my business data safe?', a: 'Your data is stored securely and access is role-based, so each user only sees what they’re allowed to.' },
]
const MARQUEE = ['Orders', 'Stock', 'Udhar Ledger', 'Invoicing', 'Salesman App', 'Reports', 'WhatsApp Alerts', 'Multi-Shop', 'Profit Tracking', 'Low-stock Alerts']

function Eyebrow({ icon, children, light }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', color: light ? '#fff' : '#0ea5e9', background: light ? 'rgba(255,255,255,.18)' : 'var(--chip)', padding: '7px 14px', borderRadius: '999px' }}>
      <i className={`fa-solid fa-${icon}`} /> {children}
    </span>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('wholesale_theme')
      if (saved) return saved
      return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'
    } catch { return 'light' }
  })
  const statsRef = useRef(null)
  const goLogin = () => navigate('/login')
  const isDark = theme === 'dark'

  // Booking form
  const [createBooking, { isLoading: booking }] = useCreateBookingMutation()
  const [form, setForm] = useState({ name: '', business: '', phone: '', city: '', plan: '', message: '' })
  const [formErr, setFormErr] = useState('')
  const [sent, setSent] = useState(false)
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submitBooking = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) { setFormErr('Please enter your name and phone number.'); return }
    const digits = form.phone.replace(/\D/g, '')
    if (digits.length < 10) { setFormErr('Please enter a valid phone number.'); return }
    setFormErr('')
    try {
      await createBooking({
        name: form.name.trim(),
        business: form.business.trim() || undefined,
        phone: form.phone.trim(),
        city: form.city.trim() || undefined,
        plan: form.plan || undefined,
        message: form.message.trim() || undefined,
      }).unwrap()
      setSent(true)
      setForm({ name: '', business: '', phone: '', city: '', plan: '', message: '' })
    } catch (err) {
      setFormErr(err?.data?.message || 'Something went wrong. Please try again or contact us on WhatsApp.')
    }
  }

  useEffect(() => { try { localStorage.setItem('wholesale_theme', theme) } catch {} }, [theme])

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lp-in'); obs.unobserve(e.target) } })
    }, { threshold: 0.12 })
    document.querySelectorAll('.lp-reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const node = statsRef.current
    if (!node) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        node.querySelectorAll('.lp-count').forEach(el => {
          const target = parseInt(el.dataset.target, 10)
          const suffix = el.dataset.suffix || ''
          const dur = 1400; const start = performance.now()
          const tick = (now) => {
            const p = Math.min(1, (now - start) / dur)
            const eased = 1 - Math.pow(1 - p, 3)
            el.textContent = Math.round(target * eased) + suffix
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        })
        obs.disconnect()
      })
    }, { threshold: 0.4 })
    obs.observe(node)
    return () => obs.disconnect()
  }, [])

  const sectionStyle = { padding: '90px 0', position: 'relative' }
  const wrap = { maxWidth: '1180px', margin: '0 auto', padding: '0 22px', position: 'relative' }
  const h2 = { fontFamily: "'Outfit',sans-serif", fontSize: '38px', fontWeight: 800, letterSpacing: '-.5px', lineHeight: 1.15, color: INK }
  const lead = { color: MUTED, fontSize: '18px', maxWidth: '640px', marginTop: '14px' }
  const btnPrimary = { display: 'inline-flex', alignItems: 'center', gap: '9px', fontWeight: 700, fontSize: '15px', border: 'none', borderRadius: '999px', padding: '13px 24px', cursor: 'pointer', background: GRAD, color: '#fff', boxShadow: '0 6px 18px rgba(14,165,233,.35)' }
  const btnWa = { ...btnPrimary, background: '#25D366', boxShadow: '0 6px 18px rgba(37,211,102,.3)' }
  const btnGhost = { display: 'inline-flex', alignItems: 'center', gap: '9px', fontWeight: 700, fontSize: '15px', borderRadius: '999px', padding: '12px 22px', cursor: 'pointer', background: CARD, color: INK, border: `1.5px solid ${LINE}` }
  const card = { background: CARD, border: `1px solid ${LINE}`, borderRadius: '18px', boxShadow: SHADOW }
  const inpStyle = { width: '100%', padding: '12px 14px', borderRadius: '11px', border: `1.5px solid ${LINE}`, background: SOFT, color: INK, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '14px', outline: 'none', boxSizing: 'border-box' }
  const lblStyle = { fontSize: '12px', fontWeight: 700, color: MUTED, marginBottom: '6px', display: 'block' }

  const SectionHead = ({ icon, eyebrow, title, sub }) => (
    <div style={{ textAlign: 'center' }}>
      <Eyebrow icon={icon}>{eyebrow}</Eyebrow>
      <h2 style={{ ...h2, marginTop: '14px' }}>{title}</h2>
      <div style={{ width: '64px', height: '4px', borderRadius: '99px', background: GRAD, margin: '16px auto 0' }} />
      {sub && <p style={{ ...lead, marginLeft: 'auto', marginRight: 'auto', marginTop: '14px' }}>{sub}</p>}
    </div>
  )

  return (
    <div className={`lp${isDark ? ' lp-dark' : ''}`} style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: INK, background: 'var(--bg)', overflowX: 'hidden', transition: 'background .3s,color .3s' }}>

      {/* NAV — floating pill */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, padding: '14px 0' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', padding: '0 10px 0 16px', borderRadius: '999px', background: 'var(--glass)', backdropFilter: 'blur(14px)', border: `1px solid ${LINE}`, boxShadow: scrolled ? '0 10px 30px rgba(2,8,23,.12)' : '0 2px 10px rgba(2,8,23,.05)', transition: 'box-shadow .25s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Outfit'", fontWeight: 900, fontSize: '20px', boxShadow: '0 6px 14px rgba(14,165,233,.4)' }}>W</div>
              <div>
                <div style={{ fontFamily: "'Outfit'", fontSize: '18px', fontWeight: 800, lineHeight: 1 }}>WholesalePro</div>
                <div style={{ fontSize: '9.5px', color: MUTED, letterSpacing: '1.5px', fontWeight: 600 }}>BY TECHRIWAAYAT</div>
              </div>
            </div>
            <nav className={`lp-navlinks${menuOpen ? ' lp-open' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
              {[['Features', '#features'], ['How it works', '#how'], ['Reviews', '#reviews'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([t, h]) => (
                <a key={t} href={h} onClick={() => setMenuOpen(false)} className="lp-navlink" style={{ fontWeight: 600, fontSize: '14px', color: MUTED, textDecoration: 'none' }}>{t}</a>
              ))}
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <button onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label="Toggle theme" title="Toggle dark / light"
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: `1.5px solid ${LINE}`, background: CARD, color: isDark ? '#fbbf24' : '#6366f1', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fa-solid fa-${isDark ? 'sun' : 'moon'}`} />
              </button>
              <button onClick={goLogin} className="lp-shine lp-hide-sm" style={btnPrimary}><i className="fa-solid fa-right-to-bracket" /> Login</button>
              <button className="lp-burger" onClick={() => setMenuOpen(o => !o)} style={{ display: 'none', width: '40px', height: '40px', fontSize: '18px', background: CARD, border: `1.5px solid ${LINE}`, borderRadius: '50%', color: INK, cursor: 'pointer' }} aria-label="Menu"><i className="fa-solid fa-bars" /></button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: 'relative', padding: '64px 0 64px', overflow: 'hidden' }}>
        <div className="lp-hero-bg" aria-hidden="true">
          <span className="lp-blob lp-blob1" />
          <span className="lp-blob lp-blob2" />
          <span className="lp-blob lp-blob3" />
          <span className="lp-dots" />
        </div>

        <div className="lp-hero-grid" style={{ ...wrap, display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: '48px', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', fontWeight: 700, fontSize: '13px', letterSpacing: '.5px', color: '#0369a1', background: 'var(--chip)', padding: '7px 15px', borderRadius: '999px', border: '1px solid var(--chip-bd)' }}>
              <span className="lp-dot-pulse" /> All-in-One Wholesale System
            </span>
            <h1 style={{ fontFamily: "'Outfit'", fontSize: '56px', lineHeight: 1.05, fontWeight: 900, letterSpacing: '-1.4px', margin: '20px 0 0' }}>
              Run your entire wholesale business in <span className="lp-grad-text">one smart system.</span>
            </h1>
            <p style={{ fontSize: '19px', color: MUTED, margin: '20px 0 20px', maxWidth: '560px' }}>
              Orders, stock, credit ledger, invoicing, a salesman app and reports — all from a single dashboard. Built for Pakistani wholesalers and distributors.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', color: MUTED, fontSize: '13.5px' }}>
              <span style={{ color: '#f59e0b', letterSpacing: '2px' }}>{[0, 1, 2, 3, 4].map(i => <i key={i} className="fa-solid fa-star" />)}</span>
              Trusted by wholesalers across Pakistan
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={goLogin} className="lp-shine" style={btnPrimary}><i className="fa-solid fa-bolt" /> Get Started</button>
              <a href={WA} target="_blank" rel="noreferrer" style={{ ...btnWa, textDecoration: 'none' }}><i className="fa-brands fa-whatsapp" /> Book a Free Demo</a>
            </div>
            <div style={{ display: 'flex', gap: '22px', flexWrap: 'wrap', marginTop: '24px', color: MUTED, fontSize: '14px' }}>
              {['No setup fee', 'English + Urdu', 'Mobile + Desktop'].map(t => (
                <span key={t}><i className="fa-solid fa-circle-check" style={{ color: '#16a34a', marginRight: '6px' }} /><b style={{ color: INK }}>{t}</b></span>
              ))}
            </div>
          </div>

          {/* Dashboard mock */}
          <div style={{ position: 'relative' }}>
            <div className="lp-mock-float" style={{ ...card, borderRadius: '22px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['#ef4444', '#f59e0b', '#10b981'].map(c => <span key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
                  </div>
                  <div style={{ fontFamily: "'Outfit'", fontWeight: 800, fontSize: '15px' }}>Dashboard</div>
                </div>
                <div style={{ display: 'flex', gap: '6px', background: SOFT, padding: '4px', borderRadius: '9px' }}>
                  {['Daily', 'Weekly', 'Monthly'].map((t, i) => (
                    <span key={t} style={{ fontSize: '11px', fontWeight: 700, padding: '5px 10px', borderRadius: '7px', color: i === 1 ? '#0ea5e9' : MUTED, background: i === 1 ? CARD : 'transparent', boxShadow: i === 1 ? '0 1px 3px rgba(0,0,0,.12)' : 'none' }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { ic: 'sack-dollar', col: '#0ea5e9', lbl: 'Total Sales', val: '₨ 3,800', chg: '↑12.5%' },
                  { ic: 'cart-shopping', col: '#6366f1', lbl: 'Orders', val: '128', chg: '↑8%' },
                  { ic: 'hand-holding-dollar', col: '#d97706', lbl: 'Credit Due', val: '₨ 45,000', chg: '' },
                  { ic: 'boxes-stacked', col: '#16a34a', lbl: 'Low Stock', val: '5 items', chg: '' },
                ].map(c => (
                  <div key={c.lbl} style={{ border: `1px solid ${LINE}`, borderRadius: '13px', padding: '13px', background: PANEL }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: `${c.col}22`, color: c.col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', marginBottom: '9px' }}><i className={`fa-solid fa-${c.ic}`} /></div>
                      {c.chg && <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>{c.chg}</span>}
                    </div>
                    <div style={{ fontSize: '10.5px', color: MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>{c.lbl}</div>
                    <div style={{ fontFamily: "'Outfit'", fontWeight: 900, fontSize: '22px', marginTop: '2px', color: c.col }}>{c.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '13px', border: `1px solid ${LINE}`, borderRadius: '13px', padding: '13px', background: PANEL }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}><b>Top Selling</b><span style={{ color: MUTED }}>This week</span></div>
                {[['Basmati Rice', '₨ 3,800', '88%'], ['Cooking Oil', '₨ 2,150', '60%']].map(([n, v, w]) => (
                  <div key={n} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}><span>{n}</span><span style={{ fontWeight: 700 }}>{v}</span></div>
                    <div style={{ height: '8px', borderRadius: '99px', background: SOFT, overflow: 'hidden' }}><div className="lp-barfill" style={{ height: '100%', width: w, borderRadius: '99px', background: GRAD }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-badge-float lp-bf1" style={{ ...card, padding: '10px 13px', fontSize: '12.5px', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-bell" /> Low-stock alert</div>
            <div className="lp-badge-float lp-bf2" style={{ ...card, padding: '10px 13px', fontSize: '12.5px', fontWeight: 700, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-brands fa-whatsapp" /> Order received</div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ background: PANEL, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, overflow: 'hidden', padding: '16px 0' }}>
        <div className="lp-marquee">
          {[...MARQUEE, ...MARQUEE].map((w, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', margin: '0 26px', fontFamily: "'Outfit'", fontWeight: 700, fontSize: '17px', color: MUTED }}>
              <i className="fa-solid fa-circle-check" style={{ color: '#0ea5e9', fontSize: '13px' }} /> {w}
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section ref={statsRef} style={{ ...sectionStyle, padding: '64px 0' }}>
        <div style={wrap}>
          <div className="lp-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '18px' }}>
            {STATS.map(s => (
              <div key={s.label} className="lp-reveal" style={{ ...card, padding: '28px 22px', textAlign: 'center' }}>
                <div style={{ width: '50px', height: '50px', margin: '0 auto 12px', borderRadius: '13px', background: GRAD, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><i className={`fa-solid fa-${s.icon}`} /></div>
                <div style={{ fontFamily: "'Outfit'", fontWeight: 900, fontSize: '42px', lineHeight: 1, background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  <span className="lp-count" data-target={s.target} data-suffix={s.suffix}>0{s.suffix}</span>
                </div>
                <div style={{ color: MUTED, fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section style={sectionStyle}>
        <div style={wrap}>
          <SectionHead icon="triangle-exclamation" eyebrow="The Problem" title="Registers and copies are a thing of the past" sub="Manual records forget credit, hide stock and waste time. WholesalePro handles all of it." />
          <div className="lp-ps" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '44px' }}>
            <div className="lp-reveal" style={{ ...card, padding: '30px', background: 'rgba(239,68,68,.06)', borderColor: 'rgba(239,68,68,.25)' }}>
              <h3 style={{ fontFamily: "'Outfit'", fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}><i className="fa-solid fa-circle-xmark" /> The old way</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '13px' }}>
                {['Credit kept in a register — often forgotten or wrong', 'Guessing stock — what’s finished, what’s not', 'Hand-written invoices — slow and error-prone', 'Salesman orders on phone calls and slips', 'Real profit never truly clear'].map(t => (
                  <li key={t} style={{ display: 'flex', gap: '11px', fontSize: '15px', color: INK }}><i className="fa-solid fa-xmark" style={{ color: '#ef4444', marginTop: '3px' }} />{t}</li>
                ))}
              </ul>
            </div>
            <div className="lp-reveal" style={{ ...card, padding: '30px', background: 'rgba(16,163,74,.06)', borderColor: 'rgba(16,163,74,.25)' }}>
              <h3 style={{ fontFamily: "'Outfit'", fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a' }}><i className="fa-solid fa-circle-check" /> With WholesalePro</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '13px' }}>
                {['Every shop’s credit tracked automatically', 'Live stock with low-stock alerts', 'One-click professional invoices + print', 'Salesmen place orders from a mobile app', 'Daily sales, loss and profit reports'].map(t => (
                  <li key={t} style={{ display: 'flex', gap: '11px', fontSize: '15px', color: INK }}><i className="fa-solid fa-check" style={{ color: '#16a34a', marginTop: '3px' }} />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ ...sectionStyle, background: PANEL, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <div style={wrap}>
          <SectionHead icon="grip" eyebrow="Features" title="Everything you need, built in" sub="One complete system that runs every part of your wholesale operation." />
          <div className="lp-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '18px', marginTop: '48px' }}>
            {FEATURES.map((f, i) => {
              const [bg, col] = ACCENTS[i % ACCENTS.length]
              return (
                <div key={f.title} className="lp-feat lp-reveal" style={{ ...card, padding: '24px' }}>
                  <div className="lp-feat-ic" style={{ width: '52px', height: '52px', borderRadius: '14px', background: bg, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '21px', marginBottom: '15px' }}><i className={`fa-solid fa-${f.icon}`} /></div>
                  <h3 style={{ fontFamily: "'Outfit'", fontSize: '17px', marginBottom: '6px' }}>{f.title}</h3>
                  <p style={{ fontSize: '13.5px', color: MUTED }}>{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={sectionStyle}>
        <div style={wrap}>
          <SectionHead icon="wand-magic-sparkles" eyebrow="How it works" title="Get started in 3 easy steps" />
          <div className="lp-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px', marginTop: '48px' }}>
            {STEPS.map(s => (
              <div key={s.n} className="lp-reveal" style={{ ...card, padding: '32px 26px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', margin: '0 auto 14px', borderRadius: '50%', background: 'var(--chip)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#6366f1' }}><i className={`fa-solid fa-${s.icon}`} /></div>
                <div style={{ fontFamily: "'Outfit'", fontWeight: 900, fontSize: '15px', color: '#0ea5e9', letterSpacing: '1px' }}>STEP {s.n}</div>
                <h3 style={{ fontFamily: "'Outfit'", fontSize: '19px', margin: '4px 0 6px' }}>{s.title}</h3>
                <p style={{ color: MUTED, fontSize: '14.5px' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section style={{ ...sectionStyle, background: PANEL, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <div style={wrap}>
          <SectionHead icon="users" eyebrow="Who it’s for" title="Made for businesses like yours" />
          <div className="lp-aud" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px', marginTop: '44px' }}>
            {AUDIENCE.map(a => (
              <div key={a.title} className="lp-reveal lp-tilt" style={{ ...card, padding: '28px', textAlign: 'center' }}>
                <i className={`fa-solid fa-${a.icon}`} style={{ fontSize: '32px', color: '#6366f1', marginBottom: '12px' }} />
                <h3 style={{ fontFamily: "'Outfit'", fontSize: '18px', marginBottom: '6px' }}>{a.title}</h3>
                <p style={{ fontSize: '13.5px', color: MUTED }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="reviews" style={sectionStyle}>
        <div style={wrap}>
          <SectionHead icon="star" eyebrow="Reviews" title="Loved by wholesalers" sub="Real-world results from businesses that switched to WholesalePro." />
          <div className="lp-rev" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px', marginTop: '48px' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="lp-reveal" style={{ ...card, padding: '28px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#f59e0b', fontSize: '15px', marginBottom: '12px', letterSpacing: '2px' }}>{[0, 1, 2, 3, 4].map(i => <i key={i} className="fa-solid fa-star" />)}</div>
                <p style={{ fontSize: '15px', color: INK, lineHeight: 1.7, flex: 1 }}>“{t.quote}”</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '18px', paddingTop: '16px', borderTop: `1px solid ${LINE}` }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: 'var(--chip)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '17px' }}><i className={`fa-solid fa-${t.icon}`} /></div>
                  <div><div style={{ fontWeight: 800, fontSize: '14.5px' }}>{t.name}</div><div style={{ fontSize: '12.5px', color: MUTED }}><i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }} />{t.city}</div></div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: MUTED, fontSize: '12.5px', marginTop: '20px' }}>* Illustrative examples — replace with your real customer reviews.</p>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ ...sectionStyle, background: PANEL, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <div style={wrap}>
          <SectionHead icon="tags" eyebrow="Pricing" title="Simple monthly plans" sub="Pick a plan that fits your business. Book a free demo first, then decide." />
          <div className="lp-price" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px', marginTop: '54px', alignItems: 'stretch' }}>
            {PLANS.map(p => (
              <div key={p.name} className="lp-reveal lp-plan" style={{ background: CARD, border: `1.5px solid ${p.pop ? '#0ea5e9' : LINE}`, borderRadius: '20px', padding: '32px 26px', boxShadow: p.pop ? '0 18px 44px rgba(14,165,233,.22)' : SHADOW, display: 'flex', flexDirection: 'column', position: 'relative', transform: p.pop ? 'translateY(-8px)' : 'none' }}>
                {p.pop && <span style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: GRAD, color: '#fff', fontSize: '11px', fontWeight: 700, padding: '5px 14px', borderRadius: '999px', letterSpacing: '.5px' }}>Most popular</span>}
                <h3 style={{ fontFamily: "'Outfit'", fontSize: '20px' }}>{p.name}</h3>
                <div style={{ fontFamily: "'Outfit'", fontWeight: 900, fontSize: '40px', margin: '10px 0 2px' }}>{p.price}<small style={{ fontSize: '15px', color: MUTED, fontWeight: 600 }}>{p.per}</small></div>
                <div style={{ fontSize: '12.5px', color: MUTED, marginBottom: '18px' }}>{p.note}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '22px', flex: 1 }}>
                  {p.items.map(it => <li key={it} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: INK }}><i className="fa-solid fa-check" style={{ color: '#16a34a', marginTop: '3px' }} />{it}</li>)}
                </ul>
                <button onClick={goLogin} className={p.pop ? 'lp-shine' : ''} style={{ ...(p.pop ? btnPrimary : btnGhost), justifyContent: 'center' }}>{p.cta}</button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: MUTED, fontSize: '13px', marginTop: '24px' }}>* Prices shown are examples — set your actual pricing here.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={sectionStyle}>
        <div style={{ ...wrap, maxWidth: '820px' }}>
          <SectionHead icon="circle-question" eyebrow="FAQ" title="Frequently asked questions" />
          <div style={{ marginTop: '42px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQS.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={f.q} className="lp-reveal" style={{ ...card, overflow: 'hidden', borderColor: open ? '#0ea5e9' : LINE }}>
                  <button onClick={() => setOpenFaq(open ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontFamily: "'Outfit'", fontWeight: 700, fontSize: '16px', color: INK }}>{f.q}</span>
                    <i className="fa-solid fa-chevron-down" style={{ color: '#0ea5e9', transition: 'transform .25s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
                  </button>
                  <div style={{ maxHeight: open ? '220px' : '0', transition: 'max-height .3s ease', overflow: 'hidden' }}>
                    <p style={{ padding: '0 22px 20px', color: MUTED, fontSize: '14.5px', lineHeight: 1.7 }}>{f.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CONTACT / BOOKING */}
      <section id="contact" style={sectionStyle}>
        <div style={wrap}>
          <div className="lp-book lp-reveal" style={{ ...card, borderRadius: '26px', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.05fr 1fr', boxShadow: '0 24px 56px rgba(2,8,23,.16)' }}>
            {/* Left — gradient persuasive panel */}
            <div className="lp-book-left" style={{ position: 'relative', color: '#fff', padding: '46px 40px', backgroundImage: `${GRIDW}, ${GRAD}`, backgroundSize: '44px 44px, cover', overflow: 'hidden' }}>
              <div className="lp-cta-orb" />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '12.5px', letterSpacing: '1px', textTransform: 'uppercase', color: '#fff', background: 'rgba(255,255,255,.18)', padding: '7px 14px', borderRadius: '999px', position: 'relative' }}><i className="fa-solid fa-calendar-check" /> Free Demo</span>
              <h2 style={{ fontFamily: "'Outfit'", fontWeight: 900, fontSize: '34px', letterSpacing: '-.5px', margin: '18px 0 12px', position: 'relative' }}>Book your free demo today</h2>
              <p style={{ fontSize: '16px', opacity: .94, position: 'relative', marginBottom: '22px' }}>Leave your details and our team will reach out — see the whole system in just 10 minutes.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', marginBottom: '26px' }}>
                {['No obligation, totally free', 'Personalized to your business', 'Setup help included'].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', fontWeight: 600 }}><i className="fa-solid fa-circle-check" style={{ color: '#bbf7d0' }} /> {t}</div>
                ))}
              </div>
              <div style={{ position: 'relative', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,.22)' }}>
                <div style={{ fontSize: '12.5px', opacity: .85, marginBottom: '4px' }}>Or contact us directly</div>
                <a href={TEL} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#fff', textDecoration: 'none', fontFamily: "'Outfit'", fontWeight: 900, fontSize: '24px' }}><i className="fa-solid fa-phone" /> 0328 7458137</a>
                <div style={{ marginTop: '14px' }}>
                  <a href={WA} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '14px', padding: '10px 18px', borderRadius: '999px', textDecoration: 'none' }}><i className="fa-brands fa-whatsapp" /> Chat on WhatsApp</a>
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div style={{ padding: '40px 36px', background: CARD }}>
              {sent ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%', minHeight: '320px' }}>
                  <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: 'rgba(16,163,74,.14)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '34px', marginBottom: '18px' }}><i className="fa-solid fa-circle-check" /></div>
                  <h3 style={{ fontFamily: "'Outfit'", fontWeight: 800, fontSize: '22px', color: INK, marginBottom: '8px' }}>Request received!</h3>
                  <p style={{ color: MUTED, fontSize: '15px', maxWidth: '320px', marginBottom: '22px' }}>Thank you — our team will contact you shortly on your phone or WhatsApp.</p>
                  <button onClick={() => setSent(false)} style={{ ...btnGhost }}><i className="fa-solid fa-rotate-left" /> Send another request</button>
                </div>
              ) : (
                <form onSubmit={submitBooking}>
                  <h3 style={{ fontFamily: "'Outfit'", fontWeight: 800, fontSize: '22px', color: INK, marginBottom: '4px' }}>Tell us about your business</h3>
                  <p style={{ color: MUTED, fontSize: '13.5px', marginBottom: '20px' }}>Fields marked * are required.</p>

                  {formErr && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#ef4444', borderRadius: '10px', padding: '10px 13px', fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>{formErr}</div>}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="lp-form-grid">
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={lblStyle}>Your Name *</label>
                      <input style={inpStyle} value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Ali Hassan" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={lblStyle}>Business / Shop Name</label>
                      <input style={inpStyle} value={form.business} onChange={e => setField('business', e.target.value)} placeholder="e.g. Al-Falah General Store" />
                    </div>
                    <div>
                      <label style={lblStyle}>Phone *</label>
                      <input style={inpStyle} value={form.phone} inputMode="tel" onChange={e => setField('phone', e.target.value)} placeholder="03001234567" />
                    </div>
                    <div>
                      <label style={lblStyle}>City</label>
                      <input style={inpStyle} value={form.city} onChange={e => setField('city', e.target.value)} placeholder="Lahore" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={lblStyle}>Interested Plan</label>
                      <select style={inpStyle} value={form.plan} onChange={e => setField('plan', e.target.value)}>
                        <option value="">Not sure yet</option>
                        <option value="Basic">Basic</option>
                        <option value="Premium">Premium</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={lblStyle}>Message</label>
                      <textarea style={{ ...inpStyle, minHeight: '84px', resize: 'vertical' }} value={form.message} onChange={e => setField('message', e.target.value)} placeholder="Anything you'd like us to know..." />
                    </div>
                  </div>

                  <button type="submit" disabled={booking} className="lp-shine" style={{ ...btnPrimary, width: '100%', justifyContent: 'center', marginTop: '18px', opacity: booking ? .75 : 1, cursor: booking ? 'not-allowed' : 'pointer' }}>
                    {booking ? <><i className="fa-solid fa-circle-notch fa-spin" /> Sending...</> : <><i className="fa-solid fa-paper-plane" /> Request Free Demo</>}
                  </button>
                  <p style={{ color: MUTED, fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>We’ll contact you on your phone / WhatsApp. No spam.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--footbg)', color: '#cbd5e1', padding: '56px 0 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: DOTS, opacity: .25, pointerEvents: 'none' }} />
        <div style={{ ...wrap, position: 'relative' }}>
          <div className="lp-foot" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '30px', paddingBottom: '30px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Outfit'", fontWeight: 900, fontSize: '21px' }}>W</div>
                <div><div style={{ fontFamily: "'Outfit'", fontSize: '19px', fontWeight: 800, color: '#fff' }}>WholesalePro</div><div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '1.5px', fontWeight: 600 }}>BY TECHRIWAAYAT</div></div>
              </div>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '14px', maxWidth: '320px' }}>A complete management system for Pakistani wholesalers and distributors — orders, stock, credit, invoicing and reports, all in one place.</p>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '14px', fontFamily: "'Outfit'" }}>Product</h4>
              {[['Features', '#features'], ['How it works', '#how'], ['Reviews', '#reviews'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([t, h]) => (
                <a key={t} href={h} style={{ display: 'block', color: '#94a3b8', fontSize: '14px', marginBottom: '9px', textDecoration: 'none' }}>{t}</a>
              ))}
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '14px', fontFamily: "'Outfit'" }}>Contact</h4>
              <a href={TEL} style={{ display: 'block', color: '#94a3b8', fontSize: '14px', marginBottom: '9px', textDecoration: 'none' }}><i className="fa-solid fa-phone" style={{ width: '18px' }} /> 0328 7458137</a>
              <a href={WA} target="_blank" rel="noreferrer" style={{ display: 'block', color: '#94a3b8', fontSize: '14px', marginBottom: '9px', textDecoration: 'none' }}><i className="fa-brands fa-whatsapp" style={{ width: '18px' }} /> WhatsApp</a>
              <button onClick={goLogin} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', padding: 0 }}><i className="fa-solid fa-right-to-bracket" style={{ width: '18px' }} /> Login</button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '22px', fontSize: '13px', color: '#64748b' }}>
            <span>© {new Date().getFullYear()} WholesalePro — by TechRiwaayat. All rights reserved.</span>
            <span>Made with care for Pakistani wholesalers</span>
          </div>
        </div>
      </footer>

      <style>{`
        .lp{
          --bg:#eef3f9;--panel:#ffffff;--card:#ffffff;--soft:#f4f7fb;
          --ink:#1e293b;--muted:#64748b;--line:#e2e8f0;
          --chip:#e0f2fe;--chip-bd:#bae6fd;
          --glass:rgba(255,255,255,.82);
          --shadow:0 1px 3px rgba(0,0,0,.07),0 10px 30px rgba(2,8,23,.06);
          --footbg:#0b1220;
        }
        .lp.lp-dark{
          --bg:#0a1020;--panel:#0f1830;--card:#131d33;--soft:#0e1729;
          --ink:#e6edf6;--muted:#94a4bd;--line:#22304b;
          --chip:rgba(14,165,233,.16);--chip-bd:rgba(14,165,233,.35);
          --glass:rgba(15,23,42,.72);
          --shadow:0 1px 3px rgba(0,0,0,.4),0 16px 36px rgba(0,0,0,.5);
          --footbg:#070c17;
        }
        .lp-navlink:hover{color:var(--sky,#0ea5e9) !important}

        .lp-hero-bg{position:absolute;inset:0;overflow:hidden;pointer-events:none}
        .lp-hero-bg .lp-dots{position:absolute;inset:0;background-image:${DOTS};opacity:.6;-webkit-mask-image:radial-gradient(circle at 50% 28%,#000,transparent 72%);mask-image:radial-gradient(circle at 50% 28%,#000,transparent 72%)}
        .lp-blob{position:absolute;filter:blur(48px);opacity:.5;border-radius:50%}
        .lp-dark .lp-blob{opacity:.38}
        .lp-blob1{width:440px;height:440px;background:radial-gradient(circle,#7dd3fc,transparent 70%);top:-130px;right:-70px;animation:lp-float 9s ease-in-out infinite}
        .lp-blob2{width:380px;height:380px;background:radial-gradient(circle,#c4b5fd,transparent 70%);top:120px;left:-110px;animation:lp-float2 11s ease-in-out infinite}
        .lp-blob3{width:320px;height:320px;background:radial-gradient(circle,#a5f3fc,transparent 70%);bottom:-130px;left:42%;animation:lp-float 13s ease-in-out infinite}

        .lp-grad-text{background:linear-gradient(90deg,#0ea5e9,#6366f1,#0ea5e9);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:lp-grad 5s linear infinite}
        @keyframes lp-grad{to{background-position:200% center}}
        .lp-dot-pulse{width:9px;height:9px;border-radius:50%;background:#0ea5e9;animation:lp-pulse 1.8s infinite}
        @keyframes lp-pulse{0%{box-shadow:0 0 0 0 rgba(14,165,233,.55)}70%{box-shadow:0 0 0 10px rgba(14,165,233,0)}100%{box-shadow:0 0 0 0 rgba(14,165,233,0)}}
        @keyframes lp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
        @keyframes lp-float2{0%,100%{transform:translate(0,0)}50%{transform:translate(12px,14px)}}
        .lp-mock-float{animation:lp-float 6.5s ease-in-out infinite}
        .lp-badge-float{position:absolute;animation:lp-float2 5s ease-in-out infinite}
        .lp-bf1{top:6px;right:-10px}
        .lp-bf2{bottom:-14px;left:-12px;animation-delay:1.2s}
        .lp-barfill{animation:lp-grow 1.4s ease both}
        @keyframes lp-grow{from{width:0 !important}}
        .lp-shine{position:relative;overflow:hidden}
        .lp-shine::after{content:"";position:absolute;top:0;left:-120%;width:60%;height:100%;background:linear-gradient(120deg,transparent,rgba(255,255,255,.45),transparent);transform:skewX(-20deg);animation:lp-shine 3.2s ease-in-out infinite}
        @keyframes lp-shine{0%{left:-120%}60%,100%{left:140%}}
        .lp-marquee{display:flex;width:max-content;animation:lp-marq 26s linear infinite}
        .lp-marquee:hover{animation-play-state:paused}
        @keyframes lp-marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .lp-feat{transition:transform .2s,box-shadow .2s,border-color .2s}
        .lp-feat:hover{transform:translateY(-6px);box-shadow:0 18px 40px rgba(2,8,23,.16);border-color:#bae6fd}
        .lp-feat .lp-feat-ic{transition:transform .3s}
        .lp-feat:hover .lp-feat-ic{transform:rotate(-8deg) scale(1.08)}
        .lp-tilt{transition:transform .2s,box-shadow .2s}
        .lp-tilt:hover{transform:translateY(-5px)}
        .lp-plan{transition:transform .2s,box-shadow .2s}
        .lp-plan:hover{box-shadow:0 20px 46px rgba(2,8,23,.18)}
        .lp-cta-orb{position:absolute;width:340px;height:340px;border-radius:50%;background:rgba(255,255,255,.1);top:-130px;right:-70px;animation:lp-float 8s ease-in-out infinite}
        .lp-reveal{opacity:0;transform:translateY(26px);transition:opacity .6s ease,transform .6s ease}
        .lp-reveal.lp-in{opacity:1;transform:none}

        @media(max-width:920px){
          .lp-hero-grid{grid-template-columns:1fr !important;gap:36px !important}
          .lp-feat-grid{grid-template-columns:repeat(2,1fr) !important}
          .lp-stats-grid{grid-template-columns:repeat(2,1fr) !important}
          .lp-ps,.lp-steps,.lp-aud,.lp-price,.lp-rev{grid-template-columns:1fr !important}
          .lp-book{grid-template-columns:1fr !important}
          .lp-plan{transform:none !important}
          .lp-foot{grid-template-columns:1fr 1fr !important}
        }
        @media(max-width:640px){
          .lp-navlinks{display:none !important}
          .lp-navlinks.lp-open{display:flex !important;position:absolute;top:74px;left:22px;right:22px;flex-direction:column;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 20px;gap:16px;align-items:flex-start;box-shadow:var(--shadow)}
          .lp-burger{display:flex !important;align-items:center;justify-content:center}
          .lp-hide-sm{display:none !important}
          .lp-feat-grid,.lp-stats-grid{grid-template-columns:1fr !important}
          .lp-form-grid{grid-template-columns:1fr !important}
          .lp-foot{grid-template-columns:1fr !important}
        }
        @media(prefers-reduced-motion:reduce){
          .lp-mock-float,.lp-badge-float,.lp-blob,.lp-shine::after,.lp-marquee,.lp-cta-orb,.lp-grad-text{animation:none !important}
        }
      `}</style>
    </div>
  )
}
