import React from 'react';
import { API_BASE_URL } from '../config/apiConfig';

/**
 * Debug component to display current API configuration
 * Useful for troubleshooting API URL issues
 */
const ApiConfigDisplay = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const isProduction = import.meta.env.PROD;
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">🔗 API Configuration</div>
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">API Base URL:</span>
          <div className="text-green-400 font-mono break-all">{API_BASE_URL}</div>
        </div>
        <div>
          <span className="text-gray-400">VITE_API_URL:</span>
          <div className={envUrl ? 'text-green-400' : 'text-red-400'}>
            {envUrl || 'undefined ❌'}
          </div>
        </div>
        <div>
          <span className="text-gray-400">Environment:</span>
          <div className="text-blue-400">{import.meta.env.MODE}</div>
        </div>
        <div>
          <span className="text-gray-400">Production:</span>
          <div className={isProduction ? 'text-green-400' : 'text-yellow-400'}>
            {isProduction ? 'Yes' : 'No (Dev)'}
          </div>
        </div>
      </div>
      {!envUrl && (
        <div className="mt-2 p-2 bg-red-900 rounded text-red-200 text-xs">
          ⚠️ VITE_API_URL not set! Set it in Netlify environment variables.
        </div>
      )}
    </div>
  );
};

export default ApiConfigDisplay;

