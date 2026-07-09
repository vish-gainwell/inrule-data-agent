import { useRef, useCallback } from 'react';

/**
 * Custom hook for cancellable fetch operations.
 * Prevents race conditions by aborting previous requests when a new one starts.
 *
 * @param {Function} fetchFn - The async function to call (e.g., API fetch).
 * @returns {Function} - A wrapped function that handles cancellation.
 */
export const useCancellableFetch = (fetchFn) => {
  const abortControllerRef = useRef(null);

  const cancellableFetch = useCallback(
    async (...args) => {
      // Abort any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new AbortController for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        // Call the fetch function with the abort signal
        const result = await fetchFn(controller.signal, ...args);
        return result;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request was cancelled');
          return null; // Or handle as needed
        }
        throw error;
      } finally {
        // Clear the controller if this request completed
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [fetchFn]
  );

  return cancellableFetch;
};