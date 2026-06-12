import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
})

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('xeno_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('xeno_token')
      localStorage.removeItem('xeno_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
