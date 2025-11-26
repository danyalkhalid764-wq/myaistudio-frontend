/**
 * API Configuration
 * 
 * This file centralizes API URL configuration.
 * It reads from VITE_API_URL environment variable at build time.
 * 
 * For production: Set VITE_API_URL in Netlify environment variables
 * For local dev: Defaults to http://localhost:8000
 */

// Get API URL from environment variable (set at build time)
const getApiUrl = () => {
  // Check if VITE_API_URL is set
  const envUrl = import.meta.env.VITE_API_URL;

  // If set, use it
  if (envUrl) {
    return envUrl;
  }

  // Fallback to localhost for local development
  return 'http://localhost:8000';
};

// Export the API base URL
export const API_BASE_URL = getApiUrl();

// Binance ID for subscription payments
export const BINANCE_ID = import.meta.env.VITE_BINANCE_ID || "zjkA1hqrwJwAALTbaQZc40gbUBqTvDuXi1Jmq1aqDEMQIzjlfAJgWdLBID42nbzg";

// Debug: Log the API URL in production
if (import.meta.env.PROD) {
  console.log('🔗 API Configuration:');
  console.log('   API Base URL:', API_BASE_URL);
  console.log('   VITE_API_URL env var:', import.meta.env.VITE_API_URL || 'undefined');
  console.log('   Environment:', import.meta.env.MODE);
}

// Helper function to get full API URL for an endpoint
export const getApiEndpoint = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Export configuration object
export const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      me: '/auth/me',
    },
    api: {
      generateVoice: '/api/generate-voice',
      history: '/api/history',
      plan: '/api/plan',
    },
    payment: {
      create: '/api/payment/create',
      history: '/api/payment/history',
      upgrade: '/api/payment/upgrade',
    },
    video: {
      slideshow: '/api/video/slideshow',
    },
  },
};

