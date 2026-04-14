import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import {
  RiHomeLine,
  RiGamepadLine,
  RiBarChartLine,
  RiLogoutBoxLine,
  RiShieldCheckFill,
} from 'react-icons/ri'

const D  = "'Orbitron', sans-serif"
const B  = "'Inter', sans-serif"
const CY = '#00f0ff'
const BG = '#0a0e17'
const CD = '#111827'
const TX = '#e0e6ed'
const DM = '#7a8ba0'
const BR = 'rgba(0,240,255,0.15)'

const NAV_ITEMS = [
  { to: '/play',            icon: RiGamepadLine,  label: 'Arena' },
  { to: '/play/dashboard',  icon: RiHomeLine,     label: 'Dashboard' },
  { to: '/play/leaderboard',icon: RiBarChartLine, label: 'Leaderboard' },
]

export default function UserLayout() {
  const { user, logout } = useAuthStore()
  const navigate         = useNavigate()
  const location         = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: BG, fontFamily: B }}>
      {/* TOP NAV */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px', padding: '0 24px',
        background: `${CD}cc`,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${BR}`,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(0,240,255,0.1)', border: `1px solid ${BR}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RiShieldCheckFill style={{ color: CY, fontSize: '16px' }} />
          </div>
          <span style={{ fontFamily: D, fontWeight: 700, fontSize: '15px', color: TX, letterSpacing: '0.05em' }}>
            AUDIX
          </span>
        </div>

        {/* Desktop nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/play'
              ? location.pathname === '/play'
              : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/play'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '8px',
                  fontSize: '12px', fontFamily: B, fontWeight: 500,
                  textDecoration: 'none', transition: 'all 0.2s',
                  color: isActive ? CY : DM,
                  background: isActive ? 'rgba(0,240,255,0.08)' : 'transparent',
                  border: isActive ? `1px solid rgba(0,240,255,0.15)` : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = TX
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = DM
                }}
              >
                <Icon style={{ fontSize: '15px' }} />
                <span className="hide-xs">{label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Right: user + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'rgba(0,240,255,0.1)',
              border: `1px solid ${BR}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: D, fontSize: '11px', fontWeight: 700, color: CY,
            }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <span style={{ fontSize: '13px', color: TX, fontFamily: B, fontWeight: 500 }}
              className="hide-xs">
              {user?.name || 'Trainee'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '8px',
              background: 'transparent',
              border: '1px solid transparent',
              color: DM, cursor: 'pointer',
              fontSize: '12px', fontFamily: B,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ff3860'
              e.currentTarget.style.background = 'rgba(255,56,96,0.08)'
              e.currentTarget.style.borderColor = 'rgba(255,56,96,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = DM
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <RiLogoutBoxLine style={{ fontSize: '16px' }} />
            <span className="hide-xs">Logout</span>
          </button>
        </div>
      </header>

      <style>{`
        @media (max-width: 480px) { .hide-xs { display: none !important; } }
      `}</style>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ minHeight: '100%' }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* MOBILE bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
        background: `${CD}e0`,
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${BR}`,
        display: 'flex', alignItems: 'center', justifyContent: 'around',
        height: '60px', padding: '0 8px',
      }}
        className="mobile-bottom-nav"
      >
        <style>{`
          .mobile-bottom-nav { display: none !important; }
          @media (max-width: 767px) { .mobile-bottom-nav { display: flex !important; } }
          .mobile-bottom-nav > a { flex: 1; }
        `}</style>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/play'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '3px', padding: '8px 4px',
              textDecoration: 'none', transition: 'color 0.2s',
              color: isActive ? CY : DM,
              flex: 1,
            })}
          >
            {({ isActive }) => (
              <>
                <Icon style={{ fontSize: '20px', color: isActive ? CY : DM }} />
                <span style={{ fontSize: '10px', fontFamily: B, fontWeight: 500, color: isActive ? CY : DM }}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ height: '60px' }} className="mobile-spacer" />
      <style>{`
        .mobile-spacer { display: none; }
        @media (max-width: 767px) { .mobile-spacer { display: block; } }
      `}</style>
    </div>
  )
}
