import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const userApi = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1') + '/user',
  withCredentials: true,
})

userApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

userApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default userApi
