import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import {
  RiStarFill,
  RiStarLine,
  RiRefreshLine,
  RiDashboardLine,
  RiTrophyLine,
  RiCheckLine,
  RiCloseLine,
} from 'react-icons/ri'

/* ── design tokens ──────────────────────────────────────────────── */
const D   = "'Orbitron', sans-serif"
const B   = "'Inter', sans-serif"
const CY  = '#00f0ff'
const MG  = '#ff00e5'
const GN  = '#39ff14'
const RD  = '#ff3860'
const GD  = '#ffd700'
const BG  = '#0a0e17'
const CD  = '#111827'
const C2  = '#1a2332'
const TX  = '#e0e6ed'
const DM  = '#7a8ba0'
const BR  = 'rgba(0,240,255,0.15)'

const ROUND_NAMES = [
  'Phishing Inbox Review',
  'Social Engineering Chat',
  'PII Identification',
  'Password Fortress',
  'Secure Browsing',
  'Incident Response',
]

const ROUND_EMOJIS = ['📧', '💬', '🔍', '🔐', '🌐', '🚨']

function StarRating({ score }) {
  const pct = score / 3700
  const stars = pct >= 0.85 ? 3 : pct >= 0.55 ? 2 : pct > 0 ? 1 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      {[1, 2, 3].map((s) => (
        <motion.div
          key={s}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.6 + s * 0.15, type: 'spring', stiffness: 280, damping: 18 }}
        >
          {s <= stars
            ? <RiStarFill style={{ color: GD, fontSize: '2.2rem' }} />
            : <RiStarLine style={{ color: 'rgba(255,215,0,0.15)', fontSize: '2.2rem' }} />}
        </motion.div>
      ))}
    </div>
  )
}

