import React, { createContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../services/apiServices';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null
};

// Wishlist context
const WishlistContext = createContext();

export { WishlistContext };

// Wishlist Provider Component
export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(initialState.items);
  const [loading, setLoading] = useState(initialState.loading);
  const [error, setError] = useState(initialState.error);
  const { isAuthenticated, user } = useAuth();

  // Load wishlist when user is authenticated and is a regular user
  useEffect(() => {
    if (isAuthenticated && user?.role === 'user') {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, user?.role]);

  // Fetch wishlist
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await wishlistAPI.getWishlist();
      
      // Handle the correct backend response structure
      let items = [];
      if (response?.data?.wishlist?.products) {
        items = Array.isArray(response.data.wishlist.products) ? response.data.wishlist.products : [];
      } else if (response?.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response)) {
        items = response;
      }
      
      setWishlistItems(items);
    } catch (error) {
      console.error('Wishlist fetch error:', error);
      setError(error.response?.data?.message || 'Failed to fetch wishlist');
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if a product is in the wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => {
      // Handle both direct product objects and nested product structure
      const id = item.product?._id || item._id;
      return id === productId;
    });
  }, [wishlistItems]);

  // Add to wishlist
  const addToWishlist = async (productId) => {
    try {
      const response = await wishlistAPI.addToWishlist(productId);
      
      // Refresh the wishlist to get the updated data
      await fetchWishlist();
      
      toast.success('Added to wishlist!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to wishlist';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      
      // Update local state immediately for better UX
      setWishlistItems(prev => prev.filter(item => {
        const id = item.product?._id || item._id;
        return id !== productId;
      }));
      
      toast.success('Removed from wishlist!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from wishlist';
      setError(message);
      toast.error(message);
      // Refresh wishlist on error to sync with server state
      await fetchWishlist();
      return { success: false, error: message };
    }
  };

  // Toggle wishlist item
  const toggleWishlistItem = async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    try {
      await wishlistAPI.clearWishlist();
      setWishlistItems([]);
      toast.success('Wishlist cleared!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear wishlist';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Context value
  const value = {
    items: wishlistItems,
    loading,
    error,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlistItem,
    clearWishlist,
    fetchWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};