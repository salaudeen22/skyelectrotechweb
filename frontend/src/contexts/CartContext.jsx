import React, { createContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../services/apiServices';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null
};

// Cart context
const CartContext = createContext();

export { CartContext };

// Action types
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CART: 'SET_CART',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_CART: 'CLEAR_CART'
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case CART_ACTIONS.SET_CART:
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.totalItems || 0,
        totalPrice: action.payload.totalPrice || 0,
        loading: false,
        error: null
      };
    
    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case CART_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...initialState
      };
    
    default:
      return state;
  }
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [isAuthenticated]);

  // Fetch cart
  const fetchCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const response = await cartAPI.getCart();
      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: response.data.cart
      });
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to fetch cart'
      });
    }
  };

  // Add to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const response = await cartAPI.addToCart(productId, quantity);
      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: response.data.cart
      });
      toast.success('Item added to cart!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update cart item
  const updateCartItem = async (productId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const response = await cartAPI.updateCartItem(productId, quantity);
      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: response.data.cart
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const response = await cartAPI.removeFromCart(productId);
      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: response.data.cart
      });
      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: message
      });
      return { success: false, error: message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    clearError,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
