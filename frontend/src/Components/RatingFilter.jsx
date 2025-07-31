import React from 'react';
import { FaStar } from 'react-icons/fa';

const RatingFilter = ({ filters, onFilterChange, ratingDistribution }) => {
  const totalReviews = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);

  const handleRatingFilter = (rating) => {
    onFilterChange({ rating: filters.rating === rating ? '' : rating });
  };

  const handleSortChange = (sort) => {
    onFilterChange({ sort });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Rating Filters */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Filter by rating:</span>
        <div className="flex space-x-1">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0;
            const isActive = filters.rating === rating.toString();
            
            return (
              <button
                key={rating}
                onClick={() => handleRatingFilter(rating.toString())}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <FaStar className="w-3 h-3 text-yellow-400 fill-current" />
                <span>{rating}</span>
                <span className="text-xs">({count})</span>
              </button>
            );
          })}
        </div>
        {filters.rating && (
          <button
            onClick={() => handleRatingFilter('')}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Sort Options */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <select
          value={filters.sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="-rating">Highest Rating</option>
          <option value="rating">Lowest Rating</option>
          <option value="-isHelpful">Most Helpful</option>
        </select>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-500">
        {filters.rating 
          ? `Showing ${ratingDistribution[filters.rating] || 0} reviews with ${filters.rating} star${filters.rating > 1 ? 's' : ''}`
          : `Showing all ${totalReviews} reviews`
        }
      </div>
    </div>
  );
};

export default RatingFilter; 