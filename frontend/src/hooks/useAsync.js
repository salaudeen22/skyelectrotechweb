import { useState, useCallback, useEffect, useRef } from 'react';
import { retryWithBackoff } from '../utils/retryUtils';

export const useAsync = (asyncFunction, options = {}) => {
  const {
    immediate = true,
    retry: shouldRetry = true,
    maxRetries = 3,
    dependencies = []
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  const isExecutingRef = useRef(false);

  const execute = useCallback(async (...args) => {
    if (!isMountedRef.current || isExecutingRef.current) return;
    
    isExecutingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (shouldRetry) {
        result = await retryWithBackoff(
          () => asyncFunction(...args),
          {
            maxRetries,
            shouldRetry: () => {
              if (isMountedRef.current) {
                setRetryCount(prev => prev + 1);
              }
              return true;
            }
          }
        );
      } else {
        result = await asyncFunction(...args);
      }
      
      if (isMountedRef.current) {
        setData(result);
        setRetryCount(0);
      }
      return result;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isExecutingRef.current = false;
    }
  }, [asyncFunction, shouldRetry, maxRetries]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    setRetryCount(0);
    isExecutingRef.current = false;
  }, []);

  const retry = useCallback(() => {
    if (error && !isExecutingRef.current) {
      execute();
    }
  }, [execute, error]);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (immediate && !isExecutingRef.current) {
      // Reset state when dependencies change
      setData(null);
      setError(null);
      setRetryCount(0);
      execute();
    }
  }, [execute, immediate, ...dependencies]);

  return {
    data,
    loading,
    error,
    retryCount,
    execute,
    reset,
    retry
  };
};

export const useAsyncWithCache = (asyncFunction, cacheKey, options = {}) => {
  const [cache, setCache] = useState(new Map());
  
  const executeWithCache = useCallback(async (...args) => {
    const key = typeof cacheKey === 'function' ? cacheKey(...args) : cacheKey;
    
    // Check cache first
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    // Execute and cache result
    const result = await asyncFunction(...args);
    setCache(prev => new Map(prev).set(key, result));
    
    return result;
  }, [asyncFunction, cacheKey, cache]);

  return useAsync(executeWithCache, options);
};
