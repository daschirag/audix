import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import authApi from '../../api/authApi'
import toast from 'react-hot-toast'
import {
  RiShieldCheckFill,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowLeftLine,
  RiCheckLine,
  RiCloseLine,
} from 'react-icons/ri'

/* ── shared tokens ──────────────────────────────────────────────── */
const D  = "'Orbitron', sans-serif"
const B  = "'Inter', sans-serif"
const CY = '#00f0ff'
const BG = '#0a0e17'
const CD = '#111827'
const C2 = '#1a2332'
const TX = '#e0e6ed'
const DM = '#7a8ba0'
const BR = 'rgba(0,240,255,0.15)'

const DEPARTMENTS = [
  'Engineering', 'HR', 'Finance', 'Marketing',
  'Operations', 'Legal', 'Executive', 'Other',
]

const PASSWORD_REQS = [
  { label: '8+ characters',  test: (v) => v.length >= 8 },
  { label: 'Uppercase',      test: (v) => /[A-Z]/.test(v) },
  { label: 'Lowercase',      test: (v) => /[a-z]/.test(v) },
  { label: 'Number',         test: (v) => /\d/.test(v) },
  { label: 'Special char',   test: (v) => /[@$!%*?&]/.test(v) },
]

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

function focusInput(e) {
  e.target.style.borderColor = CY
  e.target.style.boxShadow   = '0 0 0 3px rgba(0,240,255,0.1)'
}
function blurInput(e) {
  e.target.style.borderColor = BR
  e.target.style.boxShadow   = 'none'
}

/* strength: 0-4 based on how many requirements are met */
function getStrength(password) {
  return PASSWORD_REQS.filter((r) => r.test(password)).length
}

const STRENGTH_COLORS = ['#ff3860', '#ff3860', '#f97316', '#ffd700', '#39ff14']
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']

function StrengthMeter({ password }) {
  const strength = getStrength(password)
  if (!password) return null
  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '4px',
            background: i <= strength ? STRENGTH_COLORS[strength] : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <p style={{ fontSize: '11px', fontFamily: B, color: STRENGTH_COLORS[strength] }}>
        {STRENGTH_LABELS[strength]}
      </p>
    </div>
  )
}

/* ── LEFT HERO PANEL (identical to login) ───────────────────────── */
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
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage:
          `linear-gradient(rgba(0,240,255,1) 1px,transparent 1px),
           linear-gradient(90deg,rgba(0,240,255,1) 1px,transparent 1px)`,
        backgroundSize: '52px 52px',
      }} />
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
          background: 'rgba(0,240,255,0.1)', border: `1px solid ${BR}`,
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
          lineHeight: 1.1, color: TX, marginBottom: '20px',
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
          Master cybersecurity through interactive scenarios. Identify phishing, protect PII, and build real-world defense skills.
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

