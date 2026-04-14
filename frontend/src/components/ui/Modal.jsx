import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiCloseLine } from 'react-icons/ri'

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#0b0a09]/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-[#141312] border border-[#262523] rounded-xl shadow-2xl overflow-hidden"
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#262523]">
                <h2
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  className="text-lg font-semibold text-[#cdccca]"
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#797876] hover:text-[#cdccca] hover:bg-[#1c1b19] transition-all duration-200"
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-[#797876] hover:text-[#cdccca] hover:bg-[#1c1b19] transition-all duration-200 z-10"
              >
                <RiCloseLine className="text-xl" />
              </button>
            )}
            <div className="px-6 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
