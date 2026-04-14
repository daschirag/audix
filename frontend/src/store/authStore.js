import { create } from 'zustand'
import { useGameStore } from './gameStore'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('audix_token') || null,
  user: JSON.parse(localStorage.getItem('audix_user') || 'null'),

  setAuth: (token, user) => {
    localStorage.setItem('audix_token', token)
    localStorage.setItem('audix_user', JSON.stringify(user))
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('audix_token')
    localStorage.removeItem('audix_user')
    set({ token: null, user: null })
    // Clear game state when logging out to prevent stale session IDs
    useGameStore.getState().resetGame()
  },

  isAdmin: () => {
    const user = JSON.parse(localStorage.getItem('audix_user') || 'null')
    return user?.role === 'admin'
  },
}))
