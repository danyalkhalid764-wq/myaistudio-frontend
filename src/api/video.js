import { API_BASE_URL } from '../config/apiConfig'

/**
 * Generate slideshow video from uploaded images
 * @param {Object} params - Generation parameters
 * @param {File[]} params.files - Array of 2-3 image files
 * @param {number} params.durationSeconds - Duration per image (default: 2)
 * @param {boolean} params.slideEffect - Enable slide effect (default: true)
 * @param {string} params.transition - Transition type: 'none', 'slide', 'kenburns', 'zoom_in', 'zoom_out' (default: 'slide')
 * @returns {Promise<{success: boolean, message: string, video_url: string}>}
 * 
 * Example usage:
 * ```javascript
 * const fileInput = document.querySelector('input[type="file"]')
 * const files = Array.from(fileInput.files).slice(0, 3)
 * 
 * try {
 *   const result = await generateSlideshow({
 *     files,
 *     durationSeconds: 3,
 *     slideEffect: true,
 *     transition: 'slide'
 *   })
 *   console.log('Video URL:', result.video_url)
 * } catch (error) {
 *   console.error('Failed to generate video:', error)
 * }
 * ```
 */
export async function generateSlideshow({ files, durationSeconds = 2, slideEffect = true, transition = 'slide' }) {
  if (!files || files.length < 2 || files.length > 3) {
    throw new Error('Please select 2 to 3 images.')
  }

  // Get token from localStorage - required for authentication
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Authentication required. Please log in.')
  }

  // Create FormData for multipart/form-data request
  const formData = new FormData()
  for (const f of files) {
    formData.append('images', f)
  }
  formData.append('duration_seconds', String(durationSeconds))
  formData.append('slide_effect', String(slideEffect))
  formData.append('transition', String(transition))

  // Make request with Authorization header
  const resp = await fetch(`${API_BASE_URL}/api/video/slideshow`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Note: Don't set Content-Type - browser will set it automatically with boundary for FormData
    },
    body: formData,
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    if (resp.status === 401 || resp.status === 403) {
      // Token expired or invalid - clear it and ask user to login
      localStorage.removeItem('token')
      throw new Error('Session expired. Please log in again.')
    }
    throw new Error(err.detail || 'Failed to generate slideshow')
  }
  
  return await resp.json()
}

/**
 * Get video URL for streaming
 * This function ensures the video URL is properly formatted for the current environment
 * @param {string} videoUrl - Video URL from API response
 * @returns {string} - Properly formatted video URL
 */
export function getVideoStreamUrl(videoUrl) {
  if (!videoUrl) return null
  
  const isLocalDev = API_BASE_URL.includes('localhost:8000')
  
  // If it's already a full URL, return as-is
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    return videoUrl
  }
  
  // If it's a relative URL, prepend the backend URL in production
  if (videoUrl.startsWith('/api/video/stream') || videoUrl.startsWith('/static')) {
    if (!isLocalDev) {
      return `${API_BASE_URL}${videoUrl}`
    }
    // In local dev, Vite proxy will handle it
    return videoUrl
  }
  
  // Fallback: prepend backend URL
  return `${API_BASE_URL}${videoUrl}`
}

/**
 * Example: Play video in a video element
 * 
 * ```javascript
 * import { getVideoStreamUrl } from '../api/video'
 * 
 * const videoElement = document.querySelector('video')
 * const videoUrl = getVideoStreamUrl(result.video_url)
 * 
 * videoElement.src = videoUrl
 * videoElement.load()
 * 
 * videoElement.addEventListener('canplay', () => {
 *   console.log('Video is ready to play')
 *   videoElement.play()
 * })
 * 
 * videoElement.addEventListener('error', (e) => {
 *   console.error('Video error:', e.target.error)
 * })
 * ```
 */
