import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import authApi from '../../api/authApi'
import toast from 'react-hot-toast'
import {
  RiShieldCheckFill,
  RiEyeLine,
  RiEyeOffLine,
  RiMailLine,
  RiLockLine,
  RiKey2Line,
  RiSendPlane2Line,
} from 'react-icons/ri'

/* ── shared styles ──────────────────────────────────────────────── */
const D  = "'Orbitron', sans-serif"
const B  = "'Inter', sans-serif"
const CY = '#00f0ff'
const BG = '#0a0e17'
const CD = '#111827'
const C2 = '#1a2332'
const TX = '#e0e6ed'
const DM = '#7a8ba0'
const BR = 'rgba(0,240,255,0.15)'

const inputStyle = {
  width: '100%',
  background: C2,
  border: `1px solid ${BR}`,
  borderRadius: '10px',
  padding: '12px 16px',
  fontSize: '14px',
  fontFamily: B,
  color: TX,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const labelStyle = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: DM,
  fontFamily: B,
  marginBottom: '6px',
  display: 'block',
}

function InputField({ label, icon: Icon, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon
            style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)', color: DM, fontSize: '15px',
              pointerEvents: 'none',
            }}
          />
        )}
        {children}
      </div>
    </div>
  )
}

function CyberButton({ onClick, type = 'button', disabled, loading, children }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: '100%',
        background: disabled || loading
          ? 'linear-gradient(135deg,rgba(0,240,255,0.3),rgba(0,144,255,0.3))'
          : 'linear-gradient(135deg,#00f0ff,#0090ff)',
        color: '#000',
        border: 'none',
        borderRadius: '10px',
        padding: '13px',
        fontSize: '13px',
        fontFamily: D,
        fontWeight: 700,
        letterSpacing: '0.08em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        marginTop: '4px',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 0 24px rgba(0,240,255,0.45)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {loading ? (
        <>
          <span style={{
            width: '14px', height: '14px',
            border: '2px solid rgba(0,0,0,0.2)',
            borderTopColor: '#000',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.7s linear infinite',
          }} />
          {children}
        </>
      ) : children}
    </button>
  )
}

