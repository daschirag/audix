import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import authApi from '../../api/authApi'
import toast from 'react-hot-toast'
import { RiArrowLeftLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiCheckLine, RiCloseLine } from 'react-icons/ri'

const F = "'Space Grotesk', sans-serif"
const B = "'DM Sans', sans-serif"

const requirements = [
  { label: '8+ characters', test: (v) => v.length >= 8 },
  { label: 'Uppercase', test: (v) => /[A-Z]/.test(v) },
  { label: 'Lowercase', test: (v) => /[a-z]/.test(v) },
  { label: 'Number', test: (v) => /\d/.test(v) },
  { label: 'Special char', test: (v) => /[@$!%*?&]/.test(v) },
]

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const allMet = requirements.every((r) => r.test(password))
  const passwordsMatch = confirmPassword && password === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) return toast.error('Invalid or missing reset token')
    if (!allMet) return toast.error('Password does not meet requirements')
    if (password !== confirmPassword) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await authApi.post('/auth/reset-password', { token, password, confirmPassword })
      setDone(true)
      toast.success('Password reset successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const fi = (e) => { e.target.style.borderColor = 'rgba(79,152,163,0.55)'; e.target.style.background = 'rgba(79,152,163,0.05)' }
  const bi = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.background = 'rgba(255,255,255,0.03)' }
  const inputBase = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#e8e7e5', outline: 'none', fontFamily: B, transition: 'border-color 0.2s, background 0.2s' }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: '#0b0a09', fontFamily: B }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#0f0e0c' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: '360px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(109,170,69,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <RiCheckLine style={{ color: '#6daa45', fontSize: '24px' }} />
            </div>
            <h2 style={{ fontFamily: F, fontSize: '24px', fontWeight: 700, color: '#eeede9', marginBottom: '8px' }}>Password reset</h2>
            <p style={{ fontSize: '13px', color: '#4a4947', marginBottom: '24px' }}>Your password has been updated. You can now sign in with your new password.</p>
            <button onClick={() => navigate('/login')} style={{ width: '100%', background: '#4f98a3', color: '#0a0908', border: 'none', borderRadius: '10px', padding: '12.5px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: F }}>Sign In</button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0b0a09', fontFamily: B }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#0f0e0c' }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', maxWidth: '380px' }}>
          <Link to="/login" className="inline-flex items-center gap-1.5 text-[#797876] hover:text-[#cdccca] transition-colors text-xs mb-8">
            <RiArrowLeftLine className="text-sm" /> Back to login
          </Link>

          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontFamily: F, fontSize: '26px', fontWeight: 700, color: '#eeede9', marginBottom: '5px', letterSpacing: '-0.03em' }}>Reset password</h2>
            <p style={{ fontSize: '13px', color: '#4a4947' }}>Enter your new password</p>
          </div>

          {!token && (
            <div style={{ background: 'rgba(209,99,167,0.08)', border: '1px solid rgba(209,99,167,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: '#d163a7' }}>Invalid or expired reset link. Please request a new one.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#525150', letterSpacing: '0.05em', textTransform: 'uppercase' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <RiLockLine style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3a3937', fontSize: '15px', pointerEvents: 'none' }} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" autoComplete="new-password" disabled={!token} style={{ ...inputBase, paddingLeft: '40px', paddingRight: '42px' }} onFocus={fi} onBlur={bi} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#3a3937', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <RiEyeOffLine style={{ fontSize: '17px' }} /> : <RiEyeLine style={{ fontSize: '17px' }} />}
                </button>
              </div>
            </div>

            {password && (
              <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                {requirements.map(({ label, test }) => {
                  const met = test(password)
                  return (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {met ? <RiCheckLine style={{ color: '#6daa45', fontSize: '12px', flexShrink: 0 }} /> : <RiCloseLine style={{ color: '#3e3d3b', fontSize: '12px', flexShrink: 0 }} />}
                      <span style={{ fontSize: '11px', color: met ? '#6daa45' : '#3e3d3b', fontFamily: B }}>{label}</span>
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: '#525150', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" autoComplete="new-password" disabled={!token} style={{ ...inputBase, borderColor: confirmPassword ? (passwordsMatch ? 'rgba(109,170,69,0.5)' : 'rgba(209,99,167,0.5)') : 'rgba(255,255,255,0.07)' }} onFocus={fi} onBlur={bi} />
            </div>

            <motion.button type="submit" disabled={loading || !token || !allMet || !passwordsMatch} whileTap={{ scale: 0.985 }} style={{ marginTop: '4px', width: '100%', background: loading || !token || !allMet || !passwordsMatch ? '#3d8085' : '#4f98a3', color: '#0a0908', border: 'none', borderRadius: '10px', padding: '12.5px', fontSize: '14px', fontWeight: 600, cursor: loading || !token || !allMet || !passwordsMatch ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: F, transition: 'background 0.18s', opacity: !allMet || !passwordsMatch ? 0.6 : 1 }} onMouseEnter={(e) => { if (!loading && token && allMet && passwordsMatch) e.currentTarget.style.background = '#3d8a95' }} onMouseLeave={(e) => { if (!loading && token && allMet && passwordsMatch) e.currentTarget.style.background = '#4f98a3' }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