function RoundCard({ result, index }) {
  const passed = result.passed || (result.correct >= 3)
  const roundNum = result.round || (index + 1)
  const name = ROUND_NAMES[roundNum - 1] || `Round ${roundNum}`
  const emoji = ROUND_EMOJIS[roundNum - 1] || '🎮'
  const barPct = result.total > 0 ? (result.correct / result.total) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.9 + index * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: CD, border: `1px solid ${passed ? 'rgba(57,255,20,0.2)' : BR}`,
        borderRadius: '14px', padding: '16px 20px',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.3rem' }}>{emoji}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: D, fontSize: '0.65rem', fontWeight: 700,
                color: MG, letterSpacing: '2px',
                padding: '2px 8px', borderRadius: '20px',
                background: 'rgba(255,0,229,0.08)', border: '1px solid rgba(255,0,229,0.2)',
              }}>
                R{roundNum}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: TX, fontFamily: B }}>
                {name}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: D, fontWeight: 700, fontSize: '1rem', color: GD }}>
            {result.score ?? 0}
          </span>
          {passed
            ? <RiCheckLine style={{ color: GN, fontSize: '16px' }} />
            : <RiCloseLine style={{ color: RD, fontSize: '16px' }} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: '4px', background: C2, borderRadius: '4px', overflow: 'hidden' }}>
          <motion.div
            style={{
              height: '100%', borderRadius: '4px',
              background: passed ? GN : RD,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.6, delay: 1 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <span style={{ fontSize: '0.75rem', color: DM, fontFamily: B, minWidth: '36px', textAlign: 'right' }}>
          {result.correct ?? 0}/{result.total ?? 0}
        </span>
      </div>
    </motion.div>
  )
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const { totalScore, roundResults, resetGame } = useGameStore()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (totalScore >= 2500) {
      const t = setTimeout(() => setShowConfetti(true), 400)
      return () => clearTimeout(t)
    }
  }, [totalScore])

  const finalScore = totalScore
  const rounds = roundResults
  const passedCount = rounds.filter((r) => r.passed || r.correct >= 3).length

  const getPerformanceLabel = () => {
    const pct = finalScore / 3700
    if (pct >= 0.85) return { label: 'Cyber Guardian', color: GN }
    if (pct >= 0.55) return { label: 'Vigilant Protector', color: CY }
    return { label: 'Novice', color: MG }
  }

  const perf = getPerformanceLabel()

  const handlePlayAgain = () => {
    resetGame()
    navigate('/play')
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '40px 24px 80px', fontFamily: B, position: 'relative' }}>

      {/* Confetti dots */}
      {showConfetti && Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, opacity: 1, x: 0 }}
          animate={{ y: '100vh', opacity: 0, x: (Math.random() - 0.5) * 300 }}
          transition={{ duration: 2.5 + Math.random() * 1.5, delay: Math.random() * 0.8, ease: 'linear' }}
          style={{
            position: 'fixed', top: 0, left: `${Math.random() * 100}%`,
            width: 6 + Math.random() * 6, height: 6 + Math.random() * 6,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            background: [CY, MG, GD, GN, RD][i % 5],
            pointerEvents: 'none', zIndex: 50,
          }}
        />
      ))}

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <RiTrophyLine style={{ color: GD, fontSize: '2.5rem', marginBottom: '12px' }} />
          <h1 style={{ fontFamily: D, fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: TX, letterSpacing: '0.06em', marginBottom: '8px' }}>
            TRAINING COMPLETE
          </h1>
          <p style={{ fontSize: '0.9rem', color: DM }}>
            {passedCount}/6 rounds passed
          </p>
        </motion.div>

        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: CD, border: `1px solid ${BR}`,
            borderRadius: '20px', padding: '40px',
            textAlign: 'center', marginBottom: '24px',
            boxShadow: '0 0 60px rgba(0,240,255,0.05)',
          }}
        >
          <p style={{ fontFamily: D, fontSize: '4rem', fontWeight: 900, color: GD, lineHeight: 1, marginBottom: '4px' }}>
            {finalScore.toLocaleString()}
          </p>
          <p style={{ fontSize: '0.7rem', color: DM, letterSpacing: '3px', marginBottom: '20px', fontFamily: B }}>
            TOTAL POINTS
          </p>

          <StarRating score={finalScore} />

          <p style={{ marginTop: '16px', fontFamily: D, fontSize: '0.8rem', fontWeight: 700, color: perf.color, letterSpacing: '2px' }}>
            {perf.label}
          </p>

          <p style={{ marginTop: '8px', fontSize: '0.75rem', color: DM, fontFamily: B }}>
            Max possible: 3,700 pts
          </p>
        </motion.div>

        {/* Round breakdown */}
        {rounds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.35 }}
            style={{ marginBottom: '28px' }}
          >
            <h2 style={{ fontFamily: D, fontSize: '0.75rem', fontWeight: 700, color: DM, letterSpacing: '3px', marginBottom: '14px' }}>
              ROUND BREAKDOWN
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rounds.map((result, i) => (
                <RoundCard key={result.round || i} result={result} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
        >
          <button
            onClick={() => navigate('/play/dashboard')}
            style={{
              flex: 1, minWidth: '160px',
              background: `linear-gradient(135deg,${CY},#0090ff)`,
              color: '#000', border: 'none', borderRadius: '12px',
              padding: '16px', fontFamily: D, fontWeight: 700,
              fontSize: '0.9rem', letterSpacing: '1px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,240,255,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <RiDashboardLine style={{ fontSize: '18px' }} />
            View Dashboard
          </button>

          <button
            onClick={handlePlayAgain}
            style={{
              flex: 1, minWidth: '140px',
              background: 'transparent',
              color: CY, border: `1px solid ${BR}`,
              borderRadius: '12px', padding: '16px',
              fontFamily: D, fontWeight: 700,
              fontSize: '0.9rem', letterSpacing: '1px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,240,255,0.07)'
              e.currentTarget.style.borderColor = CY
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = BR
            }}
          >
            <RiRefreshLine style={{ fontSize: '18px' }} />
            Play Again
          </button>
        </motion.div>
      </div>
    </div>
  )
}
