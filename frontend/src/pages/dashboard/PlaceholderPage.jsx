export default function PlaceholderPage({ title, icon, color = '#0ea5e9' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: '18px', textAlign: 'center',
    }}>
      <div style={{
        width: '90px', height: '90px', borderRadius: '22px',
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '38px', color,
        boxShadow: `0 8px 30px ${color}22`,
      }}>
        <i className={`fa-solid fa-${icon}`} />
      </div>
      <div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '22px', color: '#1e293b', marginBottom: '8px' }}>
          {title}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
          This section is under development. Coming soon!
        </p>
      </div>
      <div style={{
        padding: '10px 22px', borderRadius: '999px',
        background: `${color}15`, color,
        fontSize: '13px', fontWeight: 700,
        border: `1.5px solid ${color}30`,
      }}>
        <i className="fa-solid fa-code" style={{ marginRight: '8px' }} />
        In Development
      </div>
    </div>
  )
}
