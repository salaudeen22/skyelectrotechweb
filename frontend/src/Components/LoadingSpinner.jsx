import React from 'react';
import { FiLoader } from 'react-icons/fi';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  type = 'spinner',
  fullScreen = false,
  overlay = false 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const messageSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xl: 'text-lg'
  };

  const SpinnerContent = () => (
    <div className="flex flex-col items-center justify-center">
      {type === 'spinner' && (
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      )}
      {type === 'dots' && (
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`bg-blue-600 rounded-full animate-pulse ${sizeClasses[size]}`}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )}
      {type === 'pulse' && (
        <div className={`bg-blue-600 rounded-full animate-pulse ${sizeClasses[size]}`}></div>
      )}
      {type === 'icon' && (
        <FiLoader className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
      )}
      {message && (
        <p className={`mt-3 text-gray-600 ${messageSizes[size]} text-center`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <SpinnerContent />
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <SpinnerContent />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <SpinnerContent />
    </div>
  );
};

// Skeleton Loading Component
export const SkeletonLoader = ({ 
  type = 'card',
  count = 1,
  className = ''
}) => {
  const CardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm animate-pulse p-4">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm animate-pulse">
      <div className="p-4 border-b">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-3">
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <CardSkeleton />;
      case 'list':
        return <ListSkeleton />;
      case 'table':
        return <TableSkeleton />;
      default:
        return <CardSkeleton />;
    }
  };

  return (
    <div className={`grid gap-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
