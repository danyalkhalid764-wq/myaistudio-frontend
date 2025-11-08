import axios from 'axios'
import { API_BASE_URL } from '../config/apiConfig'

// Create Axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: false, // Don't send cookies (not needed for JWT)
})

// Add request interceptor to include JWT token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - API may be unreachable')
    } else if (error.message === 'Network Error') {
      console.error('Network Error - Check if backend is running and CORS is configured')
      console.error('Attempted URL:', error.config?.url)
      console.error('Full URL:', `${API_BASE_URL}${error.config?.url}`)
    }
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      console.warn('Authentication failed - token may be expired')
      // Optionally clear token and redirect to login
      localStorage.removeItem('token')
    }
    
    return Promise.reject(error)
  }
)

export const authAPI = {
  /**
   * Login user and get JWT token
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{access_token: string, token_type: string}>}
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      })
      
      // Store token in localStorage
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token)
      }
      
      return response.data
    } catch (error) {
      console.error('Login API Error:', error)
      console.error('API Base URL:', API_BASE_URL)
      console.error('Error details:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Register new user
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<UserResponse>}
   */
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

  /**
   * Get current authenticated user
   * @returns {Promise<UserResponse>}
   * 
   * Example usage:
   * ```javascript
   * try {
   *   const user = await authAPI.getCurrentUser()
   *   console.log('Current user:', user)
   * } catch (error) {
   *   if (error.response?.status === 401) {
   *     console.log('Not authenticated - redirect to login')
   *   }
   * }
   * ```
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      // Only log non-401 errors (401 is expected when token is expired/invalid)
      if (error.response?.status !== 401) {
        console.error('Get Current User API Error:', error)
        console.error('Response:', error.response?.data)
      }
      throw error
    }
  },
}
