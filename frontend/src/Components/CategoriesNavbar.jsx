import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { FiChevronDown, FiChevronRight, FiMenu, FiX } from 'react-icons/fi';

const CategoriesNavbar = () => {
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileCategories, setOpenMobileCategories] = useState(new Set());
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const categoryRefs = useRef({});
  const { categories } = useCategories();
  const location = useLocation();

  // Get active category from URL
  const getActiveCategory = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('category');
  };

  // Check if category or its subcategory is active
  const isCategoryActive = (category) => {
    const activeCategory = getActiveCategory();
    if (!activeCategory) return false;
    
    // Check if main category is active
    if (category._id === activeCategory) return true;
    
    // Check if any subcategory is active
    return category.subcategories?.some(sub => sub._id === activeCategory) || false;
  };

  // Helper functions for dropdown behavior
  const handleDropdownEnter = (categoryId) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    
    // Calculate dropdown position with better positioning
    const categoryElement = categoryRefs.current[categoryId];
    if (categoryElement) {
      const rect = categoryElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 280; // Estimated dropdown width
      
      let leftPosition = rect.left;
      
      // Adjust position if dropdown would go off-screen
      if (leftPosition + dropdownWidth > viewportWidth) {
        leftPosition = viewportWidth - dropdownWidth - 16; // 16px padding
      }
      
      setDropdownPosition({
        top: rect.bottom + 2,
        left: Math.max(16, leftPosition) // Minimum 16px from left edge
      });
    }
    
    setHoveredCategoryId(categoryId);
  };

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredCategoryId(null);
    }, 200);
    setDropdownTimeout(timeout);
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      if (isMobileMenuOpen && !event.target.closest('.categories-navbar')) {
        setIsMobileMenuOpen(false);
        setOpenMobileCategories(new Set());
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className={`categories-navbar fixed w-full top-16 z-[45] transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-lg border-b border-gray-200' 
        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100'
    }`}>
      {/* Desktop Categories Bar */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-0.5 py-2 overflow-x-auto scrollbar-hide overflow-y-visible">
            {/* Categories with Dropdowns */}
            {categories.map((category) => {
              const isActive = isCategoryActive(category);
              return (
                <div key={category._id} className="relative flex-shrink-0">
                  <div
                    ref={el => categoryRefs.current[category._id] = el}
                    onMouseEnter={() => handleDropdownEnter(category._id)}
                    onMouseLeave={handleDropdownLeave}
                    className="relative"
                  >
                    <Link
                      to={`/products?category=${category._id}`}
                      className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <span>{category.name}</span>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <FiChevronDown className={`w-3 h-3 ml-1.5 transition-transform duration-200 ${
                          hoveredCategoryId === category._id ? 'rotate-180' : ''
                        } ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Dropdown Portal */}
      {hoveredCategoryId && categories.find(cat => cat._id === hoveredCategoryId)?.subcategories?.length > 0 && (
        <div 
          className="fixed w-72 bg-white rounded-xl shadow-2xl py-3 z-[9999] border border-gray-100 max-h-96 overflow-y-auto backdrop-blur-sm"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            animation: 'fadeInDown 0.2s ease-out'
          }}
          onMouseEnter={() => handleDropdownEnter(hoveredCategoryId)}
          onMouseLeave={handleDropdownLeave}
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900">
              {categories.find(cat => cat._id === hoveredCategoryId)?.name} Categories
            </h4>
          </div>
          <div className="py-1">
            {categories.find(cat => cat._id === hoveredCategoryId)?.subcategories?.map((subcategory) => (
              <Link
                key={subcategory._id}
                to={`/products?category=${subcategory._id}`}
                className={`flex items-center justify-between px-4 py-3 text-sm transition-all duration-150 hover:bg-blue-50 hover:text-blue-700 group ${
                  getActiveCategory() === subcategory._id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="font-medium">{subcategory.name}</span>
                <FiChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Mobile & Tablet Categories Bar */}
      <div className="md:hidden">
        <div className="px-3 py-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              isMobileMenuOpen 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 shadow-sm border border-gray-200'
            }`}
          >
            <div className="flex items-center">
              <span>Browse Categories</span>
            </div>
            {isMobileMenuOpen ? (
              <FiX className="w-5 h-5" />
            ) : (
              <FiChevronDown className="w-5 h-5" />
            )}
          </button>
          
          {isMobileMenuOpen && (
            <div className="mt-3 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[70vh] overflow-y-auto">
              {/* Mobile Categories */}
              {categories.map((category) => {
                const isActive = isCategoryActive(category);
                return (
                  <div key={category._id} className="border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <Link
                        to={`/products?category=${category._id}`}
                        className={`flex-1 px-4 py-4 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                      
                      {/* Toggle button for subcategories */}
                      {category.subcategories && category.subcategories.length > 0 && (
                        <button
                          onClick={() => toggleMobileCategory(category._id)}
                          className="flex-shrink-0 p-4 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <FiChevronRight className={`w-5 h-5 transition-transform duration-200 ${
                            openMobileCategories.has(category._id) ? 'rotate-90' : ''
                          }`} />
                        </button>
                      )}
                    </div>
                    
                    {/* Mobile Subcategories */}
                    {category.subcategories && 
                     category.subcategories.length > 0 && 
                     openMobileCategories.has(category._id) && (
                      <div className="bg-gradient-to-r from-blue-25 to-indigo-25 border-t border-gray-100">
                        {category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory._id}
                            to={`/products?category=${subcategory._id}`}
                            className={`block px-8 py-3 text-sm font-medium transition-colors ${
                              getActiveCategory() === subcategory._id 
                                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
                                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesNavbar;