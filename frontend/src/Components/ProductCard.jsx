import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart, addingToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart(product._id, 1);
      toast.success('Product added to cart!');
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error('Failed to add product to cart');
    }
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    
    // TODO: Implement wishlist functionality
    toast.success('Added to wishlist!');
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 flex flex-col">
      
      {/* Wishlist Button */}
      <button
        onClick={handleAddToWishlist}
        className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50"
      >
        <FiHeart className="h-4 w-4 text-gray-600 hover:text-red-500" />
      </button>

      {/* Stock Badge */}
      {product.stock <= 5 && product.stock > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
          Only {product.stock} left
        </div>
      )}
      
      {product.stock === 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          Out of Stock
        </div>
      )}

      {/* Product Image Section */}
      <Link to={`/product/${product._id}`} className="block overflow-hidden">
        <img 
          src={product.images?.[0] || '/placeholder-image.jpg'} 
          alt={product.name}
          className="w-full h-52 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        />
      </Link>
      
      {/* Product Details Section */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex-grow">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            {product.category?.name || 'Electronics'}
          </p>
          <Link to={`/product/${product._id}`}>
            <h3 className="text-lg font-bold text-gray-900 mt-1 hover:text-blue-600 transition-colors" title={product.name}>
              {product.name}
            </h3>
          </Link>
          
          {/* Rating */}
          {product.averageRating > 0 && (
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-3">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through mr-2">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-2xl font-extrabold text-gray-800">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-green-600 ml-2 font-semibold">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
              </span>
            )}
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addingToCart}
            className={`w-full flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0'
            }`}
          >
            <FiShoppingCart className="mr-2 h-5 w-5" />
            {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;