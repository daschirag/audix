import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import {
  RiUserLine, RiShieldLine, RiCalendarLine,
  RiBarChartLine, RiTrophyLine, RiTimeLine,
} from 'react-icons/ri'

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

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: CD, border: `1px solid ${BR}`,
        borderRadius: '16px', padding: '22px',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}
    >
      <div style={{
        width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: color + '18', border: `1px solid ${color}30`,
      }}>
        <Icon style={{ fontSize: '20px', color }} />
      </div>
      <div>
        <p style={{ fontSize: '11px', color: DM, fontFamily: B, letterSpacing: '0.08em', marginBottom: '4px' }}>
          {label}
        </p>
        <p style={{ fontFamily: D, fontSize: '1.6rem', fontWeight: 900, color: TX, lineHeight: 1 }}>
          {value ?? '—'}
        </p>
      </div>
    </motion.div>
  )
}

function RecentRow({ session, index }) {
  const score = session.totalScore ?? session.score ?? 0
  const status = session.status
  const date = session.completedAt || session.createdAt
  const dateStr = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 + index * 0.04 }}
      style={{ borderBottom: `1px solid rgba(0,240,255,0.06)`, transition: 'background 0.15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C2)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <td style={{ padding: '11px 16px', fontSize: '12px', color: TX, fontFamily: B }}>
        {session.userId?.name || session.userName || '-'}
      </td>
      <td style={{ padding: '11px 16px' }}>
        <span style={{ fontFamily: D, fontSize: '0.9rem', fontWeight: 700, color: GD }}>
          {score.toLocaleString()}
        </span>
      </td>
      <td style={{ padding: '11px 16px' }}>
        <span style={{
          fontSize: '10px', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, fontFamily: B,
          background: status === 'completed' ? 'rgba(57,255,20,0.08)' : 'rgba(0,240,255,0.08)',
          color: status === 'completed' ? GN : CY,
          border: `1px solid ${status === 'completed' ? 'rgba(57,255,20,0.25)' : BR}`,
        }}>
          {status}
        </span>
      </td>
      <td style={{ padding: '11px 16px', fontSize: '12px', color: DM, fontFamily: B }}>{dateStr}</td>
    </motion.tr>
  )
}

export default function AdminDashboard() {
  const { data: uS } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: () => api.get('/users/stats').then((r) => r.data.data),
  })
  const { data: sS } = useQuery({
    queryKey: ['admin-session-stats'],
    queryFn: () => api.get('/sessions/stats').then((r) => r.data.data),
  })
  const { data: recentSessions } = useQuery({
    queryKey: ['admin-recent-sessions'],
    queryFn: () => api.get('/sessions?limit=10&sort=newest').then((r) => r.data.data),
  })

  const sessions = Array.isArray(recentSessions?.sessions)
    ? recentSessions.sessions
    : Array.isArray(recentSessions)
      ? recentSessions.slice(0, 10)
      : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: B }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: D, fontSize: '1.4rem', fontWeight: 700, color: TX, letterSpacing: '0.04em', marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: DM }}>Platform overview</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard icon={RiUserLine}      label="Total Users"      value={uS?.total}   color={CY}  delay={0} />
        <StatCard icon={RiShieldLine}    label="Active Users"     value={uS?.active}  color={GN}  delay={0.05} />
        <StatCard icon={RiCalendarLine}  label="Sessions Today"   value={sS?.today}   color={MG}  delay={0.1} />
        <StatCard icon={RiBarChartLine}  label="Total Sessions"   value={sS?.total}   color={GD}  delay={0.15} />
      </div>

      {/* Recent sessions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        style={{ background: CD, border: `1px solid ${BR}`, borderRadius: '16px', overflow: 'hidden' }}
      >
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${BR}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RiTimeLine style={{ color: DM, fontSize: '16px' }} />
          <h2 style={{ fontFamily: D, fontSize: '0.75rem', fontWeight: 700, color: TX, letterSpacing: '3px' }}>
            RECENT SESSIONS
          </h2>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BR}` }}>
              {['User', 'Score', 'Status', 'Date'].map((h) => (
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
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: DM, fontSize: '13px', fontFamily: B }}>
                  No sessions yet
                </td>
              </tr>
            ) : sessions.map((s, i) => (
              <RecentRow key={s._id || i} session={s} index={i} />
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Score distribution - CSS bars */}
      {sS?.scoreDistribution && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ background: CD, border: `1px solid ${BR}`, borderRadius: '16px', padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <RiTrophyLine style={{ color: GD, fontSize: '16px' }} />
            <h2 style={{ fontFamily: D, fontSize: '0.75rem', fontWeight: 700, color: TX, letterSpacing: '3px' }}>
              SCORE DISTRIBUTION
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(sS.scoreDistribution || []).map((band, i) => {
              const max = Math.max(...(sS.scoreDistribution || []).map((b) => b.count || 0), 1)
              const pct = ((band.count || 0) / max) * 100
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: DM, fontFamily: B, width: '80px', flexShrink: 0 }}>
                    {band.range || band.label}
                  </span>
                  <div style={{ flex: 1, height: '8px', background: C2, borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.4 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        height: '100%', borderRadius: '4px',
                        background: `linear-gradient(90deg, ${CY}, ${MG})`,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: DM, fontFamily: B, width: '24px', textAlign: 'right' }}>
                    {band.count || 0}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
