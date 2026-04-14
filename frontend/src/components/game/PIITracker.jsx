import { motion } from 'framer-motion'
import { RiCheckLine, RiCloseLine, RiShieldKeyholeLine } from 'react-icons/ri'

export default function PIITracker({ found = 0, missed = 0, total = 0 }) {
  const remaining = Math.max(total - found - missed, 0)
  const pct = total > 0 ? (found / total) * 100 : 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <RiShieldKeyholeLine className="text-[#4f98a3] text-lg" />
        <span
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          className="text-sm font-semibold text-[#cdccca]"
        >
          PII Tracker
        </span>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6daa45]/10 border border-[#6daa45]/20"
          animate={{ scale: found > 0 ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <RiCheckLine className="text-[#6daa45] text-sm" />
          <span className="text-sm font-medium text-[#6daa45] tabular-nums">{found}</span>
          <span className="text-xs text-[#797876]">found</span>
        </motion.div>

        {missed > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d163a7]/10 border border-[#d163a7]/20"
          >
            <RiCloseLine className="text-[#d163a7] text-sm" />
            <span className="text-sm font-medium text-[#d163a7] tabular-nums">{missed}</span>
            <span className="text-xs text-[#797876]">missed</span>
          </motion.div>
        )}

        {remaining > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1c1b19] border border-[#262523]">
            <span className="text-sm font-medium text-[#797876] tabular-nums">{remaining}</span>
            <span className="text-xs text-[#4a4947]">left</span>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="h-1.5 bg-[#1c1b19] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: '#4f98a3' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      )}
    </div>
  )
}
