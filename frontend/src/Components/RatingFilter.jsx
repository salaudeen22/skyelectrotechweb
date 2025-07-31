import React from 'react';
import { FaStar, FaFilter, FaSort, FaTimes } from 'react-icons/fa';

const RatingFilter = ({ filters, onFilterChange, ratingDistribution }) => {
  const totalReviews = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);

  const handleRatingFilter = (rating) => {
    onFilterChange({ rating: filters.rating === rating ? '' : rating });
  };

  const handleSortChange = (sort) => {
    onFilterChange({ sort });
  };

  return (
    <div className="space-y-4">
      {/* Rating Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FaFilter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Filter by Rating</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0;
            const isActive = filters.rating === rating.toString();
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <button
                key={rating}
                onClick={() => handleRatingFilter(rating.toString())}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-1">
                  <FaStar className={`w-3 h-3 ${
                    isActive ? 'text-yellow-200' : 'text-yellow-400 fill-current'
                  }`} />
                  <span>{rating}</span>
                </div>
                <span className="text-xs opacity-75">({count})</span>
                {!isActive && percentage > 0 && (
                  <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                )}
              </button>
            );
          })}
          
          {filters.rating && (
            <button
              onClick={() => handleRatingFilter('')}
              className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FaTimes className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Sort Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FaSort className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Sort by</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filters.sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-rating">Highest Rating</option>
            <option value="rating">Lowest Rating</option>
            <option value="-isHelpful">Most Helpful</option>
          </select>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">Results:</span>
            <span className="text-sm font-semibold text-gray-900">
              {filters.rating 
                ? `${ratingDistribution[filters.rating] || 0} reviews with ${filters.rating} star${filters.rating > 1 ? 's' : ''}`
                : `${totalReviews} total reviews`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.rating || filters.sort !== '-createdAt') && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-800">Active filters:</span>
          
          {filters.rating && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
              <FaStar className="w-2 h-2 text-yellow-500 fill-current" />
              {filters.rating} stars
            </span>
          )}
          
          {filters.sort !== '-createdAt' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
              <FaSort className="w-2 h-2" />
              {filters.sort === 'createdAt' && 'Oldest first'}
              {filters.sort === '-rating' && 'Highest rating'}
              {filters.sort === 'rating' && 'Lowest rating'}
              {filters.sort === '-isHelpful' && 'Most helpful'}
            </span>
          )}
          
          <button
            onClick={() => onFilterChange({ rating: '', sort: '-createdAt' })}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default RatingFilter; 