/* ── MAIN PAGE ──────────────────────────────────────────────────── */
export default function SignupPage() {
  const [name, setName]                   = useState('')
  const [email, setEmail]                 = useState('')
  const [department, setDepartment]       = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass]           = useState(false)
  const [loading, setLoading]             = useState(false)
  const { setAuth }                       = useAuthStore()
  const navigate                          = useNavigate()

  const allMet        = PASSWORD_REQS.every((r) => r.test(password))
  const passwordsMatch = confirmPassword && password === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword)
      return toast.error('Please fill in all required fields')
    if (password.length < 8)
      return toast.error('Password must be at least 8 characters')
    if (!allMet)
      return toast.error('Password must include uppercase, lowercase, number and special character')
    if (password !== confirmPassword)
      return toast.error('Passwords do not match')

    setLoading(true)
    try {
      const { data } = await authApi.post('/auth/signup', {
        name, email, password,
        department: department || undefined,
      })
      setAuth(data.data.accessToken, data.data.user)
      toast.success('Account created successfully')
      navigate(data.data.user.role === 'admin' ? '/admin/dashboard' : '/play')
    } catch (err) {
      const errs = err.response?.data?.errors
      toast.error(errs?.[0] || err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const confirmBorderColor = confirmPassword
    ? passwordsMatch ? '#39ff14' : '#ff3860'
    : BR

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: BG, fontFamily: B }}>
      {/* LEFT hero — desktop only */}
      <div style={{ display: 'none' }} className="lg-hero-signup">
        <HeroPanel />
      </div>
      <style>{`
        @media (min-width: 1024px) { .lg-hero-signup { display: flex !important; } }
      `}</style>

      {/* RIGHT form */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', background: CD, position: 'relative', overflow: 'hidden',
      }}>
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
          style={{ width: '100%', maxWidth: '420px', position: 'relative' }}
        >
          {/* Mobile logo */}
          <div className="mobile-logo-signup" style={{ display: 'none', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
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
            @media (max-width: 1023px) { .mobile-logo-signup { display: flex !important; } }
          `}</style>

          {/* Back link */}
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: DM, textDecoration: 'none', fontSize: '12px', fontFamily: B,
              marginBottom: '20px', transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = CY)}
            onMouseLeave={(e) => (e.currentTarget.style.color = DM)}
          >
            <RiArrowLeftLine style={{ fontSize: '14px' }} />
            Back to login
          </Link>

          {/* Heading */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontFamily: D, fontSize: '22px', fontWeight: 700, color: TX, marginBottom: '6px', letterSpacing: '0.02em' }}>
              Create account
            </h2>
            <p style={{ fontSize: '14px', color: DM, fontFamily: B }}>
              Start your cybersecurity training journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Full Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text" value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" autoComplete="name"
                style={inputStyle}
                onFocus={focusInput} onBlur={blurInput}
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="you@company.com" autoComplete="email"
                style={inputStyle}
                onFocus={focusInput} onBlur={blurInput}
              />
            </div>

            {/* Department dropdown */}
            <div>
              <label style={labelStyle}>
                Department <span style={{ color: 'rgba(120,139,160,0.5)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237a8ba0' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  paddingRight: '36px',
                  cursor: 'pointer',
                }}
                onFocus={focusInput} onBlur={blurInput}
              >
                <option value="" style={{ background: C2, color: DM }}>Select department…</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} style={{ background: C2, color: TX }}>{d}</option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  style={{ ...inputStyle, paddingRight: '42px' }}
                  onFocus={focusInput} onBlur={blurInput}
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
              </div>

              {/* Strength meter */}
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <StrengthMeter password={password} />
                </div>
              )}
            </div>

            {/* Password requirements */}
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  background: 'rgba(0,240,255,0.03)',
                  border: `1px solid ${BR}`,
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '5px 16px',
                }}
              >
                {PASSWORD_REQS.map(({ label, test }) => {
                  const met = test(password)
                  return (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {met
                        ? <RiCheckLine style={{ color: '#39ff14', fontSize: '12px', flexShrink: 0 }} />
                        : <RiCloseLine style={{ color: 'rgba(120,139,160,0.5)', fontSize: '12px', flexShrink: 0 }} />}
                      <span style={{
                        fontSize: '11px', fontFamily: B,
                        color: met ? '#39ff14' : DM,
                        transition: 'color 0.2s',
                      }}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </motion.div>
            )}

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                style={{ ...inputStyle, borderColor: confirmBorderColor }}
                onFocus={focusInput}
                onBlur={(e) => {
                  e.target.style.borderColor = confirmBorderColor
                  e.target.style.boxShadow = 'none'
                }}
              />
              {confirmPassword && !passwordsMatch && (
                <p style={{ fontSize: '11px', color: '#ff3860', fontFamily: B, marginTop: '4px' }}>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading
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
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                marginTop: '4px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
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
                    borderTopColor: '#000', borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Creating account…
                </>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '24px', paddingTop: '18px',
            borderTop: `1px solid ${BR}`,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '13px', color: DM, fontFamily: B }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{ color: CY, textDecoration: 'none', fontWeight: 600 }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
