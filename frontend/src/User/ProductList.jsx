import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import ProductCard from '../Components/ProductCard';
import SEO from '../Components/SEO';
import { FiSearch, FiX, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { productsAPI, categoriesAPI } from '../services/apiServices';
import { toast } from 'react-hot-toast';
import LoadingSpinner, { SkeletonLoader } from '../Components/LoadingSpinner';
import LoadingErrorHandler from '../Components/LoadingErrorHandler';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categoryId } = useParams();
  
  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState(categoryId ? [categoryId] : []);
  const [priceRange, setPriceRange] = useState({ 
    min: searchParams.get('minPrice') || '', 
    max: searchParams.get('maxPrice') || '' 
  });
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort') || '-createdAt');

  // Refs to track if this is the initial load
  const isInitialLoad = useRef(true);
  const lastFetchParams = useRef(null);

  // Memoize search params to prevent unnecessary re-renders
  const memoizedSearchParams = useMemo(() => ({
    searchTerm: searchParams.get('q') || searchParams.get('search') || '',
    categoryParam: searchParams.get('category'),
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt'
  }), [searchParams]);

  // Memoize the current filter state to prevent unnecessary API calls
  const currentFilters = useMemo(() => ({
    searchTerm,
    selectedCategories: selectedCategories.sort(),
    priceRange,
    sortOrder,
    currentPage,
    categoriesLength: categories.length
  }), [searchTerm, selectedCategories, priceRange, sortOrder, currentPage, categories.length]);

  // Fetch categories with retry
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoriesAPI.getCategories();
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Handle URL parameters for categories - memoized to prevent unnecessary updates
  useEffect(() => {
    if (memoizedSearchParams.categoryParam && categories.length > 0) {
      const categoryIds = memoizedSearchParams.categoryParam.split(',');
      setSelectedCategories(categoryIds);
    }
  }, [memoizedSearchParams.categoryParam, categories.length]);

  // Memoize the fetch products function to prevent recreation
  const fetchProducts = useCallback(async (filters) => {
    // Check if we're already fetching with the same parameters
    const paramsKey = JSON.stringify(filters);
    if (lastFetchParams.current === paramsKey && !isInitialLoad.current) {
      return;
    }
    
    lastFetchParams.current = paramsKey;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: filters.currentPage,
        limit: 12,
        ...(filters.searchTerm && { search: filters.searchTerm }),
        ...(filters.priceRange.min && { minPrice: filters.priceRange.min }),
        ...(filters.priceRange.max && { maxPrice: filters.priceRange.max }),
        ...(filters.sortOrder && { sort: filters.sortOrder })
      };

      // Only add category filter if categories are selected but not all categories
      if (filters.selectedCategories.length > 0 && filters.categoriesLength > 0 && filters.selectedCategories.length < filters.categoriesLength) {
        params.category = filters.selectedCategories.join(',');
      } else if (filters.selectedCategories.length > 0 && filters.categoriesLength === 0) {
        // If categories haven't loaded yet but we have selected categories, still filter
        params.category = filters.selectedCategories.join(',');
      }

      const response = await productsAPI.getProducts(params);

      setProducts(response.data.products);
      setTotalProducts(response.data.pagination?.totalItems || 0);
      
      // Update URL params
      const newSearchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value && key !== 'page' && key !== 'limit') {
          newSearchParams.set(key, value);
        }
      });
      
      // Add category parameter to URL if categories are selected but not all
      if (filters.selectedCategories.length > 0 && filters.categoriesLength > 0 && filters.selectedCategories.length < filters.categoriesLength) {
        newSearchParams.set('category', filters.selectedCategories.join(','));
      }
      
      setSearchParams(newSearchParams);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [setSearchParams]);

  // Fetch products when filters change - with proper dependencies
  useEffect(() => {
    fetchProducts(currentFilters);
  }, [currentFilters, fetchProducts]);

  // Handle category change
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1);
  }, []);

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSortOrder('createdAt');
    setCurrentPage(1);
  }, []);

  // Handle search submit
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setCurrentPage(1);
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(totalProducts / 12);

  // SEO data
  const currentCategory = categories.find(c => c._id === categoryId);
  const pageTitle = categoryId ? 
    `${currentCategory?.name || 'Category'} Products - SkyElectroTech` :
    searchParams.get('q') || searchParams.get('search') ? 
    `Search Results for "${searchParams.get('q') || searchParams.get('search')}" - SkyElectroTech` :
    'All Products - SkyElectroTech';
  
  const pageDescription = categoryId ?
    `Browse our ${currentCategory?.name || 'category'} products. Quality electronics and components at competitive prices.` :
    searchParams.get('q') || searchParams.get('search') ?
    `Search results for "${searchParams.get('q') || searchParams.get('search')}" - Find electronics and components at SkyElectroTech.` :
    'Browse our complete range of electronic components, development boards, and tools. Quality products at competitive prices.';

  return (
    <>
      <SEO 
        title={pageTitle}
        description={pageDescription}
        keywords={`electronics, components, ${currentCategory?.name || 'products'}, SkyElectroTech`}
        category={currentCategory}
        url={`https://skyelectrotech.in${window.location.pathname}${window.location.search}`}
      />
      <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {categoryId ? 
              categories.find(c => c._id === categoryId)?.name + ' Products' || 'Products' 
              : searchParams.get('q') || searchParams.get('search') ? 
              `Search Results for "${searchParams.get('q') || searchParams.get('search')}"` 
              : 'All Products'
            }
          </h1>
          <p className="mt-2 text-gray-600">
            Discover our wide range of electronic components and tools
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <FiFilter className="mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Sidebar */}
          <aside className={`lg:col-span-1 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Reset
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX />
                    </button>
                  )}
                </form>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                {categoriesLoading ? (
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <label key={category._id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => handleCategoryChange(category._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort Order */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                  <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="-createdAt">Latest</option>
                  <option value="createdAt">Oldest</option>
                  <option value="name">Name A-Z</option>
                  <option value="-name">Name Z-A</option>
                  <option value="price">Price Low to High</option>
                  <option value="-price">Price High to Low</option>
                  <option value="-ratings.average">Highest Rated</option>
                  <option value="ratings.average">Lowest Rated</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <LoadingErrorHandler
              loading={loading}
              error={error}
              loadingMessage="Loading products..."
              errorMessage="Failed to load products"
              data={products}
            >
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => {
                          const page = i + 1;
                          const isCurrentPage = page === currentPage;
                          const isNearCurrent = Math.abs(page - currentPage) <= 2;
                          
                          if (isCurrentPage || isNearCurrent || page === 1 || page === totalPages) {
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                  isCurrentPage
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (page === currentPage - 3 || page === currentPage + 3) {
                            return <span key={page} className="px-2 text-gray-500">...</span>;
                          }
                          return null;
                        })}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <FiRefreshCw className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </LoadingErrorHandler>
          </div>
        </div>
      </div>
    </main>
    </>
  );
};

export default ProductList;