// components/MetricCard.jsx
export default function MetricCard({ label, value, sub, icon, trend, color }) {
  const trendColor = trend > 0 ? 'var(--green)' : trend < 0 ? 'var(--red)' : 'var(--text3)'
  const trendIcon = trend > 0 ? '▲' : trend < 0 ? '▼' : '—'

  return (
    <div className="card-sm" style={{ position: 'relative', overflow: 'hidden' }}>
      {color && (
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 3, height: '100%',
          background: color, borderRadius: '0 12px 12px 0', opacity: 0.7
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text1)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        {trend !== undefined && (
          <span style={{ fontSize: 11, color: trendColor, fontWeight: 500 }}>
            {trendIcon} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {sub && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</span>}
      </div>
    </div>
  )
}
