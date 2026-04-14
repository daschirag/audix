import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import UserLoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPassword'
import ResetPasswordPage from './pages/auth/ResetPassword'
import AdminLoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import Questions from './pages/admin/Questions'
import Users from './pages/admin/Users'
import Analytics from './pages/admin/Analytics'
import AdminLayout from './layouts/AdminLayout'
import UserLayout from './layouts/UserLayout'
import UserDashboard from './pages/user/UserDashboard'
import Leaderboard from './pages/user/Leaderboard'
import PIIReport from './pages/user/PIIReport'
import GameLobby from './pages/game/GameLobby'
import RoundPage from './pages/game/RoundPage'
import ResultsPage from './pages/game/ResultsPage'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/play" replace />
  return children
}

const GuestRoute = ({ children }) => {
  const { token, user } = useAuthStore()
  if (!token) return children
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/play" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><UserLoginPage /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      <Route path="/admin/login" element={<GuestRoute><AdminLoginPage /></GuestRoute>} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="questions" element={<Questions />} />
        <Route path="users" element={<Users />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      <Route
        path="/play"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GameLobby />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="pii-report" element={<PIIReport />} />
        <Route path="round/:roundNumber" element={<RoundPage />} />
        <Route path="results" element={<ResultsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
