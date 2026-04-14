import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import userApi from '../../api/userApi'
import {
  RiShieldCheckLine,
  RiCheckLine,
  RiCloseLine,
  RiFileList3Line,
  RiPieChartLine,
  RiBarChartLine,
  RiEyeLine,
  RiAlarmWarningLine,
} from 'react-icons/ri'

const HF = "'Space Grotesk', sans-serif"

const ROUND_NAMES = [
  { name: 'Phishing Inbox Review', icon: 'mail' },
  { name: 'Social Engineering Chat', icon: 'chat' },
  { name: 'PII Identification', icon: 'shield' },
  { name: 'Password Fortress', icon: 'lock' },
  { name: 'Secure Browsing', icon: 'globe' },
  { name: 'Incident Response', icon: 'alarm' },
]

const MAX_SCORE = 3700

function ArcGauge({ percentage, size = 200 }) {
  const radius = (size - 24) / 2
  const circumference = Math.PI * radius
  const progress = Math.min(percentage, 100)
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const color =
    progress >= 80 ? '#6daa45' : progress >= 50 ? '#fdab43' : progress >= 25 ? '#a86fdf' : '#d163a7'

  const cx = size / 2
  const cy = size / 2 + 8

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 24 }}>
      <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`}>
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#1c1b19"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <motion.path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
        style={{ transform: 'translateX(-50%)' }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-3xl font-bold tabular-nums"
          style={{ fontFamily: HF, color }}
        >
          {Math.round(progress)}%
        </motion.p>
        <p className="text-[10px] uppercase tracking-wider text-[#525150] font-medium mt-0.5">
          Awareness
        </p>
      </div>
    </div>
  )
}

function StatBlock({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#141312] border border-[#262523] rounded-xl p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: color + '15' }}
      >
        <Icon className="text-lg" style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-[#525150] font-medium">
          {label}
        </p>
        <p
          className="text-xl font-bold tabular-nums"
          style={{ fontFamily: HF, color: '#cdccca' }}
        >
          {value ?? 0}
        </p>
      </div>
    </div>
  )
}

function RoundSummaryCard({ round, index }) {
  const passed = round.passed || round.correct >= 3
  const score = round.score ?? 0
  const roundInfo = ROUND_NAMES[(round.round || index) - 1] || ROUND_NAMES[index]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="bg-[#141312] border border-[#262523] rounded-xl p-4 hover:border-[#393836] transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              fontFamily: HF,
              backgroundColor: passed ? '#6daa4515' : '#d163a715',
              color: passed ? '#6daa45' : '#d163a7',
            }}
          >
            R{round.round || index + 1}
          </span>
          <span className="text-sm font-medium text-[#cdccca] truncate">
            {round.name || roundInfo.name}
          </span>
        </div>
        {passed ? (
          <RiCheckLine className="text-[#6daa45] text-sm" />
        ) : (
          <RiCloseLine className="text-[#d163a7] text-sm" />
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#797876]">
          {round.correct ?? 0}/{round.total ?? 0} correct
        </span>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ fontFamily: HF, color: '#4f98a3' }}
        >
          {score} pts
        </span>
      </div>
    </motion.div>
  )
}

export default function PIIReport() {
  const { data: report, isLoading } = useQuery({
    queryKey: ['pii-report'],
    queryFn: () => userApi.get('/pii-report').then((r) => r.data.data),
  })

  const awareness = report?.awarenessPercentage ?? report?.awareness ?? 0
  const totalScore = report?.totalScore ?? report?.score ?? 0
  const rounds = report?.rounds ?? report?.roundResults ?? []

  const round3 = useMemo(() => {
    const r3 = rounds.find((r) => r.round === 3) || rounds[2]
    if (!r3) return null
    return {
      findings: r3.findings ?? r3.correct ?? r3.piiFound ?? 0,
      missed: r3.missed ?? (r3.total ?? 5) - (r3.findings ?? r3.correct ?? 0),
      total: r3.total ?? r3.piiTotal ?? 5,
    }
  }, [rounds])

  const hasData = report && (rounds.length > 0 || totalScore > 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0e0c] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#262523] border-t-[#4f98a3] rounded-full spin mx-auto" />
          <p className="text-sm text-[#4a4947] mt-3">Loading report...</p>
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="min-h-screen bg-[#0f0e0c] px-4 py-8 md:px-8 max-w-3xl mx-auto flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#141312] border border-[#262523] rounded-2xl p-10 text-center max-w-sm w-full"
        >
          <RiFileList3Line className="text-4xl text-[#4a4947] mx-auto mb-4" />
          <h2
            style={{ fontFamily: HF }}
            className="text-lg font-bold text-[#cdccca] mb-2"
          >
            No Report Available
          </h2>
          <p className="text-sm text-[#797876] mb-1">
            Complete a training session to generate your PII awareness report.
          </p>
          <p className="text-xs text-[#4a4947]">
            The report analyzes your performance across all 6 training rounds.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0e0c] px-4 py-8 md:px-8 max-w-4xl mx-auto pb-24 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <RiShieldCheckLine className="text-[#4f98a3] text-2xl" />
          <h1
            style={{ fontFamily: HF }}
            className="text-2xl md:text-3xl font-bold text-[#cdccca]"
          >
            PII Awareness Report
          </h1>
        </div>
        <p className="text-sm text-[#797876]">
          Your data protection awareness score and detailed breakdown
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#141312] border border-[#262523] rounded-2xl p-6 md:p-8 mb-6"
      >
        <div className="flex flex-col items-center">
          <ArcGauge percentage={awareness} size={220} />
          <div className="mt-6 text-center">
            <p
              className="text-lg font-bold text-[#cdccca]"
              style={{ fontFamily: HF }}
            >
              Total Score: {totalScore} / {MAX_SCORE}
            </p>
            <p className="text-xs text-[#4a4947] mt-1">
              Based on your latest completed training session
            </p>
          </div>
        </div>
      </motion.div>

      {round3 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <RiEyeLine className="text-[#a86fdf]" />
            <h2
              style={{ fontFamily: HF }}
              className="text-base font-semibold text-[#cdccca]"
            >
              Round 3 -- PII Identification Breakdown
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBlock
              icon={RiCheckLine}
              label="PII Found"
              value={round3.findings}
              color="#6daa45"
            />
            <StatBlock
              icon={RiCloseLine}
              label="PII Missed"
              value={round3.missed}
              color="#d163a7"
            />
            <StatBlock
              icon={RiFileList3Line}
              label="Total Items"
              value={round3.total}
              color="#4f98a3"
            />
            <StatBlock
              icon={RiPieChartLine}
              label="Detection Rate"
              value={
                round3.total > 0
                  ? Math.round((round3.findings / round3.total) * 100) + '%'
                  : '0%'
              }
              color="#fdab43"
            />
          </div>
        </motion.div>
      )}

      {rounds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2 mb-4">
            <RiBarChartLine className="text-[#4f98a3]" />
            <h2
              style={{ fontFamily: HF }}
              className="text-base font-semibold text-[#cdccca]"
            >
              Rounds Summary
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rounds.map((round, i) => (
              <RoundSummaryCard key={round.round || i} round={round} index={i} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
