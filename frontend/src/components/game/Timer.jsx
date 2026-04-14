import { useState, useEffect, useRef, useCallback } from 'react'

const RADIUS = 34
const STROKE = 3.5
const NR = RADIUS - STROKE / 2
const CIRC = 2 * Math.PI * NR

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function Timer({ seconds: initialSeconds, onExpire, isRunning = true }) {
  const [remaining, setRemaining] = useState(initialSeconds)
  const intervalRef = useRef(null)
  const onExpireRef = useRef(onExpire)

  useEffect(() => { onExpireRef.current = onExpire }, [onExpire])
  useEffect(() => { setRemaining(initialSeconds) }, [initialSeconds])

  const tick = useCallback(() => {
    setRemaining((prev) => {
      if (prev <= 1) {
        clearInterval(intervalRef.current)
        onExpireRef.current?.()
        return 0
      }
      return prev - 1
    })
  }, [])

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(tick, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, tick]) // eslint-disable-line

  const progress = initialSeconds > 0 ? remaining / initialSeconds : 1
  const offset = CIRC - progress * CIRC
  const urgent = remaining <= 10
  const color = urgent ? '#ff3860' : '#00f0ff'

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={RADIUS * 2} height={RADIUS * 2} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={RADIUS} cy={RADIUS} r={NR}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE}
        />
        <circle
          cx={RADIUS} cy={RADIUS} r={NR}
          fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round"
          strokeDasharray={CIRC}
          style={{
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s',
          }}
        />
      </svg>
      <span style={{
        position: 'absolute',
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '0.8rem', fontWeight: 700,
        color, letterSpacing: '0.05em',
      }}>
        {formatTime(remaining)}
      </span>
    </div>
  )
}
