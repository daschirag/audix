import { motion } from 'framer-motion'

export default function ProgressBar({ current, total, label }) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0

  return (
    <div style={{ width: '100%' }}>
      {label != null && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#e0e6ed', fontFamily: "'Inter', sans-serif" }}>
            {label}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#7a8ba0', fontFamily: "'Inter', sans-serif" }}>
            {current}/{total}
          </span>
        </div>
      )}
      <div style={{ height: '3px', background: '#1a2332', borderRadius: '3px', overflow: 'hidden' }}>
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #00f0ff, #ff00e5)',
            borderRadius: '3px',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}
