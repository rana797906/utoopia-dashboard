// components/Charts.jsx
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { format, parseISO, isValid } from 'date-fns'

function fmtDate(d) {
  try { const p = parseISO(d); return isValid(p) ? format(p, 'dd MMM') : d } catch { return d }
}
function fmtPKR(v) {
  if (v >= 1000000) return 'Rs ' + (v / 1000000).toFixed(1) + 'M'
  if (v >= 1000) return 'Rs ' + (v / 1000).toFixed(0) + 'K'
  return 'Rs ' + Math.round(v)
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#18181f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#9090a8', marginBottom: 6, fontWeight: 500 }}>{fmtDate(label)}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.name === 'ROAS' ? p.value.toFixed(2) + 'x' : fmtPKR(p.value)}</strong>
        </p>
      ))}
    </div>
  )
}

export function SpendRevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c98a" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c98a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: '#55556a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => fmtPKR(v)} tick={{ fill: '#55556a', fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="spend" name="Spend" stroke="#6c63ff" strokeWidth={2} fill="url(#spendGrad)" />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#22c98a" strokeWidth={2} fill="url(#revGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function RoasChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: '#55556a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => v.toFixed(1) + 'x'} tick={{ fill: '#55556a', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="roas" name="ROAS" fill="#6c63ff" radius={[4, 4, 0, 0]}
          label={false}
          background={false}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
