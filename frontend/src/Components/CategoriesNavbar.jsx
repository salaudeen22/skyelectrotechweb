import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';

const CategoriesNavbar = () => {
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileCategories, setOpenMobileCategories] = useState(new Set());
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const categoryRefs = useRef({});
  const { categories } = useCategories();

  // Helper functions for dropdown behavior
  const handleDropdownEnter = (categoryId) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    
    // Calculate dropdown position
    const categoryElement = categoryRefs.current[categoryId];
    if (categoryElement) {
      const rect = categoryElement.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left
      });
    }
    
    setHoveredCategoryId(categoryId);
  };

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredCategoryId(null);
    }, 150);
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
    <div className="categories-navbar bg-gray-100 border-b border-gray-200 fixed w-full top-16 z-[45]">
      {/* Desktop Categories Bar */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-0.5 py-1.5 overflow-x-auto scrollbar-hide overflow-y-visible">
            {/* All Products Link */}
            <Link
              to="/products"
              className="flex-shrink-0 px-3 py-1.5 text-xs font-normal text-gray-700 hover:text-blue-600 hover:bg-gray-200 rounded transition-colors whitespace-nowrap"
            >
              All Products
            </Link>
            
            {/* Categories with Dropdowns */}
            {categories.map((category) => (
              <div key={category._id} className="relative flex-shrink-0">
                <div
                  ref={el => categoryRefs.current[category._id] = el}
                  onMouseEnter={() => handleDropdownEnter(category._id)}
                  onMouseLeave={handleDropdownLeave}
                  className="relative"
                >
                  <Link
                    to={`/products?category=${category._id}`}
                    className="flex items-center px-3 py-1.5 text-xs font-normal text-gray-700 hover:text-blue-600 hover:bg-gray-200 rounded transition-colors whitespace-nowrap"
                  >
                    <span>{category.name}</span>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <svg className="w-2.5 h-2.5 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Dropdown Portal */}
      {hoveredCategoryId && categories.find(cat => cat._id === hoveredCategoryId)?.subcategories?.length > 0 && (
        <div 
          className="fixed w-56 bg-white rounded-md shadow-xl py-2 z-[9999] border border-gray-200 max-h-80 overflow-y-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
          onMouseEnter={() => handleDropdownEnter(hoveredCategoryId)}
          onMouseLeave={handleDropdownLeave}
        >
          {categories.find(cat => cat._id === hoveredCategoryId)?.subcategories?.map((subcategory) => (
            <Link
              key={subcategory._id}
              to={`/products?category=${subcategory._id}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      )}

      {/* Mobile & Tablet Categories Bar */}
      <div className="md:hidden">
        <div className="px-2 sm:px-4 py-1.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs sm:text-sm font-normal text-gray-700 hover:text-blue-600 hover:bg-gray-200 rounded transition-colors"
          >
            <span>Browse Categories</span>
            <svg 
              className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isMobileMenuOpen && (
            <div className="mt-2 bg-white rounded-md shadow-lg border border-gray-200 max-h-[70vh] overflow-y-auto">
              {/* All Products Link */}
              <Link
                to="/products"
                className="block px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Products
              </Link>
              
              {/* Mobile Categories */}
              {categories.map((category) => (
                <div key={category._id} className="border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/products?category=${category._id}`}
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 truncate"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                    
                    {/* Toggle button for subcategories */}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <button
                        onClick={() => toggleMobileCategory(category._id)}
                        className="flex-shrink-0 px-2 sm:px-3 py-2.5 sm:py-3 text-gray-500 hover:text-gray-700"
                      >
                        <svg 
                          className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${openMobileCategories.has(category._id) ? 'rotate-90' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Mobile Subcategories */}
                  {category.subcategories && 
                   category.subcategories.length > 0 && 
                   openMobileCategories.has(category._id) && (
                    <div className="bg-gray-50">
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory._id}
                          to={`/products?category=${subcategory._id}`}
                          className="block px-6 sm:px-8 py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 hover:text-blue-600 truncate"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesNavbar;