import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'
import {
  RiDashboardLine, RiQuestionLine, RiUserLine,
  RiBarChartLine, RiLogoutBoxLine, RiMenuLine,
  RiShieldCheckFill, RiArrowLeftSLine,
} from 'react-icons/ri'

/* ── design tokens ──────────────────────────────────────────────── */
const D  = "'Orbitron', sans-serif"
const B  = "'Inter', sans-serif"
const CY = '#00f0ff'
const MG = '#ff00e5'
const CD = '#111827'
const TX = '#e0e6ed'
const DM = '#7a8ba0'
const BR = 'rgba(0,240,255,0.15)'

const navItems = [
  { to: '/admin/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/admin/questions', icon: RiQuestionLine,  label: 'Questions' },
  { to: '/admin/users',     icon: RiUserLine,      label: 'Users' },
  { to: '/admin/analytics', icon: RiBarChartLine,  label: 'Analytics' },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const currentPage = navItems.find((n) => location.pathname.startsWith(n.to))?.label || 'Admin'

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0e17', fontFamily: B }}>

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 260 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'flex', flexDirection: 'column', height: '100%',
          background: CD, borderRight: `1px solid ${BR}`,
          overflow: 'hidden', flexShrink: 0, zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '0 16px', height: '64px',
          borderBottom: `1px solid ${BR}`, flexShrink: 0,
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
            background: 'rgba(0,240,255,0.1)', border: `1px solid rgba(0,240,255,0.25)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RiShieldCheckFill style={{ color: CY, fontSize: '17px' }} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                <p style={{ fontFamily: D, fontWeight: 700, fontSize: '14px', color: TX, letterSpacing: '0.06em' }}>
                  AUDIX
                </p>
                <p style={{ fontSize: '9px', color: MG, fontFamily: B, letterSpacing: '2px', marginTop: '-1px' }}>
                  ADMIN PANEL
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '10px',
                  textDecoration: 'none', transition: 'all 0.15s',
                  background: isActive ? 'rgba(0,240,255,0.08)' : 'transparent',
                  borderLeft: isActive ? `3px solid ${CY}` : '3px solid transparent',
                  color: isActive ? CY : DM,
                  paddingLeft: isActive ? '9px' : '12px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = TX
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = DM
                }}
              >
                <Icon style={{ fontSize: '18px', flexShrink: 0 }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: B }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            )
          })}
        </nav>

        {/* User info + logout */}
        <div style={{ borderTop: `1px solid ${BR}`, padding: '10px 8px', flexShrink: 0 }}>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', marginBottom: '4px' }}
              >
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(0,240,255,0.1)', border: `1px solid ${BR}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: D, fontSize: '11px', fontWeight: 700, color: CY,
                }}>
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: TX, fontFamily: B, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name || 'Admin'}
                  </p>
                  <span style={{
                    fontSize: '9px', fontFamily: D, fontWeight: 700, color: MG,
                    letterSpacing: '1px', background: 'rgba(255,0,229,0.1)',
                    padding: '1px 6px', borderRadius: '10px',
                  }}>
                    ADMIN
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '9px 12px', borderRadius: '10px', width: '100%',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: DM, transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,56,96,0.07)'
              e.currentTarget.style.color = '#ff3860'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = DM
            }}
          >
            <RiLogoutBoxLine style={{ fontSize: '17px', flexShrink: 0 }} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: B }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{
          height: '64px', background: `${CD}cc`,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${BR}`,
          display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: '16px', flexShrink: 0,
        }}>
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              width: '34px', height: '34px', borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: `1px solid ${BR}`,
              cursor: 'pointer', color: DM, transition: 'all 0.15s', flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = CY
              e.currentTarget.style.color = CY
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = BR
              e.currentTarget.style.color = DM
            }}
          >
            {collapsed
              ? <RiMenuLine style={{ fontSize: '16px' }} />
              : <RiArrowLeftSLine style={{ fontSize: '16px' }} />}
          </button>

          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: D, fontSize: '0.85rem', fontWeight: 700, color: TX, letterSpacing: '0.06em' }}>
              {currentPage.toUpperCase()}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#39ff14', animation: 'pulse-cyan 2s infinite' }} />
            <span style={{ fontSize: '11px', color: DM, fontFamily: B }}>Live</span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
