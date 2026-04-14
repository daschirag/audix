import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const D  = "'Orbitron', sans-serif"
const B  = "'Inter', sans-serif"
const CY = '#00f0ff'
const MG = '#ff00e5'
const GN = '#39ff14'
const GD = '#ffd700'
const CD = '#111827'
const C2 = '#1a2332'
const TX = '#e0e6ed'
const DM = '#7a8ba0'
const BR = 'rgba(0,240,255,0.15)'

const tooltipStyle = {
  contentStyle: {
    background: CD, border: `1px solid ${BR}`,
    borderRadius: '10px', color: TX, fontSize: '12px', fontFamily: B,
  },
  labelStyle: { color: DM },
  cursor: { fill: 'rgba(0,240,255,0.04)' },
}

function ChartCard({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      style={{
        background: CD, border: `1px solid ${BR}`,
        borderRadius: '16px', padding: '20px 24px',
      }}
    >
      <h3 style={{
        fontFamily: D, fontSize: '0.7rem', fontWeight: 700,
        color: DM, letterSpacing: '3px', marginBottom: '18px',
        textTransform: 'uppercase',
      }}>
        {title}
      </h3>
      {children}
    </motion.div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div style={{
      background: C2, border: `1px solid ${BR}`,
      borderRadius: '12px', padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: '4px',
    }}>
      <p style={{ fontSize: '11px', color: DM, fontFamily: B, letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ fontFamily: D, fontSize: '1.4rem', fontWeight: 900, color: color || TX, lineHeight: 1 }}>
        {value ?? '—'}
      </p>
    </div>
  )
}

export default function Analytics() {
  const { data: sessions } = useQuery({
    queryKey: ['analytics-sessions'],
    queryFn: () => api.get('/analytics').then((r) => r.data.data),
  })
  const { data: scores } = useQuery({
    queryKey: ['analytics-scores'],
    queryFn: () => api.get('/analytics/score-distribution').then((r) => r.data.data),
  })
  const { data: rounds } = useQuery({
    queryKey: ['analytics-rounds'],
    queryFn: () => api.get('/analytics/round-stats').then((r) => r.data.data),
  })

  const daily = sessions?.daily ?? []
  const byDept = sessions?.byDept ?? []
  const scoreDist = scores ?? []
  const roundStats = rounds ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: B }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: D, fontSize: '1.4rem', fontWeight: 700, color: TX, letterSpacing: '0.04em', marginBottom: '4px' }}>
          Analytics
        </h1>
        <p style={{ fontSize: '13px', color: DM }}>Platform performance insights</p>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
        <StatPill label="Active Users (30d)" value={sessions?.activeUsers30d ?? '—'} color={CY} />
        <StatPill label="Completion Rate"    value={sessions?.completionRate ? `${sessions.completionRate}%` : '—'} color={GN} />
        <StatPill label="Avg Session Time"   value={sessions?.avgDuration ? `${sessions.avgDuration}m` : '—'} color={MG} />
        <StatPill label="Total Sessions"     value={sessions?.total ?? '—'} color={GD} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        <ChartCard title="Sessions Over Time" delay={0}>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke={BR} />
              <XAxis dataKey="date" tick={{ fill: DM, fontSize: 10, fontFamily: B }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: DM, fontSize: 10, fontFamily: B }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Line
                type="monotone" dataKey="count" stroke={CY} strokeWidth={2}
                dot={false} activeDot={{ r: 4, fill: CY, stroke: CD, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Score Distribution" delay={0.06}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={scoreDist}>
              <CartesianGrid strokeDasharray="3 3" stroke={BR} />
              <XAxis dataKey="range" tick={{ fill: DM, fontSize: 10, fontFamily: B }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: DM, fontSize: 10, fontFamily: B }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill={MG} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Avg Score by Round" delay={0.12}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={roundStats}>
              <CartesianGrid strokeDasharray="3 3" stroke={BR} />
              <XAxis
                dataKey="round"
                tickFormatter={(v) => `R${v}`}
                tick={{ fill: DM, fontSize: 10, fontFamily: B }}
                axisLine={false} tickLine={false}
              />
              <YAxis tick={{ fill: DM, fontSize: 10, fontFamily: B }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} labelFormatter={(v) => `Round ${v}`} />
              <Bar dataKey="avgScore" fill={GD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Department leaderboard — CSS bars (no library) */}
        <ChartCard title="Department Leaderboard" delay={0.18}>
          {byDept.length === 0 ? (
            <p style={{ fontSize: '13px', color: DM, textAlign: 'center', padding: '40px 0', fontFamily: B }}>
              No data yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
              {byDept.slice(0, 5).map((d, i) => {
                const max = Math.max(...byDept.slice(0, 5).map((x) => x.avgScore || x.count || 0), 1)
                const val = d.avgScore || d.count || 0
                const pct = (val / max) * 100
                const colors = [CY, MG, GD, GN, '#a86fdf']
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: TX, fontFamily: B, width: '90px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.dept || d.department || d._id || `Dept ${i + 1}`}
                    </span>
                    <div style={{ flex: 1, height: '8px', background: C2, borderRadius: '4px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.2 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: '100%', borderRadius: '4px', background: colors[i] }}
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: DM, fontFamily: B, width: '32px', textAlign: 'right' }}>
                      {Math.round(val)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Round performance table */}
      {roundStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          style={{ background: CD, border: `1px solid ${BR}`, borderRadius: '16px', overflow: 'hidden' }}
        >
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BR}` }}>
            <h3 style={{ fontFamily: D, fontSize: '0.7rem', fontWeight: 700, color: DM, letterSpacing: '3px' }}>
              ROUND PERFORMANCE
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BR}` }}>
                {['Round', 'Avg Score', 'Completion %', 'Attempts'].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 16px',
                    fontSize: '10px', color: DM, fontFamily: B,
                    fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roundStats.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid rgba(0,240,255,0.06)`, transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C2)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{
                      fontFamily: D, fontSize: '10px', fontWeight: 700, color: MG,
                      padding: '2px 8px', borderRadius: '20px', letterSpacing: '2px',
                      background: 'rgba(255,0,229,0.08)', border: '1px solid rgba(255,0,229,0.2)',
                    }}>
                      R{r.round}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', fontFamily: D, fontWeight: 700, color: GD, fontSize: '0.9rem' }}>
                    {Math.round(r.avgScore ?? 0)}
                  </td>
                  <td style={{ padding: '11px 16px', color: TX, fontFamily: B }}>
                    {r.completionRate != null ? `${Math.round(r.completionRate)}%` : '—'}
                  </td>
                  <td style={{ padding: '11px 16px', color: DM, fontFamily: B }}>
                    {r.attempts ?? r.count ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )
}
