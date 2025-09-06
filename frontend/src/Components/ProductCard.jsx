import React, { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { wishlistAPI, recommendationsAPI } from '../services/apiServices';
import { toast } from 'react-hot-toast';
import { getPrimaryImage } from '../utils/imageUtils';
import { generateProductUrl } from '../utils/urlHelpers';
import OptimizedImage from './OptimizedImage';

const ProductCard = memo(({ product, showWishlistButton = true }) => {
  const { addToCart, addingToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    // Restrict cart functionality for admin/employee users
    if (user?.role === 'admin' || user?.role === 'employee') {
      toast.error('Cart functionality is only available for regular users');
      return;
    }

    try {
      await addToCart(product._id, 1);
      
      // Track cart interaction for recommendations
      try {
        await recommendationsAPI.trackInteraction(product._id, 'cart_add', {
          quantity: 1,
          location: 'product_card'
        });
      } catch (trackingError) {
        console.error('Error tracking cart interaction:', trackingError);
        // Don't fail the cart operation if tracking fails
      }
      
      // Toast notification is already handled in CartContext
    } catch (err) {
      console.error('Add to cart error:', err);
      // Toast notification is already handled in CartContext
    }
  }, [addToCart, product._id, isAuthenticated, user?.role]);

  const handleAddToWishlist = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    
    // Restrict wishlist functionality for admin/employee users
    if (user?.role === 'admin' || user?.role === 'employee') {
      toast.error('Wishlist functionality is only available for regular users');
      return;
    }
    
    try {
      setIsAddingToWishlist(true);
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(product._id);
        setIsInWishlist(false);
        toast.success('Removed from wishlist!');
      } else {
        await wishlistAPI.addToWishlist(product._id);
        setIsInWishlist(true);
        toast.success('Added to wishlist!');
        
        // Track wishlist interaction for recommendations
        try {
          await recommendationsAPI.trackInteraction(product._id, 'wishlist_add', {
            location: 'product_card'
          });
        } catch (trackingError) {
          console.error('Error tracking wishlist interaction:', trackingError);
          // Don't fail the wishlist operation if tracking fails
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update wishlist');
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  }, [product._id, isAuthenticated, user?.role, isInWishlist]);

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 flex flex-col">
      
      {/* Wishlist Button */}
      {showWishlistButton && isAuthenticated && user?.role === 'user' && (
        <button
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist}
          className="absolute top-3 right-3 z-20 p-2.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50 touch-manipulation cursor-pointer"
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          type="button"
        >
          <FiHeart 
            className={`w-6 h-6 sm:w-5 sm:h-5 ${isAddingToWishlist ? 'text-red-500 animate-pulse' : isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
            aria-hidden="true"
          />
        </button>
      )}

      {/* Product Image Section */}
      <Link 
        to={generateProductUrl(product)} 
        className="block overflow-hidden"
        aria-label={`View details for ${product.name}`}
      >
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <OptimizedImage 
            src={getPrimaryImage(product.images)} 
            alt={`${product.name} - ${product.category?.name || 'Electronics'}`}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
      </Link>
      
      {/* Product Details Section */}
      <div className="p-4 sm:p-5 flex flex-col">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            {product.category?.name || 'Electronics'}
          </p>
          <Link 
            to={generateProductUrl(product)}
            aria-label={`View details for ${product.name}`}
          >
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 mt-2 hover:text-blue-600 transition-colors line-clamp-2" title={product.name}>
              {product.name}
            </h3>
          </Link>
          
          {/* Rating */}
          <div className="mt-2 sm:mt-3 min-h-[20px] sm:min-h-[24px]">
            {product.averageRating > 0 ? (
              <div className="flex items-center" role="img" aria-label={`Rating: ${product.averageRating} out of 5 stars`}>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        i < Math.floor(product.averageRating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">
                  ({product.reviewCount || 0})
                </span>
              </div>
            ) : (
              <div className="text-xs text-gray-400">No ratings yet</div>
            )}
          </div>

          {/* Price */}
          <div className="mt-3 sm:mt-4">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-gray-500 line-through mr-1 sm:mr-2">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-lg sm:text-2xl font-extrabold text-gray-800">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-green-600 ml-1 sm:ml-2 font-semibold">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
              </span>
            )}
          </div>
        </div>
        
        {/* Add to Cart Button - Only show for regular users */}
        {isAuthenticated && user?.role === 'user' && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button 
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full flex items-center justify-center py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300 touch-manipulation cursor-pointer"
              aria-label={`Add ${product.name} to cart`}
              type="button"
            >
              <FiShoppingCart className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        )}
        
        {/* For non-authenticated users, show login prompt */}
        {!isAuthenticated && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link 
              to="/auth/login"
              className="w-full flex items-center justify-center py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-300 touch-manipulation cursor-pointer"
              aria-label="Login to add items to cart"
            >
              <FiShoppingCart className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              Login to Add to Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;