import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiMinus, FiPlus, FiStar, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import { productsAPI } from '../services/apiServices';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useAnalytics } from '../hooks/useAnalytics';
import { toast } from 'react-hot-toast';
import CommentSection from '../Components/CommentSection';
import SEO from '../Components/SEO';
import LoadingErrorHandler from '../Components/LoadingErrorHandler';
import ProductRecommendations from '../Components/ProductRecommendations';
import ShareSheet from '../Components/ShareSheet';
import { buildProductUrl } from '../utils/env';
import { extractIdFromSlug, generateProductUrl } from '../utils/urlHelpers';


// Development-only render counter
const useRenderCounter = () => {
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  useEffect(() => {
    // Development render counter - no console log to reduce noise
  });
  
  return renderCount.current;
};

const ProductDetails = () => {
  // Development-only render counter
  const renderCount = useRenderCounter();
  
  const { id, slugWithId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, addingToCart } = useCart();
  const { trackProduct, trackCartAdd, trackWishlistAdd, trackClick } = useAnalytics();

  // Extract ID from either direct ID param or slug-with-id format
  const productId = useMemo(() => {
    // Add safety checks for undefined params
    if (id && typeof id === 'string' && id.length > 0) return id; // Old format: /products/:id
    if (slugWithId && typeof slugWithId === 'string' && slugWithId.length > 0) {
      // New format: /product/:slugWithId (e.g., "arduino-uno-r3-68b2cd5f712bfd6a19ff7a15")
      return extractIdFromSlug(slugWithId);
    }
    return null;
  }, [id, slugWithId]);

  // Check if we need to redirect from old URL format - only after params are stable
  const shouldRedirect = useMemo(() => {
    return id && !slugWithId && productId && typeof id === 'string';
  }, [id, slugWithId, productId]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Simple fetch function
  const fetchProduct = useCallback(async () => {
    // Don't fetch if no productId or if we're about to redirect
    if (!productId || isRedirecting) {
      if (!productId) {
        setLoading(false);
        setError(new Error('Product not found'));
      }
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
      });
      
      const apiPromise = productsAPI.getProduct(productId);
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      // Check if component is still mounted and not redirecting
      if (isRedirecting) return;
      
      setProduct(response.data.product);
      
      // If we're on the old URL format, redirect to SEO-friendly URL
      if (shouldRedirect && response.data.product && !isRedirecting) {
        setIsRedirecting(true);
        const seoUrl = generateProductUrl(response.data.product);
        // Use replace: true to avoid creating browser history entry
        navigate(seoUrl, { replace: true });
        return; // Exit early to prevent unnecessary processing
      }
    } catch (err) {
      if (!isRedirecting) {
        setError(err);
        console.error('Error fetching product:', err);
      }
    } finally {
      if (!isRedirecting && !shouldRedirect) {
        setLoading(false);
      }
    }
  }, [productId, shouldRedirect, navigate, isRedirecting]);

  // Fetch product on mount and when id changes - with debounce to prevent race conditions
  useEffect(() => {
    // Small delay to ensure router params are stable
    const timeoutId = setTimeout(() => {
      fetchProduct();
    }, 10);
    
    return () => clearTimeout(timeoutId);
  }, [fetchProduct]);

  // Debug logging removed for cleaner console

  // Memoize analytics tracking functions
  const memoizedTrackProduct = useCallback((productData) => {
    if (productData) {
      trackProduct(productData);
    }
  }, [trackProduct]);

  const memoizedTrackCartAdd = useCallback((productData, qty) => {
    trackCartAdd(productData, qty);
  }, [trackCartAdd]);

  const memoizedTrackWishlistAdd = useCallback((productData) => {
    trackWishlistAdd(productData);
  }, [trackWishlistAdd]);

  const memoizedTrackClick = useCallback((buttonName, location) => {
    trackClick(buttonName, location);
  }, [trackClick]);

  // Consolidated useEffect for scroll management and analytics
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Prevent scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Track product view after a small delay to prevent scroll interference
    if (product) {
      const timer = setTimeout(() => {
        memoizedTrackProduct(product);
      }, 100);
      
      return () => clearTimeout(timer);
    }
    
    // Cleanup function
    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, [product, memoizedTrackProduct]);

  // Handle error navigation
  useEffect(() => {
    if (error && loading) { // Only show error if loading is true
      toast.error('Product not found');
      navigate('/products');
    }
  }, [error, loading, navigate]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleAddToCart = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart(product._id, quantity);
      memoizedTrackCartAdd(product, quantity);
      memoizedTrackClick('add_to_cart_button', 'product_details');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  }, [isAuthenticated, product, quantity, addToCart, memoizedTrackCartAdd, memoizedTrackClick]);

  const handleBuyNow = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      return;
    }

    try {
      await addToCart(product._id, quantity);
      navigate('/user/cart');
    } catch (error) {
      console.error('Error in buy now:', error);
      toast.error('Failed to add product to cart');
    }
  }, [isAuthenticated, product, quantity, addToCart, navigate]);

  const handleAddToWishlist = useCallback(() => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    
    // TODO: Implement wishlist functionality
    memoizedTrackWishlistAdd(product);
    memoizedTrackClick('add_to_wishlist_button', 'product_details');
    toast.success('Added to wishlist!');
  }, [isAuthenticated, product, memoizedTrackWishlistAdd, memoizedTrackClick]);

  // Memoize quantity handlers
  const handleQuantityDecrease = useCallback(() => {
    setQuantity(prev => Math.max(1, prev - 1));
  }, []);

  const handleQuantityIncrease = useCallback(() => {
    setQuantity(prev => prev + 1);
  }, []);

  // Memoize image selection handler
  const handleImageSelect = useCallback((index) => {
    setSelectedImage(index);
  }, []);

  // Memoize tab selection handler
  const handleTabSelect = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  // Memoize safe text rendering function
  const renderSafeText = useCallback((text) => {
    if (!text) return 'No information available.';
    
    // Clean and sanitize the text
    const cleanText = text
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    
    return cleanText;
  }, []);

  // Memoize specifications object conversion
  const specificationsObject = useMemo(() => {
    if (!product?.specifications || !Array.isArray(product.specifications)) return {};
    
    const specsObj = {};
    product.specifications.forEach(spec => {
      if (spec.name && spec.value) {
        specsObj[spec.name] = spec.value;
      }
    });
    return specsObj;
  }, [product?.specifications]);

  // Memoize SEO data
  const seoData = useMemo(() => {
    // Use manual SEO keywords if available, otherwise generate from product data
    const generateKeywords = () => {
      if (product?.seoKeywords?.trim()) {
        return `${product.seoKeywords}, SkyElectroTech`;
      }
      return `${product?.name}, ${product?.brand || 'electronics'}, ${product?.category?.name || 'electronics'}, SkyElectroTech`;
    };

    return {
      title: `${product?.name} - SkyElectroTech`,
      description: product?.description,
      keywords: generateKeywords(),
      image: product?.images?.[0]?.url,
      url: product ? `https://skyelectrotech.in${generateProductUrl(product)}` : `https://skyelectrotech.in/products`,
      type: "product",
      product: product,
      category: product?.category
    };
  }, [product]);

  if (shouldRedirect || isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!productId && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Product ID</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <LoadingErrorHandler
      loading={loading}
      error={error}
      retryCount={0} // No retryCount for simple state management
      onRetry={() => fetchProduct()} // Retry logic for simple state
      loadingMessage="Loading product details..."
      errorMessage="Failed to load product details"
      data={product}
    >
      <>
        {/* Development-only render counter display */}
        {import.meta.env.DEV && (
          <div style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            background: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            padding: '5px 10px', 
            borderRadius: '5px', 
            fontSize: '12px',
            zIndex: 9999 
          }}>
            Renders: {renderCount}
          </div>
        )}
        
        <SEO {...seoData} />
        <div className="min-h-screen bg-gray-50" style={{ scrollBehavior: 'auto' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-4 sm:mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-xs sm:text-sm text-gray-700 hover:text-blue-600"
              >
                Home
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <button
                  onClick={() => navigate('/products')}
                  className="text-xs sm:text-sm text-gray-700 hover:text-blue-600"
                >
                  Products
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <span className="text-xs sm:text-sm text-gray-500 truncate max-w-32 sm:max-w-none">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
          {/* Product Images */}
          <div className="space-y-3 sm:space-y-4">
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={product.images?.[selectedImage]?.url || product.images?.[selectedImage] || 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png';
                }}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={image._id || index}
                    onClick={() => handleImageSelect(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.url || image || 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png'}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">{product.category?.name}</p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
              
              {/* Rating */}
              {product.averageRating > 0 && (
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          i < Math.floor(product.averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 ml-2">
                    ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg sm:text-xl text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs sm:text-sm font-medium px-2 py-1 rounded">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Inclusive of all taxes</p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleQuantityDecrease}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="text-base sm:text-lg font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={handleQuantityIncrease}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 sm:py-3 px-6 rounded-lg text-base sm:text-base font-medium transition-colors touch-manipulation"
                >
                  Buy Now
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 py-3 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-sm font-medium transition-colors disabled:opacity-50 touch-manipulation"
                  >
                    <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleAddToWishlist}
                    className="flex items-center justify-center border border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-900 py-3 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-sm font-medium transition-colors touch-manipulation"
                  >
                    <FiHeart className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    Wishlist
                  </button>
                </div>
                {/* Share sheet trigger is floating; nothing inline here */}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 py-4 sm:py-6 border-t border-gray-200">
              <div className="text-center">
                <FiTruck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-gray-600">Fast Delivery</p>
              </div>
              <div className="text-center">
                <FiShield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-gray-600">1 Year Warranty</p>
              </div>
              <div className="text-center">
                <FiRefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-gray-600">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto scrollbar-hide px-4 sm:px-0">
              {[
                { id: 'description', name: 'Description' },
                { id: 'specifications', name: 'Specifications' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabSelect(tab.id)}
                  className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm sm:text-base whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <div 
                  className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: renderSafeText(product.description || 'No description available for this product.') 
                  }}
                />
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-3 sm:space-y-4">
                {(() => {
                  const hasSpecs = Object.keys(specificationsObject).length > 0;
                  
                  return hasSpecs ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {Object.entries(specificationsObject).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize">
                            {renderSafeText(key)}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-600">
                            {renderSafeText(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">No specifications available for this product.</p>
                  );
                })()}
              </div>
            )}

          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm mt-6 sm:mt-8">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Customer Reviews</h2>
            <CommentSection productId={product._id} />
          </div>
        </div>

        {/* Floating Share Sheet */}
        <ShareSheet
          title={`${product.name} - SkyElectroTech`}
          description={product.description}
          image={product.images?.[0]?.url}
          url={buildProductUrl(product._id)}
        />

        {/* Product Recommendations */}
        <div className="mt-8">
          {/* Similar Products */}
          <ProductRecommendations 
            type="similar"
            productId={product._id}
            limit={4}
            title="Similar Products"
            showViewAll={false}
          />
        </div>
      </div>
    </div>
      </>
    </LoadingErrorHandler>
  );
};

export default ProductDetails;
