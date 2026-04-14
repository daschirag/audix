import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import gameApi from '../../api/gameApi'
import Spinner from '../../components/ui/Spinner'
import {
  RiMailLine,
  RiChatSmile2Line,
  RiShieldKeyholeLine,
  RiLockPasswordLine,
  RiGlobalLine,
  RiAlarmWarningLine,
  RiPlayFill,
  RiCheckLine,
  RiLockLine,
  RiAlertLine,
} from 'react-icons/ri'

/* ── design tokens ──────────────────────────────────────────────── */
const D  = "'Orbitron', sans-serif"
const B  = "'Inter', sans-serif"
const CY = '#00f0ff'
const MG = '#ff00e5'
const BG = '#0a0e17'
const CD = '#111827'
const TX = '#e0e6ed'
const DM = '#7a8ba0'
const BR = 'rgba(0,240,255,0.15)'

const ROUNDS = [
  {
    number: 1,
    name: 'Phishing Inbox Review',
    icon: RiMailLine,
    emoji: '📧',
    description: 'Identify phishing emails from a suspicious inbox',
    maxPts: 600,
  },
  {
    number: 2,
    name: 'Social Engineering Chat',
    icon: RiChatSmile2Line,
    emoji: '💬',
    description: 'Detect social engineering tactics in conversations',
    maxPts: 600,
  },
  {
    number: 3,
    name: 'PII Identification',
    icon: RiShieldKeyholeLine,
    emoji: '🔍',
    description: 'Spot personally identifiable information in documents',
    maxPts: 700,
  },
  {
    number: 4,
    name: 'Password Fortress',
    icon: RiLockPasswordLine,
    emoji: '🔐',
    description: 'Build strong passwords and spot weak ones',
    maxPts: 600,
  },
  {
    number: 5,
    name: 'Secure Browsing',
    icon: RiGlobalLine,
    emoji: '🌐',
    description: 'Identify safe and dangerous browsing practices',
    maxPts: 600,
  },
  {
    number: 6,
    name: 'Incident Response',
    icon: RiAlarmWarningLine,
    emoji: '🚨',
    description: 'React correctly to security incidents',
    maxPts: 600,
  },
]

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
}

