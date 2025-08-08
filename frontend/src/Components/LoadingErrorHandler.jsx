import React from 'react';
import { FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import LoadingSpinner from './LoadingSpinner';

const LoadingErrorHandler = ({
  loading,
  error,
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  onReset,
  children,
  loadingMessage = 'Loading...',
  errorMessage = 'Something went wrong',
  retryMessage = 'Try again',
  showRetryButton = true,
  loadingType = 'spinner',
  loadingSize = 'medium',
  className = '',
  emptyState = null,
  data = null
}) => {
  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <LoadingSpinner
          type={loadingType}
          size={loadingSize}
          message={loadingMessage}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="mb-4">
          <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {retryCount >= maxRetries ? 'Failed to Load' : 'Something went wrong'}
        </h3>
        <p className="text-gray-500 mb-4">
          {retryCount >= maxRetries 
            ? 'We\'re having trouble loading this content. Please try again later.'
            : errorMessage
          }
        </p>
        
        {showRetryButton && retryCount < maxRetries && (
          <div className="space-y-2">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw className="inline mr-2 h-4 w-4" />
              {retryMessage}
            </button>
            {onReset && (
              <button
                onClick={onReset}
                className="block mx-auto px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        )}
        
        {retryCount >= maxRetries && onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (data !== null && (Array.isArray(data) ? data.length === 0 : !data)) {
    return emptyState || (
      <div className={`text-center py-8 ${className}`}>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Found</h3>
        <p className="text-gray-500">There's nothing to display at the moment.</p>
      </div>
    );
  }

  // Success state - render children
  return <div className={className}>{children}</div>;
};

export default LoadingErrorHandler;
