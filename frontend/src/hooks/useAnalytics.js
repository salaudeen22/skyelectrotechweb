import { useCallback } from 'react';
import {
  trackPageView,
  trackRegistration,
  trackLogin,
  trackProductView,
  trackAddToCart,
  trackRemoveFromCart,
  trackAddToWishlist,
  trackBeginCheckout,
  trackPurchase,
  trackSearch,
  trackCategoryView,
  trackFormSubmission,
  trackButtonClick,
  trackError,
  trackEngagement,
  trackAdminAction,
  trackUserJourney,
  trackPerformance
} from '../utils/analytics';

export const useAnalytics = () => {
  const trackPage = useCallback((pageTitle, pagePath) => {
    trackPageView(pageTitle, pagePath);
  }, []);

  const trackUserRegistration = useCallback((method = 'email') => {
    trackRegistration(method);
  }, []);

  const trackUserLogin = useCallback((method = 'email') => {
    trackLogin(method);
  }, []);

  const trackProduct = useCallback((product) => {
    trackProductView(product);
  }, []);

  const trackCartAdd = useCallback((product, quantity = 1) => {
    trackAddToCart(product, quantity);
  }, []);

  const trackCartRemove = useCallback((product, quantity = 1) => {
    trackRemoveFromCart(product, quantity);
  }, []);

  const trackWishlistAdd = useCallback((product) => {
    trackAddToWishlist(product);
  }, []);

  const trackCheckout = useCallback((cartItems, totalValue) => {
    trackBeginCheckout(cartItems, totalValue);
  }, []);

  const trackOrderPurchase = useCallback((order) => {
    trackPurchase(order);
  }, []);

  const trackProductSearch = useCallback((searchTerm) => {
    trackSearch(searchTerm);
  }, []);

  const trackCategory = useCallback((categoryName) => {
    trackCategoryView(categoryName);
  }, []);

  const trackForm = useCallback((formName) => {
    trackFormSubmission(formName);
  }, []);

  const trackClick = useCallback((buttonName, location = 'unknown') => {
    trackButtonClick(buttonName, location);
  }, []);

  const trackAppError = useCallback((errorType, errorMessage) => {
    trackError(errorType, errorMessage);
  }, []);

  const trackUserEngagement = useCallback((action, value = null) => {
    trackEngagement(action, value);
  }, []);

  const trackAdmin = useCallback((action, resource) => {
    trackAdminAction(action, resource);
  }, []);

  const trackProductInteraction = useCallback((action, product, additionalData = {}) => {
    trackProductInteraction(action, product, additionalData);
  }, []);

  const trackJourney = useCallback((step, stepNumber, totalSteps) => {
    trackUserJourney(step, stepNumber, totalSteps);
  }, []);

  const trackPerf = useCallback((metricName, value) => {
    trackPerformance(metricName, value);
  }, []);

  return {
    trackPage,
    trackUserRegistration,
    trackUserLogin,
    trackProduct,
    trackCartAdd,
    trackCartRemove,
    trackWishlistAdd,
    trackCheckout,
    trackOrderPurchase,
    trackProductSearch,
    trackCategory,
    trackForm,
    trackClick,
    trackAppError,
    trackUserEngagement,
    trackAdmin,
    trackProductInteraction,
    trackJourney,
    trackPerf
  };
}; 