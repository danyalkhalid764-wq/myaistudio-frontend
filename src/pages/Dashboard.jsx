import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import VoiceGenerator from '../components/VoiceGenerator'
import { ttsAPI } from '../api/tts'
import { paymentAPI } from '../api/payment'
import { CreditCard, History, Crown, X, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BINANCE_ID } from '../config/apiConfig'

const Dashboard = () => {
  const { user, fetchUser } = useAuth()
  const [planInfo, setPlanInfo] = useState(null)
  const [voiceHistory, setVoiceHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const [subscriptionForm, setSubscriptionForm] = useState({
    name: '',
    transactionId: '',
    amount: 500
  })
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchPlanInfo()
    fetchVoiceHistory()
  }, [])

  const fetchPlanInfo = async () => {
    try {
      const info = await ttsAPI.getPlanInfo()
      setPlanInfo(info)
    } catch (error) {
      console.error('Failed to fetch plan info:', error)
    }
  }

  const fetchVoiceHistory = async () => {
    try {
      const history = await ttsAPI.getVoiceHistory()
      setVoiceHistory(history)
    } catch (error) {
      console.error('Failed to fetch voice history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerationComplete = () => {
    fetchPlanInfo()
    fetchVoiceHistory()
  }

  const copyBinanceId = () => {
    navigator.clipboard.writeText(BINANCE_ID)
    setCopied(true)
    toast.success('Binance ID copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubscriptionRequest = async () => {
    if (!subscriptionForm.name.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!subscriptionForm.transactionId.trim()) {
      toast.error('Please enter your Binance transaction ID')
      return
    }

    if (subscriptionForm.amount !== 500) {
      toast.error('Amount must be exactly 500')
      return
    }

    try {
      setSubmitting(true)
      const result = await paymentAPI.createSubscriptionRequest(
        subscriptionForm.transactionId,
        subscriptionForm.amount
      )

      if (result.success) {
        toast.success(result.message || 'Subscription request submitted successfully!')
        setShowSubscriptionDialog(false)
        setSubscriptionForm({ name: '', transactionId: '', amount: 500 })
        // Refresh user data to get updated requested status
        if (fetchUser) {
          await fetchUser()
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit subscription request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleIgnore = () => {
    setShowSubscriptionDialog(false)
    setSubscriptionForm({ name: '', transactionId: '', amount: 500 })
  }

  const isTrialUser = user?.plan === 'Trial' || user?.plan === 'Free'
  const canGenerate = isTrialUser ? user.daily_count < 3 : true
  const hasRequested = user?.requested === true
  const isPaid = user?.plan === 'Paid'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Plan Status */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${isTrialUser ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  <Crown className={`h-6 w-6 ${isTrialUser ? 'text-yellow-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user?.plan} Plan
                  </h3>
                  {isTrialUser && (
                    <p className="text-sm text-gray-600">
                      {3 - user.daily_count} generations remaining today
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isTrialUser && !isPaid && !hasRequested && (
                  <button
                    onClick={() => setShowSubscriptionDialog(true)}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Active Subscription</span>
                  </button>
                )}
                {hasRequested && (
                  <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md">
                    <span>⏳ Subscription request pending admin approval</span>
                  </div>
                )}
                {isPaid && (
                  <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-md">
                    <span>✓ Premium Plan Active</span>
                  </div>
                )}
              </div>
            </div>

            {planInfo && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Plan Features:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {planInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Voice Generator */}
        <div className="mb-8">
          <VoiceGenerator
            user={user}
            onGenerationComplete={handleGenerationComplete}
          />
        </div>

        {/* Subscription Dialog */}
        {showSubscriptionDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full flex flex-col max-h-[90vh]">
              {/* Dialog Header - Fixed */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900">Active Subscription</h2>
                <button
                  onClick={handleIgnore}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Dialog Content - Scrollable */}
              <div className="overflow-y-auto p-6 space-y-4 flex-1">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900 text-lg">Upgrade to Paid Plan</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Pay manually <span className="font-semibold text-blue-600">500</span> to the Binance wallet address below. Your plan will be upgraded by admin after payment verification.
                  </p>

                  {/* Binance Wallet Address - Enhanced Display */}
                  <div className="bg-white rounded-lg p-5 border-2 border-blue-400 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                        Binance Wallet Address
                      </label>
                      <button
                        onClick={copyBinanceId}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        title="Copy Binance Wallet Address"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span className="text-xs font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span className="text-xs font-semibold">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-lg p-4 border-2 border-blue-300">
                      <p className="font-mono text-sm md:text-base break-all text-gray-900 leading-relaxed select-all word-break-all">
                        {BINANCE_ID}
                      </p>
                    </div>
                    {copied && (
                      <div className="mt-3 p-3 bg-green-100 border-2 border-green-300 rounded-lg animate-pulse">
                        <p className="text-sm text-green-800 font-semibold flex items-center gap-2">
                          <Check className="h-4 w-4 flex-shrink-0" />
                          <span>Wallet address copied to clipboard!</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Crown className="h-5 w-5 text-green-600" />
                    After Purchase Benefits:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Plan upgraded to <span className="font-semibold">Paid</span></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span><span className="font-semibold">10,000 tokens</span> per day</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span><span className="font-semibold">5 voice generations</span> per day</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={subscriptionForm.name}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Binance Transaction ID *
                    </label>
                    <input
                      type="text"
                      value={subscriptionForm.transactionId}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, transactionId: e.target.value })}
                      placeholder="Enter your Binance transaction ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      value={subscriptionForm.amount}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Fixed amount: 500</p>
                  </div>
                </div>
              </div>

              {/* Dialog Footer - Fixed */}
              <div className="flex space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={handleIgnore}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Ignore
                </button>
                <button
                  onClick={handleSubscriptionRequest}
                  disabled={submitting || !subscriptionForm.transactionId.trim() || !subscriptionForm.name.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Voice History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <History className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Voice History</h3>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : voiceHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No voice generations yet</p>
          ) : (
            <div className="space-y-3">
              {voiceHistory.map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 mb-2">{entry.text}</p>
                      <p className="text-xs text-gray-500">
                        Generated on {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                    {entry.audio_url && (
                      <audio controls className="ml-4">
                        <source src={entry.audio_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard



























