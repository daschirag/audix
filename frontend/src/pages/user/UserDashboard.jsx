import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import userApi from '../../api/userApi'
import gameApi from '../../api/gameApi'
import {
  RiGamepadLine,
  RiTrophyLine,
  RiTimeLine,
  RiPlayFill,
  RiHistoryLine,
  RiCheckLine,
  RiArrowRightSLine,
} from 'react-icons/ri'

const D  = "'Orbitron', sans-serif"
const B  = "'Inter', sans-serif"
const CY = '#00f0ff'
const BG = '#0a0e17'
const CD = '#111827'
const TX = '#e0e6ed'
const DM = '#7a8ba0'
const BR = 'rgba(0,240,255,0.15)'

const ROUND_NAMES = [
  'Phishing Inbox Review',
  'Social Engineering Chat',
  'PII Identification',
  'Password Fortress',
  'Secure Browsing',
  'Incident Response',
]

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      style={{
        background: CD,
        border: `1px solid ${BR}`,
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color + '40'
        e.currentTarget.style.boxShadow = `0 0 16px ${color}18`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = BR
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: color + '18',
        border: `1px solid ${color}30`,
      }}>
        <Icon style={{ fontSize: '20px', color }} />
      </div>
      <div>
        <p style={{ fontSize: '12px', color: DM, fontFamily: B, marginBottom: '3px' }}>{label}</p>
        <p style={{ fontSize: '24px', fontWeight: 700, color: TX, fontFamily: D, letterSpacing: '0.02em' }}>
          {value ?? '-'}
        </p>
      </div>
    </motion.div>
  )
}

export default function UserDashboard() {
  const navigate    = useNavigate()
  const { user }    = useAuthStore()

  const { data: stats }    = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userApi.get('/stats').then((r) => r.data.data),
  })

  const { data: sessions } = useQuery({
    queryKey: ['session-history'],
    queryFn: () => gameApi.get('/session/history').then((r) => r.data.data),
  })

  const recentSessions = Array.isArray(sessions) ? sessions.slice(0, 8) : []

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '32px 24px 80px', fontFamily: B }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '32px' }}
        >
          <h1 style={{ fontFamily: D, fontSize: '22px', fontWeight: 700, color: TX, marginBottom: '6px', letterSpacing: '0.04em' }}>
            Welcome back, {user?.name || 'Trainee'}
          </h1>
          <p style={{ fontSize: '14px', color: DM, fontFamily: B }}>
            Continue your cybersecurity training journey
          </p>
        </motion.div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <StatCard icon={RiGamepadLine}  label="Games Played"  value={stats?.gamesPlayed ?? stats?.totalSessions}   color={CY}      delay={0} />
          <StatCard icon={RiTrophyLine}   label="Highest Score" value={stats?.highestScore}                           color="#ffd700"  delay={0.05} />
          <StatCard icon={RiTimeLine}     label="Last Played"   value={stats?.lastPlayed ? formatDate(stats.lastPlayed) : '-'} color="#ff00e5" delay={0.1} />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '36px' }}
        >
          <button
            onClick={() => navigate('/play')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 32px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg,#00f0ff,#0090ff)',
              color: '#000', fontSize: '13px', fontFamily: D, fontWeight: 700,
              letterSpacing: '0.08em', cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 0 24px rgba(0,240,255,0.45)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <RiPlayFill style={{ fontSize: '18px' }} />
            Start Training
          </button>
        </motion.div>

        {/* Recent sessions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <RiHistoryLine style={{ color: DM, fontSize: '16px' }} />
            <h2 style={{ fontFamily: D, fontSize: '13px', fontWeight: 700, color: TX, letterSpacing: '0.08em' }}>
              RECENT SESSIONS
            </h2>
          </div>

          {recentSessions.length === 0 ? (
            <div style={{
              background: CD, border: `1px solid ${BR}`, borderRadius: '16px',
              padding: '48px 24px', textAlign: 'center',
            }}>
              <RiHistoryLine style={{ fontSize: '32px', color: DM, display: 'block', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', color: DM, marginBottom: '6px' }}>No sessions yet</p>
              <p style={{ fontSize: '12px', color: 'rgba(120,139,160,0.5)' }}>
                Start your first training session to see your history here
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentSessions.map((session, i) => {
                const roundsPassed = (session.roundResults || session.rounds || []).filter(
                  (r) => r.passed || r.correct >= 3
                ).length
                const totalRounds  = session.roundResults?.length || session.rounds?.length || 6
                const completedAt  = session.completedAt || session.endedAt || session.updatedAt
                const roundName    = session.currentRound
                  ? ROUND_NAMES[(session.currentRound || 1) - 1]
                  : null
                const isComplete   = session.status === 'completed'

                return (
                  <motion.div
                    key={session._id || session.sessionId || i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => navigate('/play/results')}
                    style={{
                      background: CD, border: `1px solid ${BR}`, borderRadius: '12px',
                      padding: '14px 18px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = CY + '40'
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(0,240,255,0.06)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = BR
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isComplete ? 'rgba(57,255,20,0.08)' : 'rgba(0,240,255,0.08)',
                        border: `1px solid ${isComplete ? 'rgba(57,255,20,0.2)' : BR}`,
                      }}>
                        {isComplete
                          ? <RiCheckLine style={{ color: '#39ff14', fontSize: '16px' }} />
                          : <RiGamepadLine style={{ color: CY, fontSize: '16px' }} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: TX, marginBottom: '2px', fontFamily: B }}>
                          {isComplete ? 'Completed Training'
                            : `Round ${session.currentRound || 1} — ${roundName || 'In Progress'}`}
                        </p>
                        <p style={{ fontSize: '11px', color: DM, fontFamily: B }}>
                          {completedAt ? formatDate(completedAt) : 'In progress'}
                          {isComplete && ` — ${roundsPassed}/${totalRounds} rounds passed`}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '12px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: CY, fontFamily: D }}>
                        {session.totalScore ?? session.score ?? 0}
                      </span>
                      <RiArrowRightSLine style={{ color: DM, fontSize: '18px' }} />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
