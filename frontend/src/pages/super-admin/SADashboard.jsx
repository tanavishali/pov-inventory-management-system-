export default function SADashboard() {
  const platformStats = [
    { label: 'Total Licenses Sold', value: '184', growth: '+24', color: '#0ea5e9', bg: '#e0f2fe', icon: 'certificate' },
    { label: 'Active Shops',        value: '12',  growth: 'Live',color: '#16a34a', bg: '#dcfce7', icon: 'store' },
    { label: 'Monthly Revenue',     value: '₨842K',growth:'+8.4%',color:'#6d28d9', bg: '#ede9fe', icon: 'sack-dollar' },
    { label: 'Unpaid Accounts',     value: '15',  growth: 'Alert',color: '#dc2626', bg: '#fee2e2', icon: 'hand-holding-dollar' },
  ]

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct']
  const bars   = [45, 60, 55, 80, 70, 95, 110, 100, 120, 142]
  const maxBar = Math.max(...bars)

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {platformStats.map((stat, i) => (
          <div key={i} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px 22px', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#bae6fd'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(14,165,233,.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.06)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px' }}>
                <i className={`fa-solid fa-${stat.icon}`} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: stat.color, background: stat.bg, padding: '3px 9px', borderRadius: '6px' }}>
                {stat.growth}
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>{stat.label}</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '26px', fontWeight: 900, color: '#1e293b', letterSpacing: '-.5px' }}>{stat.value}</div>
            <i className={`fa-solid fa-${stat.icon}`} style={{ position: 'absolute', right: '-12%', bottom: '-10%', fontSize: '80px', color: stat.color, opacity: 0.05, transform: 'rotate(-12deg)' }} />
          </div>
        ))}
      </div>


      <style>{`@media(max-width:768px){.sa-grid-2{grid-template-columns:1fr !important;}}`}</style>
    </div>
  )
}
