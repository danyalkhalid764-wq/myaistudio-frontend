import React, { useState, useRef } from 'react'
import { Play, Pause, Download, Loader, AlertCircle, X } from 'lucide-react'
import { ttsAPI } from '../api/tts'
import toast from 'react-hot-toast'

const VoiceGenerator = ({ user, onGenerationComplete }) => {
  const [text, setText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioData, setAudioData] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to generate voice')
      return
    }

    setIsGenerating(true)
    setError(null) // Clear previous errors
    
    try {
      const response = await ttsAPI.generateVoice(text)
      
      if (response.success) {
        if (response.audio_data) {
          // Trial user - play base64 audio
          const audioBlob = new Blob([
            Uint8Array.from(atob(response.audio_data), c => c.charCodeAt(0))
          ], { type: 'audio/mpeg' })
          const url = URL.createObjectURL(audioBlob)
          setAudioUrl(url)
          setAudioData(response.audio_data)
        } else if (response.audio_url) {
          // Paid user - use URL
          setAudioUrl(response.audio_url)
        }
        
        onGenerationComplete?.()
        toast.success('Voice generated successfully!')
      } else {
        // Handle error response
        if (response.error) {
          setError(response.error)
          toast.error(response.message || 'Failed to generate voice')
        } else {
          toast.error(response.message || 'Failed to generate voice')
        }
      }
    } catch (error) {
      console.error('Voice generation error:', error)
      
      // Extract error details from response
      const errorData = error.response?.data
      if (errorData) {
        if (errorData.error) {
          setError(errorData.error)
        } else if (errorData.detail) {
          // If detail is a string, create error object
          if (typeof errorData.detail === 'string') {
            setError({
              message: errorData.detail,
              error_type: 'API_ERROR',
              status_code: error.response?.status || 500,
              details: errorData.detail
            })
          } else {
            setError(errorData.detail)
          }
        }
        toast.error(errorData.detail || errorData.message || 'Failed to generate voice')
      } else {
        setError({
          message: error.message || 'Failed to generate voice',
          error_type: 'NETWORK_ERROR',
          status_code: 0,
          details: error.message
        })
        toast.error(error.message || 'Failed to generate voice')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = `voice_${Date.now()}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const canGenerate = user.plan === 'Trial' ? user.daily_count < 3 : true
  const isTrialUser = user.plan === 'Trial'

  // Error type colors
  const getErrorColor = (errorType) => {
    switch (errorType) {
      case 'API_KEY_ERROR':
      case 'SERVICE_NOT_CONFIGURED':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'PAYMENT_REQUIRED':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'QUOTA_EXCEEDED':
      case 'RATE_LIMIT_EXCEEDED':
      case 'TOKEN_LIMIT_EXCEEDED':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate Voice</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
            Enter text to convert to speech:
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your text here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className={`${getErrorColor(error.error_type)} border rounded-md p-4 relative`}>
            <button
              onClick={() => setError(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Error: {error.error_type || 'Unknown Error'}</h3>
                <p className="text-sm mb-2">{error.message}</p>
                {error.details && error.details !== error.message && (
                  <div className="mt-2">
                    <p className="text-xs font-medium mb-1">Details:</p>
                    <pre className="text-xs bg-white bg-opacity-50 p-2 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                      {error.details}
                    </pre>
                  </div>
                )}
                {error.status_code && (
                  <p className="text-xs mt-2 opacity-75">
                    Status Code: {error.status_code}
                    {error.timestamp && ` | Time: ${new Date(error.timestamp).toLocaleString()}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {isTrialUser && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Trial Plan:</strong> {3 - user.daily_count} generations remaining today
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating || !text.trim()}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Voice'}</span>
          </button>

          {audioUrl && (
            <>
              <button
                onClick={handlePlay}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              {!isTrialUser && (
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              )}
            </>
          )}
        </div>

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="w-full"
            controls
          />
        )}

        {isTrialUser && audioData && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a trial version with watermark. Upgrade to remove watermark and enable downloads.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VoiceGenerator



























