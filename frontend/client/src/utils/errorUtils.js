// src/utils/errorUtils.js
// Utility functions to parse and display backend error messages

/**
 * Parse backend error response and extract meaningful error details
 * Backend returns errors in format:
 * {
 *   "error": "ERROR_CODE",
 *   "message": "Detailed error message",
 *   "app_status": 50352,
 *   "http_status": 503
 * }
 */
export function parseBackendError(rawResponse) {
    try {
        // If it's already an object, use it directly
        const errorData = typeof rawResponse === 'string' 
            ? JSON.parse(rawResponse) 
            : rawResponse;

        // Extract the message - this is the key field from backend
        const message = errorData.message || errorData.error || 'An unexpected error occurred';
        
        return {
            errorCode: errorData.error || 'UNKNOWN_ERROR',
            message: message,
            appStatus: errorData.app_status || null,
            httpStatus: errorData.http_status || null,
            // For display - show the exact message from backend
            displayMessage: message,
        };
    } catch (e) {
        // If JSON parsing fails, return the raw string as message
        const rawMsg = typeof rawResponse === 'string' ? rawResponse : 'Unknown error';
        return {
            errorCode: 'PARSE_ERROR',
            message: rawMsg,
            appStatus: null,
            httpStatus: null,
            displayMessage: rawMsg,
        };
    }
}

/**
 * Format error for display in chat bubble
 * Shows the exact message from backend
 */
export function formatErrorForChat(rawResponse) {
    const parsed = parseBackendError(rawResponse);

    // Return the exact message from backend with minimal formatting
    return {
        ...parsed,
        // Show the exact backend message in chat
        chatMessage: parsed.message,
        // Debug info for console/logs
        debugInfo: {
            errorCode: parsed.errorCode,
            appStatus: parsed.appStatus,
            httpStatus: parsed.httpStatus,
        },
    };
}

/**
 * Check if an error response indicates a retryable error
 */
export function isRetryableError(errorCode) {
    const retryableErrors = [
        'DB_TIMEOUT',
        'DB_UNAVAILABLE', 
        'SERVICE_UNAVAILABLE',
        'MCP_SERVER_ERROR',
        'OPENAI_CONNECTION_FAILED',
        'OPENAI_CONNECTION_ERROR',
        'OPENAI_TIMEOUT',
        'REQUEST_TIMEOUT',
        'GATEWAY_TIMEOUT',
        'RATE_LIMIT_EXCEEDED',
        'TOO_MANY_REQUESTS',
    ];
    return retryableErrors.includes(errorCode);
}
