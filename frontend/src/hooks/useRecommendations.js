import { useState, useEffect, useCallback } from 'react';
import { recommendationsAPI } from '../services/apiServices';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

export const useRecommendations = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState({
    recentlyViewed: false,
    personalized: false,
    trending: false
  });
  const [error, setError] = useState({
    recentlyViewed: null,
    personalized: null,
    trending: null
  });

  const { isAuthenticated } = useAuth();

  // Fetch recently viewed products
  const fetchRecentlyViewed = useCallback(async (limit = 8) => {
    if (!isAuthenticated) {
      setRecentlyViewed([]);
      return;
    }

    try {
      setLoading(prev => ({ ...prev, recentlyViewed: true }));
      setError(prev => ({ ...prev, recentlyViewed: null }));
      
      const response = await recommendationsAPI.getRecentlyViewed(limit);
      setRecentlyViewed(response.products || []);
    } catch (err) {
      console.error('Error fetching recently viewed:', err);
      setError(prev => ({ 
        ...prev, 
        recentlyViewed: err.message || 'Failed to load recently viewed products' 
      }));
      toast.error('Failed to load recently viewed products');
    } finally {
      setLoading(prev => ({ ...prev, recentlyViewed: false }));
    }
  }, [isAuthenticated]);

  // Fetch personalized recommendations
  const fetchPersonalizedRecommendations = useCallback(async (limit = 8) => {
    try {
      setLoading(prev => ({ ...prev, personalized: true }));
      setError(prev => ({ ...prev, personalized: null }));
      
      let response;
      if (isAuthenticated) {
        response = await recommendationsAPI.getRecommendations(limit);
      } else {
        // Fallback to trending for non-authenticated users
        response = await recommendationsAPI.getTrendingProducts(limit);
      }
      
      setPersonalizedRecommendations(response.products || []);
    } catch (err) {
      console.error('❌ Error fetching personalized recommendations:', err);
      setError(prev => ({ 
        ...prev, 
        personalized: err.message || 'Failed to load recommendations' 
      }));
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(prev => ({ ...prev, personalized: false }));
    }
  }, [isAuthenticated]);

  // Fetch trending products
  const fetchTrendingProducts = useCallback(async (limit = 8) => {
    try {
      setLoading(prev => ({ ...prev, trending: true }));
      setError(prev => ({ ...prev, trending: null }));
      
      console.log('🔥 Fetching trending products...');
      const response = await recommendationsAPI.getTrendingProducts(limit);
      console.log('📊 Trending products response:', response);
      setTrendingProducts(response.products || []);
      console.log('✅ Set trending products:', response.products?.length || 0, 'products');
    } catch (err) {
      console.error('❌ Error fetching trending products:', err);
      setError(prev => ({ 
        ...prev, 
        trending: err.message || 'Failed to load trending products' 
      }));
      toast.error('Failed to load trending products');
    } finally {
      setLoading(prev => ({ ...prev, trending: false }));
    }
  }, []);

  // Track product view
  const trackProductView = useCallback(async (productId) => {
    if (!isAuthenticated) return;

    try {
      await recommendationsAPI.trackProductView(productId);
    } catch (err) {
      console.error('Error tracking product view:', err);
      // Don't show toast for tracking errors as they shouldn't affect UX
    }
  }, [isAuthenticated]);

  // Track product interaction
  const trackInteraction = useCallback(async (productId, action, metadata = {}) => {
    if (!isAuthenticated) return;

    try {
      await recommendationsAPI.trackInteraction(productId, action, metadata);
    } catch (err) {
      console.error('Error tracking interaction:', err);
      // Don't show toast for tracking errors as they shouldn't affect UX
    }
  }, [isAuthenticated]);

  // Get similar products
  const getSimilarProducts = useCallback(async (productId, limit = 8) => {
    try {
      const response = await recommendationsAPI.getSimilarProducts(productId, limit);
      return response.products || [];
    } catch (err) {
      console.error('Error fetching similar products:', err);
      toast.error('Failed to load similar products');
      return [];
    }
  }, []);

  // Get category recommendations
  const getCategoryRecommendations = useCallback(async (categoryId, limit = 8) => {
    try {
      if (isAuthenticated) {
        const response = await recommendationsAPI.getCategoryRecommendations(categoryId, limit);
        return response.products || [];
      } else {
        // Fallback to trending for non-authenticated users
        const response = await recommendationsAPI.getTrendingProducts(limit);
        return response.products || [];
      }
    } catch (err) {
      console.error('Error fetching category recommendations:', err);
      toast.error('Failed to load category recommendations');
      return [];
    }
  }, [isAuthenticated]);

  // Refresh all recommendations
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchRecentlyViewed(),
      fetchPersonalizedRecommendations(),
      fetchTrendingProducts()
    ]);
  }, [fetchRecentlyViewed, fetchPersonalizedRecommendations, fetchTrendingProducts]);

  // Initialize data on mount
  useEffect(() => {
    fetchTrendingProducts(); // Always fetch trending products
    
    if (isAuthenticated) {
      fetchRecentlyViewed();
    }
  }, [isAuthenticated, fetchRecentlyViewed, fetchTrendingProducts]);

  return {
    // Data
    recentlyViewed,
    personalizedRecommendations,
    trendingProducts,
    
    // Loading states
    loading,
    
    // Error states
    error,
    
    // Actions
    fetchRecentlyViewed,
    fetchPersonalizedRecommendations,
    fetchTrendingProducts,
    trackProductView,
    trackInteraction,
    getSimilarProducts,
    getCategoryRecommendations,
    refreshAll
  };
};
