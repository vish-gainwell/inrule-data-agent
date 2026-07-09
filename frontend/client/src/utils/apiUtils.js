// src/utils/apiUtils.js
// Utility functions for API calls and response handling

/**
 * Build URL with query parameters
 * @param {string} baseUrl - Base URL
 * @param {Object} params - Query parameters object
 * @returns {string} - URL with encoded query parameters
 */
export const buildUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

/**
 * Safely parse JSON response
 * @param {string} raw - Raw response text
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} - Parsed JSON or fallback
 */
export const parseJsonResponse = (raw, fallback = null) => {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[apiUtils] Failed to parse JSON response', { raw, error: err.message });
    return fallback;
  }
};

/**
 * Extract data from API response with multiple possible structures
 * @param {Object} response - Parsed JSON response
 * @param {Array<string>} dataKeys - Keys to try for data extraction
 * @returns {Array} - Extracted data array
 */
export const extractDataArray = (response, dataKeys = ['data', 'items', 'results']) => {
  if (!response) return [];

  // Try direct array
  if (Array.isArray(response)) return response;

  // Try nested keys
  for (const key of dataKeys) {
    const value = response[key];
    if (Array.isArray(value)) return value;
  }

  // Try data.items pattern
  if (response.data && Array.isArray(response.data.items)) return response.data.items;
  if (response.data && Array.isArray(response.data)) return response.data;

  return [];
};

/**
 * Handle API fetch with common error handling
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - { success, data, error }
 */
export const apiFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const raw = await response.text();
    const data = parseJsonResponse(raw);

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${raw}`);
      error.status = response.status;
      error.response = data;
      throw error;
    }

    return { success: true, data, raw };
  } catch (error) {
    console.error('[apiUtils] API fetch failed', { url, error: error.message });
    return { success: false, data: null, error };
  }
};

/**
 * Create standardized error object from various error sources
 * @param {Error|string|Object} error - Error to standardize
 * @returns {Object} - Standardized error object
 */
export const standardizeError = (error) => {
  if (typeof error === 'string') {
    return { message: error, code: 'UNKNOWN_ERROR' };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      status: error.status,
      stack: error.stack,
    };
  }

  if (typeof error === 'object' && error !== null) {
    return {
      message: error.message || 'Unknown error',
      code: error.code || error.error || 'UNKNOWN_ERROR',
      status: error.status || error.http_status,
      details: error,
    };
  }

  return { message: 'Unknown error occurred', code: 'UNKNOWN_ERROR' };
};