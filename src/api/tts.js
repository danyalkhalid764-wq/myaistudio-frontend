import axios from 'axios'
import { API_BASE_URL } from '../config/apiConfig'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const ttsAPI = {
  generateVoice: async (text) => {
    const response = await api.post('/api/generate-voice', { text })
    return response.data
  },

  getVoiceHistory: async () => {
    const response = await api.get('/api/history')
    return response.data
  },

  getPlanInfo: async () => {
    const response = await api.get('/api/plan')
    return response.data
  },
}







