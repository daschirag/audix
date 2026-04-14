import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const gameApi = axios.create({
  baseURL: 'http://localhost:5000/api/v1/game',
  withCredentials: true,
})

gameApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

gameApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default gameApi
