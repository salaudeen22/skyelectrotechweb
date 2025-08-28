import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FiHeart, FiShoppingCart, FiTrash2, FiGrid, FiList, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../Components/ProductCard';
import { wishlistAPI } from '../services/apiServices';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Add meta tags for SEO
  const pageTitle = "My Wishlist - SkyElectroTech | Save Your Favorite Electronic Components";
  const pageDescription = "Save and organize your favorite electronic components, Arduino boards, PLCs, and automation parts. Create your personalized collection at SkyElectroTech's wishlist.";

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wishlistAPI.getWishlist();
      
      console.log('Wishlist API response:', response);
      
      // Handle the correct backend response structure
      let items = [];
      if (response && response.data && response.data.wishlist && response.data.wishlist.products) {
        items = Array.isArray(response.data.wishlist.products) ? response.data.wishlist.products : [];
      } else if (response && response.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (response && Array.isArray(response)) {
        items = response;
      }
      
      console.log('Processed wishlist items:', items);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError(error.response?.data?.message || 'Failed to load wishlist');
      setWishlistItems([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      // Filter based on the product._id since that's what we're removing
      setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Failed to remove item from wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id, 1);
      console.log('Added to cart:', product.name);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart');
    }
  };

  const clearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await wishlistAPI.clearWishlist();
        setWishlistItems([]);
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        setError('Failed to clear wishlist');
      }
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://sweet-hamster-f11198.netlify.app/wishlist" />
          <link rel="canonical" href="https://sweet-hamster-f11198.netlify.app/wishlist" />
        </Helmet>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
            <div className="animate-pulse">
              <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/2 sm:w-1/4 mb-3 sm:mb-4"></div>
              <div className="h-3 sm:h-4 bg-gray-300 rounded w-2/3 sm:w-1/3 mb-6 sm:mb-8"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 sm:p-4">
                    <div className="h-32 sm:h-48 bg-gray-300 rounded mb-3 sm:mb-4"></div>
                    <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sweet-hamster-f11198.netlify.app/wishlist" />
        <link rel="canonical" href="https://sweet-hamster-f11198.netlify.app/wishlist" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                <FiHeart className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-red-500" />
                <span className="truncate">My Wishlist</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
              </p>
              
              {/* Error Message */}
              {error && (
                <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
            </div>
            
            {wishlistItems.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 sm:p-2 rounded-lg ${
                      viewMode === 'grid' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <FiGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 sm:p-2 rounded-lg ${
                      viewMode === 'list' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <FiList className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Clear Wishlist */}
                <button
                  onClick={clearWishlist}
                  className="flex items-center px-3 sm:px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 font-medium text-sm sm:text-base"
                >
                  <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Clear All</span>
                  <span className="xs:hidden">Clear</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-8 sm:py-16">
            <FiHeart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
              Save items you love to your wishlist and come back to them anytime
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 font-medium text-sm sm:text-base"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* Wishlist Items */
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6'
              : 'space-y-3 sm:space-y-4'
          }>
            {Array.isArray(wishlistItems) && wishlistItems.map((item, index) => (
              viewMode === 'grid' ? (
                <div key={item.product._id || index} className="bg-white rounded-lg shadow-sm group relative">
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.product._id)}
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 p-1.5 sm:p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50"
                  >
                    <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                  </button>

                  <ProductCard 
                    product={item.product}
                    onAddToCart={() => handleAddToCart(item.product)}
                    showWishlistButton={false}
                  />
                  
                  {/* Added Date */}
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <p className="text-xs text-gray-500">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                /* List View */
                <div key={item.product._id || index} className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.images?.[0]?.url || item.product.images?.[0] || 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png'}
                        alt={item.product.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg cursor-pointer"
                        onClick={() => navigate(`/products/${item.product._id}`)}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                        <div className="min-w-0 flex-1">
                          <h3 
                            className="text-base sm:text-lg font-medium text-gray-900 cursor-pointer hover:text-blue-600 truncate"
                            onClick={() => navigate(`/products/${item.product._id}`)}
                          >
                            {item.product.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{item.product.category?.name || 'Uncategorized'}</p>
                          
                          {/* Rating */}
                          {item.product.rating && (
                            <div className="flex items-center mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar
                                    key={i}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                      i < Math.floor(item.product.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              {item.product.reviews && (
                                <span className="text-xs sm:text-sm text-gray-600 ml-1">
                                  ({item.product.reviews})
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-left sm:text-right">
                          <p className="text-lg sm:text-xl font-bold text-gray-900">
                            ₹{item.product.price?.toLocaleString() || '0'}
                          </p>
                          {item.product.originalPrice && (
                            <p className="text-xs sm:text-sm text-gray-500 line-through">
                              ₹{item.product.originalPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 sm:mt-4 space-y-2 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                          <button
                            onClick={() => handleAddToCart(item.product)}
                            className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm w-full sm:w-auto justify-center"
                          >
                            <FiShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Add to Cart
                          </button>
                          
                          <button
                            onClick={() => removeFromWishlist(item.product._id)}
                            className="flex items-center px-3 sm:px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 font-medium text-sm w-full sm:w-auto justify-center"
                          >
                            <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Remove
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center sm:text-right">
                          Added {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {wishlistItems.length > 0 && (
          <div className="mt-8 sm:mt-12 text-center">
            <button
              onClick={() => navigate('/products')}
              className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-700 font-medium text-sm sm:text-base"
            >
              Continue Shopping
            </button>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
