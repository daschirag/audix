import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { RiShieldCheckFill, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'

const useWide = () => {
  const [wide, setWide] = useState(window.innerWidth >= 1024)
  useEffect(() => {
    const fn = () => setWide(window.innerWidth >= 1024)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return wide
}

const F = "'Space Grotesk', sans-serif"
const B = "'DM Sans', sans-serif"

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()
  const wide        = useWide()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Fill in all fields')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.data.accessToken, data.data.user)
      toast.success('Welcome back, ' + data.data.user.name)
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fi = e => { e.target.style.borderColor='rgba(79,152,163,0.55)'; e.target.style.background='rgba(79,152,163,0.05)' }
  const bi = e => { e.target.style.borderColor='rgba(255,255,255,0.07)'; e.target.style.background='rgba(255,255,255,0.03)' }

  const inputBase = {
    width:'100%', background:'rgba(255,255,255,0.03)',
    border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px',
    padding:'12px 16px', fontSize:'14px', color:'#e8e7e5',
    outline:'none', fontFamily:B, transition:'border-color 0.2s, background 0.2s',
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#0b0a09', fontFamily:B }}>

      {/* ── LEFT ── */}
      {wide && (
        <div style={{
          width:'50%', display:'flex', flexDirection:'column',
          justifyContent:'space-between', padding:'52px 60px',
          background:'radial-gradient(ellipse at 15% 65%, rgba(79,152,163,0.14) 0%, transparent 60%), #0d0c0b',
          position:'relative', overflow:'hidden'
        }}>
          {/* grid */}
          <div style={{
            position:'absolute', inset:0, opacity:0.04,
            backgroundImage:'linear-gradient(rgba(79,152,163,1) 1px,transparent 1px),linear-gradient(90deg,rgba(79,152,163,1) 1px,transparent 1px)',
            backgroundSize:'52px 52px'
          }}/>
          {/* glow */}
          <div style={{
            position:'absolute', top:'-100px', left:'-100px',
            width:'500px', height:'500px', borderRadius:'50%',
            background:'radial-gradient(circle,rgba(79,152,163,0.14),transparent 70%)',
            filter:'blur(60px)', pointerEvents:'none'
          }}/>

          {/* Logo */}
          <div style={{ position:'relative', display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'34px', height:'34px', borderRadius:'9px', background:'rgba(79,152,163,0.12)', border:'1px solid rgba(79,152,163,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <RiShieldCheckFill style={{ color:'#4f98a3', fontSize:'17px' }}/>
            </div>
            <span style={{ color:'#d4d3d1', fontWeight:700, fontSize:'16px', fontFamily:F, letterSpacing:'-0.01em' }}>Audix</span>
          </div>

          {/* Hero */}
          <div style={{ position:'relative' }}>
            <p style={{ fontSize:'10px', fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase', color:'#4f98a3', marginBottom:'18px', fontFamily:B }}>Admin Console</p>
            <h1 style={{ fontFamily:F, fontSize:'52px', fontWeight:700, lineHeight:1.08, letterSpacing:'-0.035em', color:'#eeede9', marginBottom:'18px' }}>
              Secure.<br/>Scalable.<br/><span style={{ color:'#4f98a3' }}>In Control.</span>
            </h1>
            <p style={{ fontSize:'13px', color:'#4a4947', lineHeight:1.8, maxWidth:'280px', marginBottom:'30px', fontFamily:B }}>
              Manage your cybersecurity training platform — monitor sessions, oversee users, and track threats in real time.
            </p>

            {/* Stats */}
            <div style={{ display:'flex', gap:'8px' }}>
              {[['6','Game Rounds'],['360°','Threat Coverage'],['Live','Analytics']].map(([v,l]) => (
                <div key={l} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.065)', borderRadius:'10px', padding:'10px 14px' }}>
                  <p style={{ color:'#4f98a3', fontWeight:600, fontSize:'14px', lineHeight:1, fontFamily:F }}>{v}</p>
                  <p style={{ color:'#3e3d3b', fontSize:'10px', marginTop:'5px', fontFamily:B }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          <p style={{ position:'relative', fontSize:'11px', color:'#282725', fontFamily:B }}>© 2026 Audix · Cybersecurity Training Platform</p>
        </div>
      )}

      {/* ── RIGHT ── */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding: wide ? '48px 64px' : '40px 24px',
        background:'#0f0e0c', position:'relative'
      }}>
        <div style={{ position:'absolute', bottom:'-40px', right:'-40px', width:'280px', height:'280px', borderRadius:'50%', background:'radial-gradient(circle,rgba(79,152,163,0.06),transparent 70%)', filter:'blur(32px)', pointerEvents:'none' }}/>

        <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45, ease:[0.16,1,0.3,1] }}
          style={{ width:'100%', maxWidth:'340px', position:'relative' }}>

          {/* Mobile logo */}
          {!wide && (
            <div style={{ display:'flex', alignItems:'center', gap:'9px', marginBottom:'36px' }}>
              <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'rgba(79,152,163,0.12)', border:'1px solid rgba(79,152,163,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <RiShieldCheckFill style={{ color:'#4f98a3', fontSize:'15px' }}/>
              </div>
              <span style={{ color:'#d4d3d1', fontWeight:700, fontSize:'15px', fontFamily:F }}>Audix</span>
            </div>
          )}

          {/* Heading */}
          <div style={{ marginBottom:'28px' }}>
            <h2 style={{ fontFamily:F, fontSize:'28px', fontWeight:700, color:'#eeede9', marginBottom:'5px', letterSpacing:'-0.03em' }}>Welcome back</h2>
            <p style={{ fontSize:'13px', color:'#4a4947', fontFamily:B }}>Sign in to your admin account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

            <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
              <label style={{ fontSize:'11px', fontWeight:500, color:'#525150', letterSpacing:'0.05em', textTransform:'uppercase', fontFamily:B }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="admin@audix.com" autoComplete="email"
                style={inputBase} onFocus={fi} onBlur={bi}/>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
              <label style={{ fontSize:'11px', fontWeight:500, color:'#525150', letterSpacing:'0.05em', textTransform:'uppercase', fontFamily:B }}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="Enter your password" autoComplete="current-password"
                  style={{ ...inputBase, paddingRight:'42px' }} onFocus={fi} onBlur={bi}/>
                <button type="button" onClick={()=>setShowPass(!showPass)}
                  style={{ position:'absolute', right:'13px', top:'50%', transform:'translateY(-50%)', color:'#3a3937', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', transition:'color 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#6a6967'}
                  onMouseLeave={e=>e.currentTarget.style.color='#3a3937'}>
                  {showPass ? <RiEyeOffLine style={{fontSize:'17px'}}/> : <RiEyeLine style={{fontSize:'17px'}}/>}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileTap={{scale:0.985}}
              style={{ marginTop:'6px', width:'100%', background: loading?'#3d8085':'#4f98a3', color:'#0a0908', border:'none', borderRadius:'10px', padding:'12.5px', fontSize:'14px', fontWeight:600, cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontFamily:F, letterSpacing:'-0.01em', transition:'background 0.18s' }}
              onMouseEnter={e=>{ if(!loading) e.currentTarget.style.background='#3d8a95' }}
              onMouseLeave={e=>{ if(!loading) e.currentTarget.style.background='#4f98a3' }}>
              {loading
                ? <><span style={{ width:'15px', height:'15px', border:'2px solid rgba(10,9,8,0.2)', borderTopColor:'#0a0908', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }}/> Signing in...</>
                : 'Sign In'}
            </motion.button>
          </form>

          <div style={{ marginTop:'28px', paddingTop:'20px', borderTop:'1px solid #191817' }}>
            <p style={{ textAlign:'center', fontSize:'11px', color:'#2c2b29', fontFamily:B }}>Protected by Audix Security · Admin access only</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