function RoundCard({ round, status, index }) {
  const Icon      = round.icon
  const isCompleted = status === 'completed'
  const isCurrent   = status === 'current'
  const isLocked    = status === 'locked'

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={!isLocked ? { y: -3 } : undefined}
      style={{
        position: 'relative',
        background: CD,
        border: `1px solid ${
          isCurrent   ? CY :
          isCompleted ? 'rgba(57,255,20,0.3)' :
          isLocked    ? 'rgba(0,240,255,0.05)' :
                        BR
        }`,
        borderRadius: '16px',
        padding: '24px',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        opacity: isLocked ? 0.5 : 1,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: isCurrent ? '0 0 20px rgba(0,240,255,0.1)' : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Cyan top accent line for current */}
      {isCurrent && (
        <motion.div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${CY}, transparent)`,
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Lock overlay for locked rounds */}
      {isLocked && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          color: DM, opacity: 0.5,
        }}>
          <RiLockLine style={{ fontSize: '18px' }} />
        </div>
      )}

      {/* Round badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '20px',
        background: `${MG}12`,
        border: `1px solid ${MG}30`,
        marginBottom: '14px',
      }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '3px',
          textTransform: 'uppercase', color: MG, fontFamily: D,
        }}>
          ROUND {round.number}
        </span>
        {isCurrent && (
          <motion.span
            style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: CY, display: 'inline-block',
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Icon + title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '10px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
          background: isCompleted ? 'rgba(57,255,20,0.08)'
                    : isCurrent   ? 'rgba(0,240,255,0.08)'
                    :               'rgba(0,240,255,0.04)',
          border: `1px solid ${
            isCompleted ? 'rgba(57,255,20,0.2)'
            : isCurrent ? 'rgba(0,240,255,0.2)'
            :              BR
          }`,
        }}>
          {isCompleted ? (
            <RiCheckLine style={{ fontSize: '22px', color: '#39ff14' }} />
          ) : (
            <Icon style={{
              fontSize: '22px',
              color: isCurrent ? CY : isLocked ? DM : DM,
            }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{
              fontFamily: D, fontSize: '13px', fontWeight: 700,
              color: isCompleted ? '#39ff14' : isCurrent ? CY : TX,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              letterSpacing: '0.03em',
            }}>
              {round.name}
            </h3>
          </div>

          {isCurrent && (
            <motion.span
              style={{
                display: 'inline-block', fontSize: '9px', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: CY, fontFamily: D,
                padding: '2px 8px', borderRadius: '10px',
                background: 'rgba(0,240,255,0.08)',
                border: `1px solid rgba(0,240,255,0.2)`,
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Current
            </motion.span>
          )}
          {isCompleted && (
            <span style={{
              display: 'inline-block', fontSize: '9px', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#39ff14', fontFamily: D,
            }}>
              Completed
            </span>
          )}
        </div>
      </div>

      <p style={{ fontSize: '12px', color: DM, lineHeight: 1.6, fontFamily: B, marginBottom: '12px' }}>
        {round.description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{
          fontSize: '10px', fontFamily: D, fontWeight: 700,
          color: isCompleted ? '#39ff14' : DM,
          letterSpacing: '0.05em',
        }}>
          {isCompleted ? '✓ ' : ''}Max {round.maxPts} pts
        </span>
      </div>
    </motion.div>
  )
}

export default function GameLobby() {
  const navigate              = useNavigate()
  const queryClient           = useQueryClient()
  const { sessionId, setSession, resetGame } = useGameStore()

  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['active-session'],
    queryFn: () => gameApi.get('/session/active').then((r) => r.data),
    retry: false,
    enabled: !sessionId,
  })

  const activeSession       = sessionData?.data || sessionData
  const currentSessionId    = sessionId || activeSession?.sessionId || activeSession?._id
  const completedRounds     = activeSession?.completedRounds || activeSession?.roundsCompleted || []
  const currentRound        = activeSession?.currentRound || 1
  const isGameComplete      = activeSession?.status === 'completed'

  const createMutation = useMutation({
    mutationFn: () => gameApi.post('/session').then((r) => r.data),
    onSuccess: (data) => {
      const sid = data?.data?.sessionId || data?.sessionId || data?._id
      if (sid) setSession(sid)
      return sid
    },
  })

  const startMutation = useMutation({
    mutationFn: ({ sessionId: sid, round }) => {
      // Prefetch by making the request immediately and awaiting
      return gameApi.post('/round/start', { sessionId: sid, round }).then((r) => {
        // Prefetch round data into React Query cache for RoundPage
        queryClient.setQueryData(['round', round], r.data?.data);
        return r.data;
      });
    },
  })

  const getRoundStatus = (roundNum) => {
    if (isGameComplete || completedRounds.includes(roundNum)) return 'completed'
    if (roundNum === currentRound) return 'current'
    return 'locked'
  }

  const handleStart = async () => {
    try {
      let sid = currentSessionId
      if (!sid) {
        resetGame()
        const data = await createMutation.mutateAsync()
        sid = data?.data?.sessionId || data?.sessionId || data?._id
        if (!sid) throw new Error('Failed to create session')
      }
      const roundToStart = currentRound || 1
      await startMutation.mutateAsync({ sessionId: sid, round: roundToStart })
      navigate(`/play/round/${roundToStart}`)
    } catch (err) {
      const status = err?.response?.status
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to start game. Please try again.'
      
      // If we get 403 "Not your session", it means the sessionId is stale
      // Clear it and retry by creating a new session
      if (status === 403 && errorMsg.includes('Not your session')) {
        console.warn('Stale session detected, creating new session...')
        resetGame()
        try {
          const data = await createMutation.mutateAsync()
          const newSid = data?.data?.sessionId || data?.sessionId || data?._id
          if (newSid) {
            const roundToStart = 1
            await startMutation.mutateAsync({ sessionId: newSid, round: roundToStart })
            navigate(`/play/round/${roundToStart}`)
            return
          }
        } catch (retryErr) {
          console.error('Failed to recover from stale session:', retryErr)
        }
      }
      
      console.error('Game start error:', errorMsg)
      // Mutation error state will be shown via isError
    }
  }

  const actionLabel = isGameComplete
    ? 'Play Again'
    : currentSessionId
      ? `Continue — Round ${currentRound}`
      : 'Start Game'

  return (
    <div style={{
      minHeight: '100vh',
      background: BG,
      padding: '40px 24px 80px',
      fontFamily: B,
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '40px', textAlign: 'center' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '4px 16px', borderRadius: '20px',
            background: 'rgba(0,240,255,0.06)',
            border: `1px solid ${BR}`,
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em', color: CY, fontFamily: D, textTransform: 'uppercase' }}>
              Cybersecurity Training
            </span>
          </div>

          <h1 style={{
            fontFamily: D,
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 900,
            letterSpacing: '0.05em',
            background: `linear-gradient(135deg, ${CY}, #0090ff)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
          }}>
            TRAINING ARENA
          </h1>

          <p style={{ fontSize: '14px', color: DM, fontFamily: B, lineHeight: 1.6 }}>
            6 rounds · 5 questions each · 90 seconds per round · Max score:{' '}
            <span style={{ color: CY, fontWeight: 600, fontFamily: D }}>3,700 pts</span>
          </p>
        </motion.div>

        {/* Error banner */}
        {(createMutation.isError || startMutation.isError) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,56,96,0.08)',
              border: '1px solid rgba(255,56,96,0.25)',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <RiAlertLine style={{ color: '#ff3860', fontSize: '20px', flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: DM, fontFamily: B }}>
              {createMutation.isError
                ? 'Failed to create session. Please check your connection and try again.'
                : startMutation.isError
                  ? (startMutation.error?.response?.data?.message || 'Failed to start round. Please try again.')
                  : 'Failed to start game. Please try again.'}
            </p>
          </motion.div>
        )}

        {/* Round cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}>
          {ROUNDS.map((round, i) => (
            <RoundCard
              key={round.number}
              round={round}
              status={sessionLoading ? 'locked' : getRoundStatus(round.number)}
              index={i}
            />
          ))}
        </div>

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
        >
          <button
            onClick={handleStart}
            disabled={createMutation.isPending || startMutation.isPending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 48px',
              borderRadius: '12px',
              border: 'none',
              background: createMutation.isPending || startMutation.isPending
                ? 'linear-gradient(135deg,rgba(0,240,255,0.3),rgba(0,144,255,0.3))'
                : 'linear-gradient(135deg,#00f0ff,#0090ff)',
              color: '#000',
              fontSize: '14px',
              fontFamily: D,
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: createMutation.isPending || startMutation.isPending ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!createMutation.isPending && !startMutation.isPending) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 0 32px rgba(0,240,255,0.5)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {createMutation.isPending || startMutation.isPending ? (
              <Spinner size={18} />
            ) : (
              <RiPlayFill style={{ fontSize: '20px' }} />
            )}
            {actionLabel}
          </button>

          {currentSessionId && !isGameComplete && (
            <span style={{ fontSize: '12px', color: DM, fontFamily: B }}>
              Session active — Round {currentRound} of 6
            </span>
          )}
        </motion.div>
      </div>
    </div>
  )
}
