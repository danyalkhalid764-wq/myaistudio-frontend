import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../api/admin'
import { Users, CheckCircle, Clock, LogOut, RefreshCw, XCircle, Settings, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [users, setUsers] = useState({
        free_users: [],
        paid_users: [],
        requested_users: [],
    })
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null)
    const [userPayments, setUserPayments] = useState(null)
    const [showDialog, setShowDialog] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [settingsForm, setSettingsForm] = useState({
        currentPassword: '',
        newName: '',
        newPassword: '',
    })
    const [updatingCredentials, setUpdatingCredentials] = useState(false)

    useEffect(() => {
        // Check if user is admin
        const isAdmin = localStorage.getItem('isAdmin') === 'true' ||
            (user && (user.plan === 'Admin' || user.name === 'Sohaib'))

        if (!isAdmin) {
            toast.error('Unauthorized access')
            navigate('/login')
            return
        }

        fetchUsers()
    }, [user, navigate])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const data = await adminAPI.getAllUsers()
            setUsers(data)
        } catch (error) {
            console.error('Failed to fetch users:', error)
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const handleUserClick = async (userId) => {
        try {
            const data = await adminAPI.getUserPayments(userId)
            setUserPayments(data)
            setSelectedUser(data.user)
            setShowDialog(true)
        } catch (error) {
            console.error('Failed to fetch user payments:', error)
            toast.error('Failed to load user details')
        }
    }

    const handleAcceptRequest = async () => {
        if (!selectedUser) return

        try {
            setProcessing(true)
            await adminAPI.acceptUserRequest(selectedUser.id)
            toast.success('User request accepted! Plan updated to Paid.')
            setShowDialog(false)
            fetchUsers() // Refresh the list
        } catch (error) {
            console.error('Failed to accept request:', error)
            toast.error('Failed to accept request')
        } finally {
            setProcessing(false)
        }
    }

    const handleRejectRequest = async () => {
        if (!selectedUser) return

        try {
            setProcessing(true)
            await adminAPI.rejectUserRequest(selectedUser.id)
            toast.success('User request rejected.')
            setShowDialog(false)
            fetchUsers() // Refresh the list
        } catch (error) {
            console.error('Failed to reject request:', error)
            toast.error('Failed to reject request')
        } finally {
            setProcessing(false)
        }
    }

    const handleUpdateCredentials = async (e) => {
        e.preventDefault()

        if (!settingsForm.currentPassword) {
            toast.error('Current password is required')
            return
        }

        if (!settingsForm.newName && !settingsForm.newPassword) {
            toast.error('Please provide new name or password')
            return
        }

        try {
            setUpdatingCredentials(true)
            await adminAPI.updateAdminCredentials(
                settingsForm.currentPassword,
                settingsForm.newName,
                settingsForm.newPassword
            )
            toast.success('Credentials updated successfully! Please login again.')
            setShowSettings(false)
            setSettingsForm({ currentPassword: '', newName: '', newPassword: '' })
            setTimeout(() => {
                logout()
                navigate('/admin/login')
            }, 2000)
        } catch (error) {
            console.error('Failed to update credentials:', error)
            toast.error(error.response?.data?.detail || 'Failed to update credentials')
        } finally {
            setUpdatingCredentials(false)
        }
    }

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully')
        navigate('/login')
    }

    const UserCard = ({ user, type }) => {
        const bgColors = {
            free: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
            paid: 'bg-green-50 border-green-200 hover:bg-green-100',
            requested: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
        }

        const textColors = {
            free: 'text-blue-800',
            paid: 'text-green-800',
            requested: 'text-yellow-800',
        }

        return (
            <div
                onClick={() => type === 'requested' && handleUserClick(user.id)}
                className={`${bgColors[type]} ${type === 'requested' ? 'cursor-pointer' : ''} border-2 rounded-lg p-4 transition-all shadow-sm`}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className={`font-semibold ${textColors[type]} text-lg mb-1`}>
                            {user.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">{user.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${textColors[type]}`}>
                                {user.plan}
                            </span>
                            <span className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-700">
                                Tokens: {user.total_tokens_used || 0}
                            </span>
                        </div>
                        {user.created_at && (
                            <p className="text-xs text-gray-500 mt-2">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading users...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Admin Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="text-purple-100 mt-1">User Management Panel</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="flex items-center space-x-2 bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg transition"
                            >
                                <Settings className="h-5 w-5" />
                                <span>Settings</span>
                            </button>
                            <button
                                onClick={fetchUsers}
                                className="flex items-center space-x-2 bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg transition"
                            >
                                <RefreshCw className="h-5 w-5" />
                                <span>Refresh</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg transition"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Update Admin Credentials</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateCredentials} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Password *
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={settingsForm.currentPassword}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Name (optional)
                                </label>
                                <input
                                    type="text"
                                    value={settingsForm.newName}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, newName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter new admin name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password (optional)
                                </label>
                                <input
                                    type="password"
                                    value={settingsForm.newPassword}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={updatingCredentials}
                                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
                                >
                                    <Save className="h-5 w-5" />
                                    <span>{updatingCredentials ? 'Updating...' : 'Update Credentials'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowSettings(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Free Users</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{users.free_users.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Paid Users</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{users.paid_users.length}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Requested Users</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">{users.requested_users.length}</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Free Users Column */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Users className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-900">Free Users</h2>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                                {users.free_users.length}
                            </span>
                        </div>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {users.free_users.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No free users</p>
                            ) : (
                                users.free_users.map((user) => (
                                    <UserCard key={user.id} user={user} type="free" />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Paid Users Column */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <h2 className="text-xl font-bold text-gray-900">Paid Users</h2>
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                {users.paid_users.length}
                            </span>
                        </div>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {users.paid_users.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No paid users</p>
                            ) : (
                                users.paid_users.map((user) => (
                                    <UserCard key={user.id} user={user} type="paid" />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Requested Users Column */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <h2 className="text-xl font-bold text-gray-900">Requested Users</h2>
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                                {users.requested_users.length}
                            </span>
                        </div>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {users.requested_users.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No pending requests</p>
                            ) : (
                                users.requested_users.map((user) => (
                                    <UserCard key={user.id} user={user} type="requested" />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* User Details Dialog */}
            {showDialog && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                            <button
                                onClick={() => setShowDialog(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* User Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium">{selectedUser.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Plan</p>
                                        <p className="font-medium">{selectedUser.plan}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Tokens Used</p>
                                        <p className="font-medium">{selectedUser.total_tokens_used || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                                {userPayments && userPayments.payments.length > 0 ? (
                                    <div className="space-y-3">
                                        {userPayments.payments.map((payment) => (
                                            <div key={payment.id} className="border rounded-lg p-4 bg-gray-50">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Amount</p>
                                                        <p className="font-medium">${payment.amount.toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Status</p>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                            }`}>
                                                            {payment.status}
                                                        </span>
                                                    </div>
                                                    {payment.transaction_id && (
                                                        <div>
                                                            <p className="text-sm text-gray-500">Transaction ID</p>
                                                            <p className="font-medium text-xs">{payment.transaction_id}</p>
                                                        </div>
                                                    )}
                                                    {payment.created_at && (
                                                        <div>
                                                            <p className="text-sm text-gray-500">Date</p>
                                                            <p className="font-medium">{new Date(payment.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No payment history</p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4 pt-4 border-t">
                                <button
                                    onClick={handleAcceptRequest}
                                    disabled={processing}
                                    className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                    <span>{processing ? 'Processing...' : 'Accept Request'}</span>
                                </button>
                                <button
                                    onClick={handleRejectRequest}
                                    disabled={processing}
                                    className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle className="h-5 w-5" />
                                    <span>{processing ? 'Processing...' : 'Reject Request'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard


