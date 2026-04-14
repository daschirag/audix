import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import authApi from '../../api/authApi'
import toast from 'react-hot-toast'
import { RiArrowLeftLine, RiMailLine, RiCheckLine } from 'react-icons/ri'

const F = "'Space Grotesk', sans-serif"
const B = "'DM Sans', sans-serif"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email address')
    setLoading(true)
    try {
      await authApi.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Reset link sent to your email')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const fi = (e) => { e.target.style.borderColor = 'rgba(79,152,163,0.55)'; e.target.style.background = 'rgba(79,152,163,0.05)' }
  const bi = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.background = 'rgba(255,255,255,0.03)' }
  const inputBase = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#e8e7e5', outline: 'none', fontFamily: B, transition: 'border-color 0.2s, background 0.2s' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0b0a09', fontFamily: B }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#0f0e0c', position: 'relative' }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', maxWidth: '380px' }}>
          <Link to="/login" className="inline-flex items-center gap-1.5 text-[#797876] hover:text-[#cdccca] transition-colors text-xs mb-8">
            <RiArrowLeftLine className="text-sm" /> Back to login
          </Link>

          {!sent ? (
            <>
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontFamily: F, fontSize: '26px', fontWeight: 700, color: '#eeede9', marginBottom: '5px', letterSpacing: '-0.03em' }}>Forgot password</h2>
                <p style={{ fontSize: '13px', color: '#4a4947' }}>Enter your email to receive a reset link</p>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 500, color: '#525150', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <RiMailLine style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3a3937', fontSize: '15px', pointerEvents: 'none' }} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} placeholder="you@company.com" autoComplete="email" style={{ ...inputBase, paddingLeft: '40px' }} onFocus={fi} onBlur={bi} />
                  </div>
                </div>
                <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.985 }} style={{ marginTop: '4px', width: '100%', background: loading ? '#3d8085' : '#4f98a3', color: '#0a0908', border: 'none', borderRadius: '10px', padding: '12.5px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: F, transition: 'background 0.18s' }} onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#3d8a95' }} onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#4f98a3' }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(109,170,69,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <RiCheckLine style={{ color: '#6daa45', fontSize: '24px' }} />
              </div>
              <h2 style={{ fontFamily: F, fontSize: '22px', fontWeight: 700, color: '#eeede9', marginBottom: '8px' }}>Check your email</h2>
              <p style={{ fontSize: '13px', color: '#4a4947', marginBottom: '24px', lineHeight: 1.6 }}>We sent a password reset link to<br /><span style={{ color: '#cdccca' }}>{email}</span></p>
              <button onClick={() => navigate('/login')} style={{ width: '100%', background: '#4f98a3', color: '#0a0908', border: 'none', borderRadius: '10px', padding: '12.5px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
                Back to Login
              </button>
            </motion.div>
          )}

          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #191817', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#3e3d3b' }}>
              Don&apos;t have an account? <Link to="/signup" style={{ color: '#4f98a3', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
