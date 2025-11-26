import axios from 'axios'
import { API_BASE_URL } from '../config/apiConfig'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// No token interceptor needed - admin endpoints don't require authentication

export const adminAPI = {
    getAllUsers: async () => {
        const response = await api.get('/auth/admin/users')
        return response.data
    },

    getUserPayments: async (userId) => {
        const response = await api.get(`/auth/admin/users/${userId}/payments`)
        return response.data
    },

    acceptUserRequest: async (userId) => {
        const response = await api.put(`/auth/admin/users/${userId}/accept`)
        return response.data
    },

    rejectUserRequest: async (userId) => {
        const response = await api.put(`/auth/admin/users/${userId}/reject`)
        return response.data
    },

    updateAdminCredentials: async (currentPassword, newName, newPassword) => {
        const response = await api.put('/auth/admin/credentials', {
            current_password: currentPassword,
            name: newName || undefined,
            password: newPassword || undefined,
        })
        return response.data
    },
}


