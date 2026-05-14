import '../styles/skeleton.css'

function Sk({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <span className={`sk ${className}`} style={style} aria-hidden="true" />
}

/* ── Public: product card grid ───────────────────────────── */
export function SkeletonProductGrid({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="sk-card">
          <Sk className="sk-card-img" />
          <div className="sk-card-body">
            <Sk className="sk-line" style={{ width: '82%' }} />
            <Sk className="sk-line" style={{ width: '42%' }} />
          </div>
        </div>
      ))}
    </>
  )
}

/* ── Public: product detail page ─────────────────────────── */
export function SkeletonProductPage() {
  return (
    <div className="sk-product-wrap">
      {/* Gallery column */}
      <div className="sk-product-gallery">
        <Sk className="sk-product-main-img" />
        <div className="sk-product-thumbs">
          {[0, 1, 2].map(i => <Sk key={i} className="sk-product-thumb" />)}
        </div>
      </div>

      {/* Info column */}
      <div className="sk-product-info">
        <Sk className="sk-line" style={{ width: '38%', height: 10 }} />
        <Sk className="sk-line" style={{ width: '85%', height: 30, marginTop: 4 }} />
        <Sk className="sk-line" style={{ width: '60%', height: 22, marginTop: 2 }} />
        <Sk className="sk-line" style={{ width: '28%', height: 18, marginTop: 12 }} />
        {/* Size swatches */}
        <div className="sk-swatch-row">
          {[0, 1, 2, 3].map(i => <Sk key={i} style={{ width: 48, height: 36 }} />)}
        </div>
        {/* Color dots */}
        <div className="sk-swatch-row">
          {[0, 1, 2].map(i => <Sk key={i} style={{ width: 28, height: 28, borderRadius: '50%' }} />)}
        </div>
        {/* CTA button */}
        <Sk style={{ width: '100%', height: 52, marginTop: 8 }} />
        {/* Accordion lines */}
        {[0, 1, 2].map(i => (
          <Sk key={i} className="sk-line" style={{ width: '100%', height: 44, marginTop: 4 }} />
        ))}
      </div>
    </div>
  )
}

/* ── Public: journal article ─────────────────────────────── */
export function SkeletonArticle() {
  return (
    <div className="sk-article-wrap">
      <Sk className="sk-article-hero" />
      <div className="sk-article-body">
        <Sk className="sk-line" style={{ width: '22%', height: 10 }} />
        <Sk className="sk-line" style={{ width: '92%', height: 34, marginTop: 6 }} />
        <Sk className="sk-line" style={{ width: '72%', height: 34 }} />
        <Sk className="sk-line" style={{ width: '48%', height: 12, marginTop: 8 }} />
        <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {[100, 94, 88, 100, 78, 100, 92, 68, 100, 84].map((w, i) => (
            <Sk key={i} className="sk-line" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Admin: table rows ───────────────────────────────────── */
export function SkeletonAdminTable({ cols = 5, rows = 7 }: { cols?: number; rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="sk-table-row">
          <Sk className="sk-thumb" />
          <Sk className="sk-line" style={{ flex: 2, height: 12 }} />
          {Array.from({ length: cols - 2 }, (_, c) => (
            <Sk key={c} className="sk-line" style={{ flex: 1, height: 12 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ── Admin: stat / report cards ──────────────────────────── */
export function SkeletonStatCards({
  count = 4,
  className = 'admin-stat-card',
}: {
  count?: number
  className?: string
}) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={className}>
          <div className="sk-stat-card">
            <Sk style={{ width: 28, height: 2 }} />
            <Sk className="sk-line" style={{ width: '55%', height: 10 }} />
            <Sk className="sk-line" style={{ width: '42%', height: 38, marginTop: 4 }} />
            <Sk className="sk-line" style={{ width: '50%', height: 10 }} />
          </div>
        </div>
      ))}
    </>
  )
}

/* ── Admin: full reports page ────────────────────────────── */
const BAR_HEIGHTS = [55, 80, 42, 70, 90, 58]

export function SkeletonReports() {
  return (
    <>
      <div className="admin-reports-grid">
        <SkeletonStatCards count={4} className="admin-report-card" />
      </div>

      <div className="admin-chart" style={{ marginTop: '1.5rem' }}>
        <Sk className="sk-line" style={{ width: 160, height: 16, marginBottom: '2rem' }} />
        <div className="sk-chart-bars">
          {BAR_HEIGHTS.map((h, i) => (
            <div key={i} className="sk-chart-bar-col">
              <Sk className="sk-chart-bar" style={{ height: `${h}%` }} />
              <Sk className="sk-line" style={{ width: '80%', height: 8 }} />
            </div>
          ))}
        </div>
      </div>

      <div className="admin-table-wrap" style={{ marginTop: '1.5rem' }}>
        <div className="admin-table-header">
          <Sk className="sk-line" style={{ width: 160, height: 14 }} />
        </div>
        <SkeletonAdminTable cols={3} rows={5} />
      </div>
    </>
  )
}

/* ── Admin: dashboard stat cards ─────────────────────────── */
export function SkeletonDashboard() {
  return (
    <div className="admin-stats-grid">
      <SkeletonStatCards count={4} className="admin-stat-card" />
    </div>
  )
}
