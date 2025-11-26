import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser()
      setUser(userData)
    } catch (error) {
      // Only log if it's not a 401 (unauthorized) - 401 means token is expired/invalid, which is normal
      if (error.response?.status !== 401) {
        console.error('Failed to fetch user:', error)
      }
      // Clear invalid/expired token silently
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      const { access_token } = response

      if (!access_token) {
        return {
          success: false,
          error: 'Login failed: No token received from server'
        }
      }

      localStorage.setItem('token', access_token)
      setToken(access_token)

      const userData = await authAPI.getCurrentUser()
      setUser(userData)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)

      // Handle different error types
      let errorMessage = 'Login failed'

      if (error.response) {
        // Server responded with error
        const status = error.response.status
        const detail = error.response.data?.detail

        if (status === 401) {
          errorMessage = detail || 'Incorrect email or password'
        } else if (status === 422) {
          // Validation error
          const errors = error.response.data?.detail || []
          if (Array.isArray(errors)) {
            errorMessage = errors.join(', ')
          } else {
            errorMessage = detail || 'Invalid input'
          }
        } else if (status === 500) {
          errorMessage = detail || 'Server error. Please try again later.'
        } else {
          errorMessage = detail || `Login failed (${status})`
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error. Please check your connection and try again.'
      } else {
        // Error setting up the request
        errorMessage = error.message || 'Login failed'
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register(name, email, password)
      setUser(response)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      }
    }
  }

  const adminLogin = async (name, password) => {
    try {
      const response = await authAPI.adminLogin(name, password)

      // Simple response format: { success: bool, message: string }
      if (response.success) {
        localStorage.setItem('isAdmin', 'true')
        // Set a simple admin user object
        setUser({
          id: 0,
          name: name,
          email: 'admin@myaistudio.com',
          plan: 'Admin'
        })
        return { success: true }
      } else {
        return {
          success: false,
          error: response.message || 'Login unsuccessful'
        }
      }
    } catch (error) {
      console.error('Admin login error:', error)

      let errorMessage = 'Admin login failed'
      if (error.response) {
        const status = error.response.status
        const detail = error.response.data?.message || error.response.data?.detail

        if (status === 401 || status === 403) {
          errorMessage = detail || 'Invalid admin credentials'
        } else {
          errorMessage = detail || `Login failed (${status})`
        }
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('isAdmin')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    login,
    adminLogin,
    register,
    logout,
    fetchUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Helper to read the auth token from localStorage for non-React modules
export const getAuthToken = () => {
  return localStorage.getItem('token')
}
























