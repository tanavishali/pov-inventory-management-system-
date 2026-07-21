const btnBase = {
  minWidth: '32px', height: '32px', padding: '0 8px', borderRadius: '8px',
  border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b',
  fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans',sans-serif",
}
const activeBtn = { ...btnBase, background: '#0ea5e9', color: '#fff', border: '1.5px solid #0ea5e9' }
const disabledBtn = { ...btnBase, opacity: .4, cursor: 'not-allowed' }

// Reusable server-side pagination bar: shows a page-number window plus prev/next
// and a "showing X-Y of Z" label. Backend is the source of truth for `total`/`totalPages`.
export default function Pagination({ page, totalPages, total, pageSize, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null

  const windowSize = 5
  let start = Math.max(1, page - Math.floor(windowSize / 2))
  let end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const pages = []
  for (let p = start; p <= end; p++) pages.push(p)

  const showingFrom = total ? (page - 1) * pageSize + 1 : 0
  const showingTo = total ? Math.min(page * pageSize, total) : 0

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '18px' }}>
      {typeof total === 'number' && (
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          <strong style={{ color: '#1e293b' }}>{showingFrom}-{showingTo}</strong> of {total}
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: 'auto' }}>
        <button type="button" style={page <= 1 ? disabledBtn : btnBase} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <i className="fa-solid fa-chevron-left" />
        </button>
        {start > 1 && <span style={{ color: '#94a3b8', fontSize: '12px', padding: '0 2px' }}>…</span>}
        {pages.map(p => (
          <button type="button" key={p} style={p === page ? activeBtn : btnBase} onClick={() => onPageChange(p)}>
            {p}
          </button>
        ))}
        {end < totalPages && <span style={{ color: '#94a3b8', fontSize: '12px', padding: '0 2px' }}>…</span>}
        <button type="button" style={page >= totalPages ? disabledBtn : btnBase} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <i className="fa-solid fa-chevron-right" />
        </button>
      </div>
    </div>
  )
}
