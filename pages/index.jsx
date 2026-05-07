// pages/index.jsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import MetricCard from '../components/MetricCard'
import { SpendRevenueChart, RoasChart } from '../components/Charts'
import Notes from '../components/Notes'
import { AD_ACCOUNTS } from '../lib/accounts'

const RANGES = [
  { label: 'Aaj', value: '1' },
  { label: '7 Din', value: '7' },
  { label: '30 Din', value: '30' },
  { label: 'Sab', value: '0' },
]

function fmtPKR(v) {
  if (!v && v !== 0) return '—'
  if (v >= 1000000) return 'Rs ' + (v / 1000000).toFixed(2) + 'M'
  if (v >= 1000) return 'Rs ' + (v / 1000).toFixed(1) + 'K'
  return 'Rs ' + Math.round(v)
}
function fmtNum(v) {
  if (!v && v !== 0) return '—'
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M'
  if (v >= 1000) return (v / 1000).toFixed(1) + 'K'
  return Math.round(v).toLocaleString()
}

function Skeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="shimmer" style={{ height: 96, borderRadius: 12 }} />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [account, setAccount] = useState(AD_ACCOUNTS[0])
  const [range, setRange] = useState('7')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchData = useCallback(async (accId, r) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/sheet-data?accountId=${accId}&range=${r}`)
      if (!res.ok) throw new Error('Data load nahi hua — sheet publicly shared hai?')
      const json = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData(account.id, range)
    const interval = setInterval(() => fetchData(account.id, range), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [account.id, range, fetchData])

  const s = data?.summary
  const roasColor = !s ? 'var(--text3)' : s.avgRoas >= 3 ? 'var(--green)' : s.avgRoas >= 1.5 ? 'var(--amber)' : 'var(--red)'

  return (
    <>
      <Head>
        <title>Ads Dashboard — {account.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar overlay mobile */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40,
            display: 'none'
          }} className="mobile-overlay" />
        )}

        {/* Sidebar */}
        <aside style={{
          width: 220, flexShrink: 0, background: 'var(--bg2)',
          borderRight: '1px solid var(--border)', padding: '24px 0',
          position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto',
          zIndex: 50, transition: 'transform 0.25s ease',
        }} className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--text1)' }}>
              📊 Ads Dashboard
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Meta Ads Reporter</div>
          </div>

          <div style={{ padding: '16px 12px 0' }}>
            <p style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, padding: '0 8px', marginBottom: 8 }}>
              Ad Accounts
            </p>
            {AD_ACCOUNTS.map(acc => (
              <button key={acc.id} onClick={() => { setAccount(acc); setSidebarOpen(false) }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2, textAlign: 'left',
                background: account.id === acc.id ? `${acc.color}18` : 'transparent',
                color: account.id === acc.id ? acc.color : 'var(--text2)',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 18 }}>{acc.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: account.id === acc.id ? 600 : 400 }}>{acc.name}</span>
                {account.id === acc.id && (
                  <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: acc.color, flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>

          {lastUpdated && (
            <div style={{ padding: '20px 20px 0', marginTop: 'auto' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.5 }}>
                Last updated<br />
                {lastUpdated.toLocaleTimeString()}
              </div>
              <button onClick={() => fetchData(account.id, range)} className="btn btn-ghost" style={{ width: '100%', marginTop: 8, fontSize: 12 }}>
                ↻ Refresh
              </button>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, marginLeft: 220, padding: '24px 28px', minWidth: 0 }} className="main-content">

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setSidebarOpen(o => !o)} className="hamburger-btn btn btn-ghost" style={{ display: 'none', padding: '6px 10px' }}>
                ☰
              </button>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: account.color, lineHeight: 1 }}>
                  {account.emoji} {account.name}
                </h1>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>Meta Ads Performance Report</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {RANGES.map(r => (
                <button key={r.value} onClick={() => setRange(r.value)} className="btn" style={{
                  fontSize: 12, padding: '6px 14px',
                  background: range === r.value ? account.color : 'var(--bg3)',
                  color: range === r.value ? '#fff' : 'var(--text2)',
                  border: range === r.value ? 'none' : '1px solid var(--border2)',
                }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(255,92,92,0.1)', border: '1px solid rgba(255,92,92,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: 'var(--red)', fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Metrics */}
          {loading ? <Skeleton /> : s ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }} className="fade-in">
              <MetricCard label="Total Spend" value={fmtPKR(s.totalSpend)} icon="💸" color={account.color} sub="Ad budget used" />
              <MetricCard label="Revenue" value={fmtPKR(s.totalRevenue)} icon="💰" color="var(--green)" sub="Purchases value" />
              <MetricCard label="Purchases" value={fmtNum(s.totalPurchases)} icon="🛒" color={account.color} sub="Total orders" />
              <MetricCard label="ROAS" value={s.avgRoas.toFixed(2) + 'x'} icon="📈" color={roasColor} sub={s.avgRoas >= 3 ? 'Target se upar ✅' : 'Target 3x se neeche ⚠️'} />
              <MetricCard label="Impressions" value={fmtNum(s.totalImpressions)} icon="👁️" color="var(--text2)" sub="Total views" />
              <MetricCard label="Link Clicks" value={fmtNum(s.totalClicks)} icon="🔗" color="var(--text2)" sub={`CTR ${(s.avgCtr * 100).toFixed(2)}%`} />
            </div>
          ) : null}

          {/* Charts */}
          {!loading && data?.byDate?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }} className="fade-in charts-grid">
              <div className="card">
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Spend vs Revenue
                </p>
                <SpendRevenueChart data={data.byDate} />
                <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: '#6c63ff', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: '#6c63ff', display: 'inline-block' }} /> Spend
                  </span>
                  <span style={{ fontSize: 11, color: '#22c98a', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: '#22c98a', display: 'inline-block' }} /> Revenue
                  </span>
                </div>
              </div>
              <div className="card">
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Daily ROAS
                </p>
                <RoasChart data={data.byDate} />
              </div>
            </div>
          )}

          {/* Campaigns table */}
          {!loading && data?.byCampaign?.length > 0 && (
            <div className="card fade-in" style={{ marginBottom: 20, overflowX: 'auto' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                📣 Campaign Breakdown
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Campaign', 'Spend', 'Revenue', 'ROAS', 'Purchases', 'Clicks'].map(h => (
                      <th key={h} style={{ textAlign: h === 'Campaign' ? 'left' : 'right', padding: '8px 10px', color: 'var(--text3)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.byCampaign.map((c, i) => {
                    const rColor = c.roas >= 3 ? 'var(--green)' : c.roas >= 1.5 ? 'var(--amber)' : 'var(--red)'
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '10px 10px', color: 'var(--text1)', fontWeight: 500, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.campaign}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', color: 'var(--text2)' }}>{fmtPKR(c.spend)}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', color: 'var(--green)' }}>{fmtPKR(c.revenue)}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                          <span style={{ color: rColor, fontWeight: 600 }}>{c.roas.toFixed(2)}x</span>
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', color: 'var(--text2)' }}>{fmtNum(c.purchases)}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', color: 'var(--text2)' }}>{fmtNum(c.clicks)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Notes */}
          <Notes accountId={account.id} />

          <div style={{ height: 40 }} />
        </main>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.sidebar-open { transform: translateX(0); }
          .mobile-overlay { display: block !important; }
          .hamburger-btn { display: flex !important; }
          .main-content { margin-left: 0 !important; padding: 16px !important; }
          .charts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