/* ── LEFT HERO PANEL ────────────────────────────────────────────── */
function HeroPanel() {
  return (
    <div style={{
      width: '42%',
      minWidth: '420px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '60px 48px',
      background:
        `radial-gradient(ellipse at 20% 50%, rgba(0,240,255,0.06) 0%, transparent 55%),
         radial-gradient(ellipse at 80% 20%, rgba(255,0,229,0.05) 0%, transparent 50%),
         ${BG}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage:
          `linear-gradient(rgba(0,240,255,1) 1px,transparent 1px),
           linear-gradient(90deg,rgba(0,240,255,1) 1px,transparent 1px)`,
        backgroundSize: '52px 52px',
      }} />
      {/* glow blob */}
      <div style={{
        position: 'absolute', top: '-80px', left: '-80px',
        width: '420px', height: '420px', borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(0,240,255,0.1),transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', right: '-60px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(255,0,229,0.08),transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'rgba(0,240,255,0.1)',
          border: '1px solid rgba(0,240,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <RiShieldCheckFill style={{ color: CY, fontSize: '18px' }} />
        </div>
        <span style={{ color: TX, fontWeight: 700, fontSize: '18px', fontFamily: D, letterSpacing: '0.05em' }}>
          AUDIX
        </span>
      </div>

      {/* Hero text */}
      <div style={{ position: 'relative' }}>
        <p style={{
          fontSize: '10px', fontWeight: 600, letterSpacing: '0.25em',
          textTransform: 'uppercase', color: CY, marginBottom: '20px', fontFamily: B,
        }}>
          Cybersecurity Training Platform
        </p>
        <h1 style={{
          fontFamily: D, fontSize: 'clamp(1.8rem, 3vw, 3.2rem)', fontWeight: 900,
          lineHeight: 1.1, letterSpacing: '-0.01em', color: TX, marginBottom: '20px',
        }}>
          Your security<br />
          skills start<br />
          <span style={{
            background: `linear-gradient(135deg, ${CY}, #0090ff)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            right here.
          </span>
        </h1>
        <p style={{ fontSize: '14px', color: DM, lineHeight: 1.7, maxWidth: '300px', fontFamily: B, marginBottom: '32px' }}>
          Interactive cybersecurity training with real-world scenarios. Track your progress and compete on the leaderboard.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { v: '6',   l: 'Rounds' },
            { v: '30+', l: 'Scenarios' },
            { v: 'Live', l: 'Scoring' },
          ].map(({ v, l }) => (
            <div key={l} style={{
              background: 'rgba(0,240,255,0.05)',
              border: `1px solid ${BR}`,
              borderRadius: '12px',
              padding: '12px 16px',
              textAlign: 'center',
            }}>
              <p style={{ color: CY, fontWeight: 700, fontSize: '16px', fontFamily: D, lineHeight: 1 }}>{v}</p>
              <p style={{ color: DM, fontSize: '10px', marginTop: '5px', fontFamily: B }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      <p style={{ position: 'relative', fontSize: '11px', color: 'rgba(120,139,160,0.4)', fontFamily: B }}>
        © 2026 Audix · Cybersecurity Training Platform
      </p>
    </div>
  )
}

/* ── PASSWORD TAB ───────────────────────────────────────────────── */
function PasswordTab({ email, setEmail, password, setPassword }) {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)
  const { setAuth }            = useAuthStore()
  const navigate               = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Fill in all fields')
    setLoading(true)
    try {
      const { data } = await authApi.post('/auth/login', { email, password })
      setAuth(data.data.accessToken, data.data.user)
      toast.success('Welcome back, ' + data.data.user.name)
      navigate(data.data.user.role === 'admin' ? '/admin/dashboard' : '/play')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const focusInput = (e) => {
    e.target.style.borderColor = CY
    e.target.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.1)'
  }
  const blurInput = (e) => {
    e.target.style.borderColor = BR
    e.target.style.boxShadow = 'none'
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <InputField label="Email" icon={RiMailLine}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          placeholder="you@company.com"
          autoComplete="email"
          style={{ ...inputStyle, paddingLeft: '40px' }}
          onFocus={focusInput}
          onBlur={blurInput}
        />
      </InputField>

      <InputField label="Password" icon={RiLockLine}>
        <input
          type={showPass ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          style={{ ...inputStyle, paddingLeft: '40px', paddingRight: '42px' }}
          onFocus={focusInput}
          onBlur={blurInput}
        />
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          style={{
            position: 'absolute', right: '13px', top: '50%',
            transform: 'translateY(-50%)', color: DM,
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = CY)}
          onMouseLeave={(e) => (e.currentTarget.style.color = DM)}
        >
          {showPass ? <RiEyeOffLine style={{ fontSize: '17px' }} /> : <RiEyeLine style={{ fontSize: '17px' }} />}
        </button>
      </InputField>

      <div style={{ textAlign: 'right', marginTop: '-8px' }}>
        <Link
          to="/forgot-password"
          style={{ fontSize: '12px', color: DM, textDecoration: 'none', fontFamily: B, transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = CY)}
          onMouseLeave={(e) => (e.currentTarget.style.color = DM)}
        >
          Forgot password?
        </Link>
      </div>

      <CyberButton type="submit" loading={loading} disabled={!email || !password}>
        Sign In
      </CyberButton>
    </form>
  )
}

/* ── OTP TAB ────────────────────────────────────────────────────── */
function OTPTab() {
  const [email, setEmail]     = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const { setAuth }           = useAuthStore()
  const navigate              = useNavigate()
  const inputRefs             = useRef([])

  const focusInput = (e) => {
    e.target.style.borderColor = CY
    e.target.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.1)'
  }
  const blurInput = (e) => {
    e.target.style.borderColor = BR
    e.target.style.boxShadow = 'none'
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email')
    setSending(true)
    try {
      await authApi.post('/auth/otp/request', { email, purpose: 'login' })
      setOtpSent(true)
      toast.success('OTP sent! Check your inbox.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setSending(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length < 6) return toast.error('Enter the 6-digit OTP')
    setVerifying(true)
    try {
      const { data } = await authApi.post('/auth/otp/verify', { email, otp: otpCode, purpose: 'login' })
      setAuth(data.data.accessToken, data.data.user)
      toast.success('Welcome back, ' + data.data.user.name)
      navigate(data.data.user.role === 'admin' ? '/admin/dashboard' : '/play')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setVerifying(false)
    }
  }

  const otpBoxStyle = {
    width: '46px', height: '54px',
    background: C2,
    border: `1px solid ${BR}`,
    borderRadius: '10px',
    fontSize: '22px',
    fontFamily: D,
    fontWeight: 700,
    color: CY,
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    caretColor: CY,
  }

  if (!otpSent) {
    return (
      <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <InputField label="Email" icon={RiMailLine}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            placeholder="you@company.com"
            autoComplete="email"
            style={{ ...inputStyle, paddingLeft: '40px' }}
            onFocus={focusInput}
            onBlur={blurInput}
          />
        </InputField>
        <CyberButton type="submit" loading={sending} disabled={!email}>
          <RiSendPlane2Line style={{ fontSize: '16px' }} />
          Send OTP
        </CyberButton>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        padding: '12px 16px',
        background: 'rgba(0,240,255,0.05)',
        border: `1px solid ${BR}`,
        borderRadius: '10px',
        fontSize: '13px',
        color: DM,
        fontFamily: B,
      }}>
        OTP sent to <span style={{ color: CY }}>{email}</span>
        <button
          type="button"
          onClick={() => { setOtpSent(false); setOtp(['','','','','','']) }}
          style={{ marginLeft: '8px', background: 'none', border: 'none', color: DM, cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
        >
          Change
        </button>
      </div>

      <div>
        <label style={{ ...labelStyle, marginBottom: '12px' }}>Enter 6-digit OTP</label>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onPaste={handleOtpPaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              style={{
                ...otpBoxStyle,
                borderColor: digit ? CY : BR,
                boxShadow: digit ? '0 0 8px rgba(0,240,255,0.2)' : 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = CY
                e.target.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = digit ? CY : BR
                e.target.style.boxShadow = digit ? '0 0 8px rgba(0,240,255,0.2)' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      <CyberButton type="submit" loading={verifying} disabled={otp.join('').length < 6}>
        <RiKey2Line style={{ fontSize: '16px' }} />
        Verify OTP
      </CyberButton>

      <p style={{ textAlign: 'center', fontSize: '12px', color: DM, fontFamily: B }}>
        Didn&apos;t get it?{' '}
        <button
          type="button"
          onClick={handleSendOTP}
          style={{ background: 'none', border: 'none', color: CY, cursor: 'pointer', fontSize: '12px' }}
        >
          Resend OTP
        </button>
      </p>
    </form>
  )
}

/* ── MAIN PAGE ──────────────────────────────────────────────────── */
export default function UserLoginPage() {
  const [tab, setTab]         = useState('password')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')

  const fillAdminCredentials = () => {
    setTab('password')
    setEmail('admin@audix.com')
    setPassword('Admin@2026')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: BG, fontFamily: B }}>
      {/* LEFT — hero (hidden on mobile) */}
      <div style={{ display: 'none' }} className="lg-hero">
        <HeroPanel />
      </div>
      <style>{`
        @media (min-width: 1024px) { .lg-hero { display: flex !important; } }
      `}</style>

      {/* RIGHT — form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: CD,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* bg glow */}
        <div style={{
          position: 'absolute', bottom: '-60px', right: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(0,240,255,0.05),transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: '380px', position: 'relative' }}
        >
          {/* Mobile logo */}
          <div className="mobile-logo" style={{ display: 'none', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '9px',
              background: 'rgba(0,240,255,0.1)', border: `1px solid ${BR}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RiShieldCheckFill style={{ color: CY, fontSize: '17px' }} />
            </div>
            <span style={{ color: TX, fontWeight: 700, fontSize: '16px', fontFamily: D, letterSpacing: '0.05em' }}>
              AUDIX
            </span>
          </div>
          <style>{`
            @media (max-width: 1023px) { .mobile-logo { display: flex !important; } }
          `}</style>

          {/* Heading */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontFamily: D, fontSize: '24px', fontWeight: 700, color: TX, marginBottom: '6px', letterSpacing: '0.02em' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '14px', color: DM, fontFamily: B }}>
              Sign in to continue your training
            </p>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,240,255,0.04)',
            border: `1px solid ${BR}`,
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '24px',
            gap: '4px',
          }}>
            {[
              { id: 'password', label: 'Password Login' },
              { id: 'otp',      label: 'OTP Login' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: B,
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  transition: 'all 0.2s',
                  background: tab === id ? CY : 'transparent',
                  color: tab === id ? '#000' : DM,
                  boxShadow: tab === id ? '0 0 12px rgba(0,240,255,0.35)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'password'
                ? <PasswordTab email={email} setEmail={setEmail} password={password} setPassword={setPassword} />
                : <OTPTab />}
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div style={{
            marginTop: '28px', paddingTop: '20px',
            borderTop: `1px solid ${BR}`,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '13px', color: DM, fontFamily: B }}>
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                style={{ color: CY, textDecoration: 'none', fontWeight: 600 }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Admin credentials hint */}
          <div style={{
            marginTop: '16px',
            background: 'rgba(255,0,229,0.05)',
            border: '1px solid rgba(255,0,229,0.2)',
            borderRadius: '10px',
            padding: '14px 20px',
          }}>
            <p style={{ fontFamily: D, fontSize: '0.75rem', fontWeight: 700, color: '#ff00e5', marginBottom: '8px', letterSpacing: '0.05em' }}>
              🔐 Admin Access
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '10px' }}>
              <p style={{ fontFamily: "'Courier New', monospace", fontSize: '12px', color: DM }}>
                admin@audix.com
              </p>
              <p style={{ fontFamily: "'Courier New', monospace", fontSize: '12px', color: DM }}>
                Admin@2026
              </p>
            </div>
            <button
              onClick={fillAdminCredentials}
              style={{
                background: 'rgba(255,0,229,0.12)',
                border: '1px solid rgba(255,0,229,0.35)',
                borderRadius: '7px',
                padding: '6px 14px',
                fontSize: '12px',
                fontFamily: D,
                fontWeight: 700,
                color: '#ff00e5',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,0,229,0.22)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,0,229,0.12)')}
            >
              Fill admin credentials →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
