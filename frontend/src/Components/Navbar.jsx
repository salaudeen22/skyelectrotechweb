import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import { useCategories } from '../hooks/useCategories';
import { IoCartOutline } from 'react-icons/io5';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [openMobileCategories, setOpenMobileCategories] = useState(new Set());
  const { user, logout } = useContext(AuthContext);
  const { items: cartItems, totalItems } = useContext(CartContext);
  const { categories } = useCategories();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const resetMobileStates = () => {
    setIsMenuOpen(false);
    setIsMobileProductsOpen(false);
    setOpenMobileCategories(new Set());
  };

  // Helper functions for dropdown behavior
  const handleDropdownEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setIsProductsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => {
      setIsProductsDropdownOpen(false);
      setHoveredCategoryId(null);
    }, 150); // Small delay to allow mouse movement
    setDropdownTimeout(timeout);
  };

  const handleCategoryEnter = (categoryId) => {
    setHoveredCategoryId(categoryId);
  };

  const handleCategoryLeave = () => {
    // Don't immediately hide subcategory, let the main dropdown handle it
  };

  const toggleMobileCategory = (categoryId) => {
    setOpenMobileCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const cartItemCount = totalItems || cartItems?.length || 0;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('nav')) {
        setIsMenuOpen(false);
        setIsMobileProductsOpen(false);
        setOpenMobileCategories(new Set()); // Reset expanded categories
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <img 
                src="https://i.postimg.cc/brZN4ngb/Sky-Logo-Only.png" 
                alt="SkyElectroTech" 
                className="h-12 w-24 object-contain"
              />
            
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            
            {/* Products with Categories Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              >
                Products
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProductsDropdownOpen && (
                <div 
                  className="absolute left-0 mt-1 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  {/* All Products Link */}
                  <Link
                    to="/products"
                    className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                  >
                    All Products
                  </Link>
                  
                  {/* Divider */}
                  {categories.length > 0 && (
                    <div className="border-t border-gray-200 my-1"></div>
                  )}
                  
                  {/* Categories */}
                  {categories.map((category) => (
                    <div key={category._id} className="relative">
                      <div
                        onMouseEnter={() => handleCategoryEnter(category._id)}
                        onMouseLeave={handleCategoryLeave}
                        className="relative"
                      >
                        <Link
                          to={`/products?category=${category.slug}`}
                          className="flex items-center justify-between px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <span>{category.name}</span>
                          {category.subcategories && category.subcategories.length > 0 && (
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </Link>
                        
                        {/* Subcategories Dropdown */}
                        {category.subcategories && 
                         category.subcategories.length > 0 && 
                         hoveredCategoryId === category._id && (
                          <div 
                            className="absolute left-full top-0 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                            onMouseEnter={() => handleCategoryEnter(category._id)}
                            onMouseLeave={handleCategoryLeave}
                          >
                            {category.subcategories.map((subcategory) => (
                              <Link
                                key={subcategory._id}
                                to={`/products?category=${subcategory.slug}`}
                                className="block px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                              >
                                {subcategory.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {user ? (
              <>
                {/* Cart Icon - Only show for regular users */}
                {user.role === 'user' && (
                  <Link 
                    to="/user/cart" 
                    className="relative text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                  >
                    <IoCartOutline className="w-6 h-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Admin/Employee Dashboard Link */}
                {(user.role === 'admin' || user.role === 'employee') && (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <span className="mr-2">Welcome, {user.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      {/* User-specific links */}
                      {user.role === 'user' && (
                        <>
                          <Link
                            to="/user/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Profile
                          </Link>
                          <Link
                            to="/user/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Order History
                          </Link>
                        </>
                      )}
                      
                      {/* Admin/Employee links */}
                      {(user.role === 'admin' || user.role === 'employee') && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/auth/login" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/auth/register" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Cart Icon for Mobile - Only show for regular users */}
            {user && user.role === 'user' && (
              <Link 
                to="/user/cart" 
                className="relative text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors"
              >
                <IoCartOutline className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
            )}
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-2 rounded-md transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t max-h-[80vh] overflow-y-auto">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              {/* Mobile Products Dropdown */}
              <div className="border-b border-gray-200 pb-2 mb-2">
                <button
                  onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  <span>Products</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${isMobileProductsOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isMobileProductsOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    {/* All Products Link */}
                    <Link
                      to="/products"
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      onClick={resetMobileStates}
                    >
                      All Products
                    </Link>
                    
                    {/* Categories for Mobile */}
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <div key={category._id} className="border-l-2 border-gray-200 ml-2">
                          <div className="flex items-center justify-between">
                            <Link
                              to={`/products?category=${category.slug}`}
                              className="flex-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                              onClick={resetMobileStates}
                            >
                              {category.name}
                            </Link>
                            
                            {/* Toggle button for subcategories */}
                            {category.subcategories && category.subcategories.length > 0 && (
                              <button
                                onClick={() => toggleMobileCategory(category._id)}
                                className="px-2 py-2 text-gray-500 hover:text-gray-700"
                              >
                                <svg 
                                  className={`w-4 h-4 transition-transform ${openMobileCategories.has(category._id) ? 'rotate-90' : ''}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            )}
                          </div>
                          
                          {/* Mobile Subcategories - Only show when expanded */}
                          {category.subcategories && 
                           category.subcategories.length > 0 && 
                           openMobileCategories.has(category._id) && (
                            <div className="ml-4 mt-1 space-y-1">
                              {category.subcategories.map((subcategory) => (
                                <div key={subcategory._id}>
                                  <Link
                                    to={`/products?category=${subcategory.slug}`}
                                    className="block px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                                    onClick={resetMobileStates}
                                  >
                                    • {subcategory.name}
                                  </Link>
                                  
                                  {/* Sub-subcategories (if they exist) */}
                                  {subcategory.subcategories && subcategory.subcategories.length > 0 && (
                                    <div className="ml-4 mt-1">
                                      {subcategory.subcategories.map((subSubcategory) => (
                                        <Link
                                          key={subSubcategory._id}
                                          to={`/products?category=${subSubcategory.slug}`}
                                          className="block px-3 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                                          onClick={resetMobileStates}
                                        >
                                          ◦ {subSubcategory.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Loading categories...
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {user ? (
                <>
                  {/* User-specific mobile links */}
                  {user.role === 'user' && (
                    <>
                      <Link
                        to="/user/cart"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        onClick={resetMobileStates}
                      >
                        Cart ({cartItemCount})
                      </Link>
                      <Link
                        to="/user/profile"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        onClick={resetMobileStates}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/user/orders"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        onClick={resetMobileStates}
                      >
                        Order History
                      </Link>
                    </>
                  )}
                  
                  {/* Admin/Employee mobile links */}
                  {(user.role === 'admin' || user.role === 'employee') && (
                    <Link
                      to="/admin"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      onClick={resetMobileStates}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      resetMobileStates();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    onClick={resetMobileStates}
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                    onClick={resetMobileStates}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
