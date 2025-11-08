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

export const paymentAPI = {
  createPayment: async (plan, amount) => {
    const response = await api.post('/api/payment/create', { plan, amount })
    return response.data
  },

  getPaymentHistory: async () => {
    const response = await api.get('/api/payment/history')
    return response.data
  },

  triggerUpgrade: async (plan) => {
    const response = await api.post('/api/payment/upgrade', null, {
      params: { plan }
    })
    return response.data
  },
}





















