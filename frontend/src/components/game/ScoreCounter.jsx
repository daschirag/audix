import { useEffect, useRef } from 'react'
import { useSpring, useTransform } from 'framer-motion'

export default function ScoreCounter({ score = 0 }) {
  const spring = useSpring(0, { stiffness: 120, damping: 30 })
  const display = useTransform(spring, (v) => Math.round(v))
  const ref = useRef(null)

  useEffect(() => { spring.set(score) }, [score, spring])

  useEffect(() => {
    return display.on('change', (v) => {
      if (ref.current) ref.current.textContent = v.toLocaleString()
    })
  }, [display])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
      <span style={{
        fontSize: '0.65rem', fontWeight: 600, letterSpacing: '2px',
        textTransform: 'uppercase', color: '#7a8ba0', fontFamily: "'Inter', sans-serif",
      }}>
        Score
      </span>
      <span
        ref={ref}
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '1.6rem', fontWeight: 900,
          color: '#ffd700', lineHeight: 1, letterSpacing: '0.02em',
        }}
      >
        0
      </span>
    </div>
  )
}
