import axios from 'axios'
import { API_BASE_URL } from '../config/apiConfig'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - API may be unreachable')
    } else if (error.message === 'Network Error') {
      console.error('Network Error - Check if backend is running and CORS is configured')
      console.error('Attempted URL:', error.config?.url)
      console.error('Full URL:', `${API_BASE_URL}${error.config?.url}`)
    }
    return Promise.reject(error)
  }
)

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      })
      return response.data
    } catch (error) {
      console.error('Login API Error:', error)
      console.error('API Base URL:', API_BASE_URL)
      console.error('Error details:', error.response?.data || error.message)
      throw error
    }
  },

  register: async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      })
      return response.data
    } catch (error) {
      console.error('Register API Error:', error)
      console.error('API Base URL:', API_BASE_URL)
      console.error('Error details:', error.response?.data || error.message)
      throw error
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      console.error('Get Current User API Error:', error)
      throw error
    }
  },
}
