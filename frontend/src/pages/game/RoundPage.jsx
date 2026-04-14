import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import gameApi from '../../api/gameApi'
import { useGameStore } from '../../store/gameStore'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import {
  RiCheckLine,
  RiCloseLine,
  RiArrowRightSLine,
  RiAlertLine,
  RiArrowLeftLine,
  RiLockLine,
  RiCheckDoubleLine,
  RiStarFill,
  RiStarLine,
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

const ROUND_CONFIG = [
  { name: 'Phishing Inbox Review',   emoji: '📧' },
  { name: 'Social Engineering Chat', emoji: '💬' },
  { name: 'PII Identification',      emoji: '🔍' },
  { name: 'Password Fortress',       emoji: '🔐' },
  { name: 'Secure Browsing',         emoji: '🌐' },
  { name: 'Incident Response',       emoji: '🚨' },
]
const QUESTIONS_PER_ROUND = 5
const TIME_LIMIT = 90

/* ── Circular Timer ─────────────────────────────────────────────── */
function CircularTimer({ seconds: initialSeconds, onExpire, isRunning = true }) {
  const [remaining, setRemaining] = useState(initialSeconds)
  const intervalRef = useRef(null)
  const onExpireRef = useRef(onExpire)

  useEffect(() => { onExpireRef.current = onExpire }, [onExpire])
  useEffect(() => { setRemaining(initialSeconds) }, [initialSeconds])

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((p) => {
          if (p <= 1) {
            clearInterval(intervalRef.current)
            onExpireRef.current?.()
            return 0
          }
          return p - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, remaining > 0 ? 'running' : 'stopped']) // eslint-disable-line

  const RADIUS = 34
  const STROKE = 3.5
  const NR = RADIUS - STROKE / 2
  const CIRC = 2 * Math.PI * NR
  const progress = initialSeconds > 0 ? remaining / initialSeconds : 1
  const offset = CIRC - progress * CIRC
  const urgent = remaining <= 10
  const color = urgent ? RD : CY

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={RADIUS * 2} height={RADIUS * 2} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={RADIUS} cy={RADIUS} r={NR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} />
        <circle
          cx={RADIUS} cy={RADIUS} r={NR} fill="none"
          stroke={color} strokeWidth={STROKE} strokeLinecap="round"
          strokeDasharray={CIRC}
          style={{
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s',
          }}
        />
      </svg>
      <span style={{
        position: 'absolute',
        fontFamily: D, fontSize: '0.85rem', fontWeight: 700,
        color, letterSpacing: '0.05em',
      }}>
        {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}
      </span>
    </div>
  )
}

