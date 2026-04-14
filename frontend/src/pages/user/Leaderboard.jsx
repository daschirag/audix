import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import userApi from '../../api/userApi'
import {
  RiMedalLine,
  RiTrophyLine,
  RiShieldStarLine,
  RiArrowUpSLine,
} from 'react-icons/ri'

const D   = "'Orbitron', sans-serif"
const B   = "'Inter', sans-serif"
const CY  = '#00f0ff'
const BG  = '#0a0e17'
const CD  = '#111827'
const TX  = '#e0e6ed'
const DM  = '#7a8ba0'
const BR  = 'rgba(0,240,255,0.15)'
const GLD = '#ffd700'

const MEDAL = {
  1: { color: '#ffd700', label: 'Gold',   bg: 'rgba(255,215,0,0.06)',   border: 'rgba(255,215,0,0.25)' },
  2: { color: '#c0c0c0', label: 'Silver', bg: 'rgba(192,192,192,0.06)', border: 'rgba(192,192,192,0.2)' },
  3: { color: '#cd7f32', label: 'Bronze', bg: 'rgba(205,127,50,0.06)',  border: 'rgba(205,127,50,0.2)' },
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: `1px solid ${BR}` }}>
      {[60, 140, 100, 60, 60].map((w, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div className="skeleton" style={{ height: '14px', width: w, borderRadius: '6px' }} />
        </td>
      ))}
    </tr>
  )
}

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => userApi.get('/leaderboard?limit=50').then((r) => r.data.data),
  })

  const { data: myRank } = useQuery({
    queryKey: ['leaderboard-me'],
    queryFn: () => userApi.get('/leaderboard/me').then((r) => r.data.data),
  })

  const entries = Array.isArray(leaderboard) ? leaderboard : []
  const myEntry = myRank

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '32px 24px 80px', fontFamily: B }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '28px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <RiTrophyLine style={{ color: GLD, fontSize: '24px' }} />
            <h1 style={{ fontFamily: D, fontSize: '22px', fontWeight: 700, color: TX, letterSpacing: '0.06em' }}>
              LEADERBOARD
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: DM, fontFamily: B }}>
            Top performers across all training sessions
          </p>
        </motion.div>

        {/* My rank banner */}
        {myEntry && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'rgba(0,240,255,0.05)',
              border: `1px solid ${BR}`,
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(0,240,255,0.1)', border: `1px solid ${BR}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <RiArrowUpSLine style={{ color: CY, fontSize: '20px' }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: DM, fontFamily: B, marginBottom: '2px' }}>Your Rank</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: TX, fontFamily: D, letterSpacing: '0.05em' }}>
                  #{myEntry.rank ?? myEntry.position ?? '-'}
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: DM, fontFamily: B, marginBottom: '2px' }}>Score</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: CY, fontFamily: D }}>
                {myEntry.score ?? myEntry.highestScore ?? 0}
              </p>
            </div>
          </motion.div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: CD,
            border: `1px solid ${BR}`,
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BR}` }}>
                {['Rank', 'Name', 'Department', 'Score', 'Badges'].map((h, i) => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: i >= 3 ? 'right' : 'left',
                    fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: DM, fontFamily: D,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
                : entries.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <RiShieldStarLine style={{ fontSize: '32px', color: DM, display: 'block', margin: '0 auto 12px' }} />
                        <p style={{ fontSize: '14px', color: DM, marginBottom: '4px' }}>No entries yet</p>
                        <p style={{ fontSize: '12px', color: 'rgba(120,139,160,0.5)' }}>
                          Complete a training session to appear on the leaderboard
                        </p>
                      </td>
                    </tr>
                  )
                  : entries.map((entry, i) => {
                      const rank   = entry.rank ?? entry.position ?? i + 1
                      const medal  = MEDAL[rank]
                      const isTop3 = rank <= 3

                      return (
                        <motion.tr
                          key={entry._id || entry.userId || i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.025, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            borderBottom: `1px solid ${BR}`,
                            background: isTop3 ? medal.bg : 'transparent',
                            transition: 'background 0.2s',
                            cursor: 'default',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isTop3
                              ? medal.bg.replace('0.06', '0.1')
                              : 'rgba(0,240,255,0.03)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isTop3 ? medal.bg : 'transparent'
                          }}
                        >
                          {/* Rank */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontSize: '14px', fontWeight: 700, fontFamily: D,
                                color: isTop3 ? medal.color : DM,
                                letterSpacing: '0.05em',
                              }}>
                                {rank}
                              </span>
                              {isTop3 && (
                                <span style={{
                                  fontSize: '9px', fontWeight: 700, fontFamily: D,
                                  letterSpacing: '0.12em', textTransform: 'uppercase',
                                  color: medal.color,
                                  padding: '2px 7px', borderRadius: '10px',
                                  background: medal.bg,
                                  border: `1px solid ${medal.border}`,
                                }}>
                                  {medal.label}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Name */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: D, fontSize: '11px', fontWeight: 700,
                                background: isTop3 ? medal.bg : 'rgba(0,240,255,0.06)',
                                color: isTop3 ? medal.color : CY,
                                border: `1px solid ${isTop3 ? medal.border : BR}`,
                              }}>
                                {(entry.name || '?')[0]?.toUpperCase()}
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: 500, color: TX, fontFamily: B }}>
                                {entry.name || 'Anonymous'}
                              </span>
                            </div>
                          </td>

                          {/* Department */}
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontSize: '12px', color: DM, fontFamily: B }}>
                              {entry.department || '—'}
                            </span>
                          </td>

                          {/* Score */}
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <span style={{
                              fontSize: '14px', fontWeight: 700, fontFamily: D,
                              color: isTop3 ? medal.color : CY,
                              letterSpacing: '0.04em',
                            }}>
                              {entry.score ?? entry.highestScore ?? 0}
                            </span>
                          </td>

                          {/* Badges */}
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              fontSize: '12px', color: DM, fontFamily: B,
                            }}>
                              <RiMedalLine style={{ fontSize: '14px' }} />
                              {entry.badges ?? 0}
                            </span>
                          </td>
                        </motion.tr>
                      )
                    })}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  )
}
