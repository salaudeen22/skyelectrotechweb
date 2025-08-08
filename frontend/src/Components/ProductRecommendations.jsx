import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { recommendationsAPI } from '../services/apiServices';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const ProductRecommendations = ({ 
  type = 'personalized', 
  productId = null, 
  categoryId = null, 
  limit = 8,
  title = null,
  showViewAll = true 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Generate title based on type
  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'recently-viewed':
        return 'Recently Viewed';
      case 'personalized':
        return 'Recommended for You';
      case 'trending':
        return 'Trending Products';
      case 'similar':
        return 'Similar Products';
      case 'category':
        return 'More from This Category';
      default:
        return 'Recommended Products';
    }
  };

  // Generate subtitle based on type
  const getSubtitle = () => {
    switch (type) {
      case 'recently-viewed':
        return 'Products you\'ve recently viewed';
      case 'trending':
        return 'Most popular products based on sales, searches, and user activity';
      case 'similar':
        return 'Products similar to what you\'re viewing';
      default:
        return '';
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;
        
        switch (type) {
          case 'recently-viewed':
            if (!isAuthenticated) {
              setProducts([]);
              setLoading(false);
              return;
            }
            response = await recommendationsAPI.getRecentlyViewed(limit);
            break;
            
          case 'personalized':
            if (!isAuthenticated) {
              // Fallback to trending for non-authenticated users
              response = await recommendationsAPI.getTrendingProducts(limit);
            } else {
              response = await recommendationsAPI.getRecommendations(limit);
            }
            break;
            
          case 'trending':
            response = await recommendationsAPI.getTrendingProducts(limit);
            break;
            
          case 'similar':
            if (!productId) {
              setError('Product ID is required for similar products');
              setLoading(false);
              return;
            }
            response = await recommendationsAPI.getSimilarProducts(productId, limit);
            break;
            
          case 'category':
            if (!categoryId) {
              setError('Category ID is required for category recommendations');
              setLoading(false);
              return;
            }
            if (isAuthenticated) {
              response = await recommendationsAPI.getCategoryRecommendations(categoryId, limit);
            } else {
              // For non-authenticated users, we'll need to implement a fallback
              // For now, we'll show trending products
              response = await recommendationsAPI.getTrendingProducts(limit);
            }
            break;
            
          default:
            response = await recommendationsAPI.getTrendingProducts(limit);
        }

        // Handle different response structures
        let productsArray = [];
        if (response.products) {
          productsArray = response.products;
        } else if (response.data && response.data.products) {
          productsArray = response.data.products;
        }
        
        setProducts(productsArray || []);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.message || 'Failed to load recommendations');
        toast.error('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [type, productId, categoryId, limit, isAuthenticated]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{getTitle()}</h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{getTitle()}</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{getTitle()}</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">
            {type === 'recently-viewed' && !isAuthenticated 
              ? 'Please login to see your recently viewed products'
              : type === 'trending'
              ? 'Popular products will appear here based on sales and user activity'
              : type === 'similar'
              ? 'Similar products will appear here'
              : 'Loading recommendations...'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{getTitle()}</h2>
        {showViewAll && (
          <Link 
            to="/products" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            View All →
          </Link>
        )}
      </div>
      
      {getSubtitle() && (
        <p className="text-sm text-gray-600 mb-6">{getSubtitle()}</p>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product._id} 
            product={product}
            showWishlistButton={true}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;