/* ── Multiple Choice ────────────────────────────────────────────── */
function MultipleChoice({ question, selected, onSelect, disabled }) {
  const options = question.options || []
  const letters = ['A', 'B', 'C', 'D']

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
      {options.map((option, i) => {
        const isSelected = selected === i
        const isCorrect = question.correct === i
        const isFeedbackCorrect = disabled && isCorrect
        const isFeedbackWrong = disabled && isSelected && !isCorrect

        let borderColor = BR
        let bgColor = C2
        let badgeBg = 'rgba(0,240,255,0.1)'
        let badgeBorder = 'rgba(0,240,255,0.3)'
        let badgeColor = CY
        let transform = 'none'

        if (!disabled && isSelected) {
          borderColor = CY
          bgColor = 'rgba(0,240,255,0.08)'
          badgeBg = CY
          badgeColor = '#000'
        }
        if (isFeedbackCorrect) {
          borderColor = GN
          bgColor = 'rgba(57,255,20,0.08)'
          badgeBg = GN
          badgeBorder = GN
          badgeColor = '#000'
        }
        if (isFeedbackWrong) {
          borderColor = RD
          bgColor = 'rgba(255,56,96,0.08)'
          badgeBg = RD
          badgeBorder = RD
          badgeColor = '#fff'
        }

        return (
          <motion.div
            key={i}
            whileHover={!disabled ? { y: -1 } : undefined}
            onClick={() => !disabled && onSelect(i)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '18px 20px',
              background: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '14px',
              cursor: disabled ? 'default' : 'pointer',
              transition: 'all 0.2s',
              transform,
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: badgeBg, border: `1px solid ${badgeBorder}`,
              color: badgeColor,
              fontFamily: D, fontSize: '0.85rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s',
            }}>
              {letters[i]}
            </div>
            <span style={{
              color: TX, fontFamily: B, fontSize: '0.95rem', lineHeight: 1.5,
              flex: 1, paddingTop: '4px',
            }}>
              {option.text || option}
            </span>
            {isFeedbackCorrect && (
              <RiCheckLine style={{ color: GN, fontSize: '18px', flexShrink: 0, marginTop: '4px' }} />
            )}
            {isFeedbackWrong && (
              <RiCloseLine style={{ color: RD, fontSize: '18px', flexShrink: 0, marginTop: '4px' }} />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

/* ── Text Input ─────────────────────────────────────────────────── */
function TextInput({ value, onChange, onSubmit, disabled }) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && onSubmit()}
        disabled={disabled}
        placeholder="Type your answer…"
        style={{
          width: '100%', background: C2, border: `1px solid ${BR}`,
          borderRadius: '12px', padding: '14px 56px 14px 18px',
          fontSize: '0.95rem', fontFamily: B, color: TX, outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = CY
          e.target.style.boxShadow = `0 0 0 3px rgba(0,240,255,0.1)`
        }}
        onBlur={(e) => {
          e.target.style.borderColor = BR
          e.target.style.boxShadow = 'none'
        }}
      />
      {!disabled && (
        <button
          onClick={onSubmit}
          disabled={!value.trim()}
          style={{
            position: 'absolute', right: '8px', top: '50%',
            transform: 'translateY(-50%)',
            width: '36px', height: '36px', borderRadius: '8px',
            background: value.trim() ? `linear-gradient(135deg,${CY},#0090ff)` : 'rgba(0,240,255,0.1)',
            border: 'none', cursor: value.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <RiArrowRightSLine style={{ color: value.trim() ? '#000' : DM, fontSize: '20px' }} />
        </button>
      )}
    </div>
  )
}

/* ── Round Complete Screen ──────────────────────────────────────── */
function RoundComplete({ round, roundScore, correctCount, total, onNext }) {
  const passed = correctCount >= 3
  const pct = total > 0 ? correctCount / total : 0
  const stars = pct >= 0.8 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0
  const cfg = ROUND_CONFIG[round - 1] || ROUND_CONFIG[0]

  return (
    <div style={{
      minHeight: '100vh', background: BG,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: B,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: CD, border: `1px solid ${BR}`,
          borderRadius: '20px', padding: '48px 40px',
          maxWidth: '460px', width: '100%', textAlign: 'center',
          boxShadow: '0 0 60px rgba(0,240,255,0.05)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{cfg.emoji}</div>

        <p style={{
          fontFamily: D, fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '3px', color: MG, textTransform: 'uppercase',
          marginBottom: '10px',
        }}>
          Round Complete
        </p>

        <h2 style={{
          fontFamily: D, fontSize: '1.3rem', fontWeight: 700,
          color: TX, letterSpacing: '0.04em', marginBottom: '24px',
        }}>
          {cfg.name}
        </h2>

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + s * 0.12, type: 'spring', stiffness: 300 }}
            >
              {s <= stars
                ? <RiStarFill style={{ color: GD, fontSize: '2rem' }} />
                : <RiStarLine style={{ color: 'rgba(255,215,0,0.2)', fontSize: '2rem' }} />}
            </motion.div>
          ))}
        </div>

        {/* Score */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontFamily: D, fontSize: '3rem', fontWeight: 900, color: GD, lineHeight: 1 }}>
            {roundScore}
          </p>
          <p style={{ fontSize: '0.75rem', color: DM, fontFamily: B, letterSpacing: '2px', marginTop: '6px' }}>
            POINTS EARNED
          </p>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: '32px',
          padding: '16px 0', borderTop: `1px solid ${BR}`, borderBottom: `1px solid ${BR}`,
          marginBottom: '28px',
        }}>
          <div>
            <p style={{ fontFamily: D, fontSize: '1.4rem', fontWeight: 700, color: passed ? GN : RD }}>
              {correctCount}/{total}
            </p>
            <p style={{ fontSize: '0.7rem', color: DM, letterSpacing: '2px' }}>CORRECT</p>
          </div>
          <div style={{ width: '1px', background: BR }} />
          <div>
            <p style={{
              fontFamily: D, fontSize: '1.4rem', fontWeight: 700,
              color: passed ? GN : RD,
            }}>
              {passed ? 'PASS' : 'FAIL'}
            </p>
            <p style={{ fontSize: '0.7rem', color: DM, letterSpacing: '2px' }}>RESULT</p>
          </div>
        </div>

        <button
          onClick={onNext}
          style={{
            width: '100%',
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
          {round < 6 ? `Continue to Round ${round + 1}` : 'View Results'}
          <RiArrowRightSLine style={{ fontSize: '20px' }} />
        </button>
      </motion.div>
    </div>
  )
}

/* ── Main RoundPage ─────────────────────────────────────────────── */
export default function RoundPage() {
  const { roundNumber } = useParams()
  const round = parseInt(roundNumber, 10)
  const navigate = useNavigate()
  const { sessionId, addRoundResult, setCurrentRound } = useGameStore()

  const [gameSessionId, setGameSessionId] = useState(null)
  const [questions, setQuestions] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [textInput, setTextInput] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [roundScore, setRoundScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const fetchAttempted = useRef(false)

  const { data: sessionData } = useQuery({
    queryKey: ['active-session-round'],
    queryFn: () => gameApi.get('/session/active').then((r) => r.data),
    retry: false,
    enabled: !sessionId,
  })
  const activeSessionId = sessionId || sessionData?.data?.sessionId

  useEffect(() => {
    if (sessionData?.data?.sessionId && !sessionId) {
      useGameStore.getState().setSession?.(sessionData.data.sessionId)
    }
  }, [sessionData, sessionId])

  const fetchRound = useMutation({
    mutationFn: () =>
      gameApi.post('/round/start', { sessionId: activeSessionId, round }).then((r) => r.data),
    onSuccess: (data) => {
      const qs = data?.data?.questions || data?.questions || []
      setGameSessionId(data?.data?.gameSessionId || null)
      setQuestions(qs)
      setQuestionIndex(0)
      setAnswers([])
      setFeedback(null)
      setSelectedOption(null)
      setTextInput('')
      setIsAnswered(false)
      setIsComplete(false)
      setRoundScore(0)
      setCorrectCount(0)
    },
  })

  useEffect(() => {
    if (activeSessionId && round && !fetchAttempted.current && !questions) {
      fetchAttempted.current = true
      fetchRound.mutate()
    }
  }, [activeSessionId, round]) // eslint-disable-line

  useEffect(() => { setCurrentRound(round) }, [round, setCurrentRound])

  const completeMutation = useMutation({
    mutationFn: () =>
      gameApi.post('/round/complete', {
        gameSessionId,
        sessionId: activeSessionId,
        round,
        answers,
      }).then((r) => r.data),
    onSuccess: (data) => {
      const result = data?.data || data
      addRoundResult({
        round,
        score: roundScore,
        correct: correctCount,
        total: questions?.length || QUESTIONS_PER_ROUND,
        passed: result?.round?.passed ?? correctCount >= 3,
      })
      setIsComplete(true)
      toast.success(`Round ${round} complete! +${roundScore} pts`)
    },
    onError: () => {
      // Still show complete screen using local data
      addRoundResult({
        round,
        score: roundScore,
        correct: correctCount,
        total: questions?.length || QUESTIONS_PER_ROUND,
        passed: correctCount >= 3,
      })
      setIsComplete(true)
    },
  })

  const currentQuestion = questions?.[questionIndex]
  const questionType = currentQuestion?.type || 'multiple-choice'

  const checkAnswer = useCallback((answer) => {
    if (!currentQuestion || isAnswered) return
    setIsAnswered(true)
    
    // Call backend to validate answer
    gameApi
      .post('/round/answer', {
        gameSessionId,
        questionId: currentQuestion._id,
        selectedOption: answer,
        timeTaken: 0,
      })
      .then((res) => {
        const data = res.data?.data || res.data
        const isCorrect = data.isCorrect
        
        const newAnswer = {
          questionId: currentQuestion._id || questionIndex,
          answer,
          isCorrect,
          timeRemaining: 0,
        }
        setAnswers((prev) => [...prev, newAnswer])
        setFeedback({
          isCorrect,
          explanation: data.explanation || '',
          correctIndex: data.correctIndex,
          correctText: data.correctText,
        })
        if (isCorrect) {
          setCorrectCount((c) => c + 1)
          setRoundScore((s) => s + (data.pointsEarned || 100))
        }
      })
      .catch((err) => {
        console.error('Answer submission failed:', err)
        setFeedback({
          isCorrect: false,
          explanation: 'Error checking answer. Please try again.',
          correctIndex: null,
          correctText: null,
        })
      })
  }, [currentQuestion, questionType, isAnswered, questionIndex, gameSessionId])

  const handleNext = useCallback(() => {
    setFeedback(null)
    setIsAnswered(false)
    setSelectedOption(null)
    setTextInput('')
    if (questionIndex + 1 >= (questions?.length || QUESTIONS_PER_ROUND)) {
      completeMutation.mutate()
    } else {
      setQuestionIndex((i) => i + 1)
    }
  }, [questionIndex, questions, completeMutation])

  const handleTimeExpire = useCallback(() => {
    if (isAnswered || isComplete) return
    checkAnswer(null)
  }, [isAnswered, isComplete, checkAnswer])

  const handleNextRound = () => {
    if (round < 6) {
      fetchAttempted.current = false
      setQuestions(null)
      navigate(`/play/round/${round + 1}`)
    } else {
      navigate('/play/results')
    }
  }

  /* ── error / loading states ─────────────────────────────────── */
  if (!activeSessionId) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{
          background: CD, border: `1px solid rgba(255,56,96,0.3)`,
          borderRadius: '16px', padding: '40px', textAlign: 'center', maxWidth: '340px',
        }}>
          <RiLockLine style={{ color: RD, fontSize: '2rem', marginBottom: '12px' }} />
          <p style={{ fontSize: '14px', color: DM, marginBottom: '16px', fontFamily: B }}>
            No active session found.
          </p>
          <button onClick={() => navigate('/play')} style={{
            background: `linear-gradient(135deg,${CY},#0090ff)`,
            color: '#000', border: 'none', borderRadius: '10px', padding: '12px 24px',
            fontFamily: D, fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}>
            <RiArrowLeftLine /> Back to Lobby
          </button>
        </div>
      </div>
    )
  }

  if (fetchRound.isPending || !questions) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner size={32} />
          <p style={{ fontSize: '14px', color: DM, marginTop: '12px', fontFamily: B }}>
            Loading round {round}…
          </p>
        </div>
      </div>
    )
  }

  if (fetchRound.isError) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{
          background: CD, border: `1px solid rgba(255,56,96,0.3)`,
          borderRadius: '16px', padding: '40px', textAlign: 'center', maxWidth: '340px',
        }}>
          <RiAlertLine style={{ color: RD, fontSize: '2rem', marginBottom: '12px' }} />
          <p style={{ fontSize: '14px', color: DM, marginBottom: '16px', fontFamily: B }}>Failed to load round.</p>
          <button
            onClick={() => { fetchAttempted.current = false; fetchRound.mutate() }}
            style={{
              background: `linear-gradient(135deg,${CY},#0090ff)`, color: '#000',
              border: 'none', borderRadius: '10px', padding: '12px 24px',
              fontFamily: D, fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <RoundComplete
        round={round}
        roundScore={roundScore}
        correctCount={correctCount}
        total={questions.length}
        onNext={handleNextRound}
      />
    )
  }

  const roundCfg = ROUND_CONFIG[round - 1] || ROUND_CONFIG[0]
  const totalQ = questions.length

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', fontFamily: B }}>

      {/* ── HEADER BAR ─────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(17,24,39,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${BR}`,
        padding: '12px 32px',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>

          {/* Left: Round badge */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: D, fontWeight: 700, fontSize: '1rem', color: MG, letterSpacing: '0.08em' }}>
                ROUND {round}
              </span>
              <span style={{ fontFamily: D, fontSize: '0.85rem', color: DM }}>/ 6</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: TX, marginTop: '2px', fontFamily: B }}>
              {roundCfg.name}
            </p>
          </div>

          {/* Center: Circular timer */}
          <CircularTimer
            seconds={TIME_LIMIT}
            onExpire={handleTimeExpire}
            isRunning={!isAnswered && !isComplete && !!questions}
          />

          {/* Right: Score */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.65rem', color: DM, letterSpacing: '2px', marginBottom: '2px', fontFamily: B }}>
              SCORE
            </p>
            <p style={{ fontFamily: D, fontSize: '1.6rem', fontWeight: 900, color: GD, lineHeight: 1 }}>
              {roundScore.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ maxWidth: '860px', margin: '10px auto 0', position: 'relative' }}>
          <p style={{ fontSize: '0.7rem', color: DM, textAlign: 'right', marginBottom: '4px', fontFamily: B }}>
            Q {questionIndex + 1}/{totalQ}
          </p>
          <div style={{ height: '3px', background: C2, borderRadius: '3px', overflow: 'hidden' }}>
            <motion.div
              style={{
                height: '100%',
                background: `linear-gradient(90deg,${CY},${MG})`,
                borderRadius: '3px',
              }}
              animate={{ width: `${((questionIndex + 1) / totalQ) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>

      {/* ── QUESTION AREA ───────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px 80px' }}>
        <div style={{ width: '100%', maxWidth: '800px' }}>

          <motion.div
            key={questionIndex}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Question card */}
            <div style={{
              background: CD, border: `1px solid ${BR}`, borderRadius: '20px',
              padding: '40px', boxShadow: '0 0 40px rgba(0,240,255,0.04)',
              marginBottom: '16px',
            }}>
              <p style={{
                fontSize: '1.15rem', fontWeight: 600, color: TX,
                lineHeight: 1.7, marginBottom: '28px', fontFamily: B,
              }}>
                {currentQuestion?.text || currentQuestion?.question || ''}
              </p>

              {questionType === 'multiple-choice' && (
                <MultipleChoice
                  question={currentQuestion}
                  selected={selectedOption}
                  onSelect={setSelectedOption}
                  disabled={isAnswered}
                />
              )}

              {questionType === 'text-input' && (
                <TextInput
                  value={textInput}
                  onChange={setTextInput}
                  onSubmit={() => textInput.trim() && checkAnswer(textInput.trim())}
                  disabled={isAnswered}
                />
              )}

              {/* Submit button for MC */}
              {questionType === 'multiple-choice' && !isAnswered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{ marginTop: '28px' }}
                >
                  <button
                    onClick={() => selectedOption !== null && checkAnswer(selectedOption)}
                    disabled={selectedOption === null}
                    style={{
                      width: '100%',
                      background: selectedOption !== null
                        ? `linear-gradient(135deg,${CY},#0090ff)`
                        : 'rgba(0,240,255,0.1)',
                      color: selectedOption !== null ? '#000' : DM,
                      border: 'none', borderRadius: '12px',
                      padding: '16px', fontFamily: D, fontWeight: 700,
                      fontSize: '1rem', letterSpacing: '1px',
                      cursor: selectedOption !== null ? 'pointer' : 'not-allowed',
                      opacity: selectedOption !== null ? 1 : 0.5,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedOption !== null) {
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,240,255,0.35)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    Submit Answer
                  </button>
                </motion.div>
              )}
            </div>

            {/* Feedback / Next */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    background: feedback.isCorrect ? 'rgba(57,255,20,0.06)' : 'rgba(255,56,96,0.06)',
                    border: `1px solid ${feedback.isCorrect ? 'rgba(57,255,20,0.3)' : 'rgba(255,56,96,0.3)'}`,
                    borderRadius: '16px', padding: '24px',
                  }}
                >
                  {/* Header Message */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
                      background: feedback.isCorrect ? 'rgba(57,255,20,0.12)' : 'rgba(255,56,96,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {feedback.isCorrect
                        ? <RiCheckDoubleLine style={{ color: GN, fontSize: '28px' }} />
                        : <RiCloseLine style={{ color: RD, fontSize: '28px' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontFamily: D, fontSize: '1.1rem', fontWeight: 700,
                        color: feedback.isCorrect ? GN : RD, marginBottom: '6px', letterSpacing: '0.05em',
                      }}>
                        {feedback.isCorrect ? '🎉 Woow Nice!' : '❌ Oops! Sorry'}
                      </p>
                      <p style={{
                        fontSize: '0.9rem', color: DM, fontFamily: B, lineHeight: 1.5,
                      }}>
                        {feedback.isCorrect
                          ? 'You got this one right! Great job identifying the correct security practice.'
                          : 'You got this one wrong, but don\'t worry! Here\'s the correct answer and why:'}
                      </p>
                    </div>
                  </div>

                  {/* Explanation (always shown) */}
                  {feedback.explanation && (
                    <div style={{
                      background: 'rgba(0,240,255,0.06)',
                      border: `1px solid rgba(0,240,255,0.2)`,
                      borderRadius: '12px', padding: '14px 16px',
                      marginBottom: '16px',
                    }}>
                      <p style={{
                        fontFamily: D, fontSize: '0.75rem', fontWeight: 700,
                        color: CY, marginBottom: '6px', letterSpacing: '1px',
                      }}>
                        💡 {feedback.isCorrect ? 'WHY YOU\'RE RIGHT' : 'WHY THIS IS CORRECT'}
                      </p>
                      <p style={{
                        fontSize: '0.85rem', color: TX, lineHeight: 1.6, fontFamily: B,
                      }}>
                        {feedback.explanation}
                      </p>
                    </div>
                  )}

                  {/* Correct Answer (only if wrong) */}
                  {!feedback.isCorrect && feedback.correctIndex !== null && feedback.correctIndex !== undefined && (
                    <div style={{
                      background: 'rgba(57,255,20,0.06)',
                      border: `1px solid rgba(57,255,20,0.2)`,
                      borderRadius: '12px', padding: '14px 16px',
                      marginBottom: '16px',
                    }}>
                      <p style={{
                        fontFamily: D, fontSize: '0.75rem', fontWeight: 700,
                        color: GN, marginBottom: '6px', letterSpacing: '1px',
                      }}>
                        ✓ THE CORRECT ANSWER
                      </p>
                      <p style={{
                        fontSize: '0.9rem', color: TX, fontFamily: B, lineHeight: 1.6,
                      }}>
                        <span style={{ fontWeight: 700, color: GN, fontSize: '1rem' }}>
                          {['A', 'B', 'C', 'D'][feedback.correctIndex]}:
                        </span>{' '}
                        {feedback.correctText}
                      </p>
                    </div>
                  )}

                  {/* Button */}
                  <button
                    onClick={completeMutation.isPending ? undefined : handleNext}
                    disabled={completeMutation.isPending}
                    style={{
                      width: '100%',
                      background: `linear-gradient(135deg,${CY},#0090ff)`,
                      color: '#000', border: 'none', borderRadius: '12px',
                      padding: '14px 24px', fontFamily: D, fontWeight: 700,
                      fontSize: '0.9rem', letterSpacing: '1px',
                      cursor: completeMutation.isPending ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      opacity: completeMutation.isPending ? 0.6 : 1,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      marginTop: '16px',
                    }}
                    onMouseEnter={(e) => {
                      if (!completeMutation.isPending) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,240,255,0.35)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {completeMutation.isPending ? <Spinner size={14} /> : (
                      <>
                        {feedback.isCorrect ? 'Next Question' : 'Continue'} <RiArrowRightSLine style={{ fontSize: '18px' }} />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
