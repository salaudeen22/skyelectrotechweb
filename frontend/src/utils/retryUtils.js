import { useState } from 'react';

// Retry utility for API calls with exponential backoff
export const retryWithBackoff = async (
  fn,
  {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = (error) => {
      // Retry on network errors, 5xx server errors, and rate limiting
      return (
        !error.response || // Network error
        error.response.status >= 500 || // Server error
        error.response.status === 429 // Rate limiting
      );
    }
  } = {}
) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if we've reached max retries or if the error shouldn't be retried
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Hook for managing retry state
export const useRetryState = (initialRetries = 3) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const resetRetry = () => {
    setRetryCount(0);
    setIsRetrying(false);
  };
  
  const incrementRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  const startRetry = () => {
    setIsRetrying(true);
  };
  
  const stopRetry = () => {
    setIsRetrying(false);
  };
  
  return {
    retryCount,
    isRetrying,
    resetRetry,
    incrementRetry,
    startRetry,
    stopRetry,
    hasRetriesLeft: retryCount < initialRetries
  };
};

// Enhanced API call with retry
export const apiCallWithRetry = async (
  apiCall,
  options = {}
) => {
  return retryWithBackoff(apiCall, options);
};

// Custom hook for API calls with retry
export const useApiWithRetry = (apiCall, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const retryState = useRetryState(options.maxRetries || 3);
  
  const execute = async (...args) => {
    setLoading(true);
    setError(null);
    retryState.resetRetry();
    
    try {
      const result = await retryWithBackoff(
        () => apiCall(...args),
        {
          ...options,
          shouldRetry: (error) => {
            retryState.incrementRetry();
            return options.shouldRetry ? options.shouldRetry(error) : true;
          }
        }
      );
      
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    data,
    loading,
    error,
    execute,
    retryState
  };
};
