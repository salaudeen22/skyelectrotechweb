// Google Tag Manager (GTM) utility functions for tracking user interactions

// Initialize GTM dataLayer
export const initGTM = () => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
  }
};

// Push events to dataLayer
export const pushToDataLayer = (event, data = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: event,
      ...data
    });
  }
};

// Track page views
export const trackPageView = (pageTitle, pagePath) => {
  pushToDataLayer('page_view', {
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: pagePath
  });
};

// Track user registration
export const trackRegistration = (method = 'email') => {
  pushToDataLayer('sign_up', {
    method: method,
    event_category: 'engagement',
    event_label: 'user_registration'
  });
};

// Track user login
export const trackLogin = (method = 'email') => {
  pushToDataLayer('login', {
    method: method,
    event_category: 'engagement',
    event_label: 'user_login'
  });
};

// Track product views
export const trackProductView = (product) => {
  pushToDataLayer('view_item', {
    currency: 'INR',
    value: product.price,
    items: [{
      item_id: product._id,
      item_name: product.name,
      item_category: product.category?.name || 'Uncategorized',
      price: product.price,
      quantity: 1
    }],
    event_category: 'ecommerce',
    event_label: 'product_view'
  });
};

// Track add to cart
export const trackAddToCart = (product, quantity = 1) => {
  pushToDataLayer('add_to_cart', {
    currency: 'INR',
    value: product.price * quantity,
    items: [{
      item_id: product._id,
      item_name: product.name,
      item_category: product.category?.name || 'Uncategorized',
      price: product.price,
      quantity: quantity
    }],
    event_category: 'ecommerce',
    event_label: 'add_to_cart'
  });
};

// Track remove from cart
export const trackRemoveFromCart = (product, quantity = 1) => {
  pushToDataLayer('remove_from_cart', {
    currency: 'INR',
    value: product.price * quantity,
    items: [{
      item_id: product._id,
      item_name: product.name,
      item_category: product.category?.name || 'Uncategorized',
      price: product.price,
      quantity: quantity
    }],
    event_category: 'ecommerce',
    event_label: 'remove_from_cart'
  });
};

// Track add to wishlist
export const trackAddToWishlist = (product) => {
  pushToDataLayer('add_to_wishlist', {
    currency: 'INR',
    value: product.price,
    items: [{
      item_id: product._id,
      item_name: product.name,
      item_category: product.category?.name || 'Uncategorized',
      price: product.price,
      quantity: 1
    }],
    event_category: 'ecommerce',
    event_label: 'add_to_wishlist'
  });
};

// Track begin checkout
export const trackBeginCheckout = (cartItems, totalValue) => {
  const items = cartItems.map(item => ({
    item_id: item.product._id,
    item_name: item.product.name,
    item_category: item.product.category?.name || 'Uncategorized',
    price: item.price,
    quantity: item.quantity
  }));

  pushToDataLayer('begin_checkout', {
    currency: 'INR',
    value: totalValue,
    items: items,
    event_category: 'ecommerce',
    event_label: 'begin_checkout'
  });
};

// Track purchase
export const trackPurchase = (order) => {
  const items = order.orderItems.map(item => ({
    item_id: item.product._id,
    item_name: item.name,
    item_category: item.category?.name || 'Uncategorized',
    price: item.price,
    quantity: item.quantity
  }));

  pushToDataLayer('purchase', {
    transaction_id: order._id,
    value: order.totalPrice,
    tax: order.tax || 0,
    shipping: order.shippingCost || 0,
    currency: 'INR',
    items: items,
    event_category: 'ecommerce',
    event_label: 'purchase'
  });
};

// Track search
export const trackSearch = (searchTerm) => {
  pushToDataLayer('search', {
    search_term: searchTerm,
    event_category: 'engagement',
    event_label: 'product_search'
  });
};

// Track category view
export const trackCategoryView = (categoryName) => {
  pushToDataLayer('view_item_list', {
    item_list_name: categoryName,
    event_category: 'ecommerce',
    event_label: 'category_view'
  });
};

// Track form submissions
export const trackFormSubmission = (formName) => {
  pushToDataLayer('form_submit', {
    form_name: formName,
    event_category: 'engagement',
    event_label: 'form_submission'
  });
};

// Track button clicks
export const trackButtonClick = (buttonName, location = 'unknown') => {
  pushToDataLayer('click', {
    button_name: buttonName,
    location: location,
    event_category: 'engagement',
    event_label: 'button_click'
  });
};

// Track error events
export const trackError = (errorType, errorMessage) => {
  pushToDataLayer('exception', {
    description: errorMessage,
    fatal: false,
    event_category: 'error',
    event_label: errorType
  });
};

// Track user engagement (time on page, scroll depth, etc.)
export const trackEngagement = (action, value = null) => {
  pushToDataLayer('user_engagement', {
    engagement_time_msec: value,
    event_category: 'engagement',
    event_label: action
  });
};

// Track admin actions
export const trackAdminAction = (action, resource) => {
  pushToDataLayer('admin_action', {
    action: action,
    resource: resource,
    event_category: 'admin',
    event_label: `${action}_${resource}`
  });
};

// Enhanced ecommerce tracking for product interactions
export const trackProductInteraction = (action, product, additionalData = {}) => {
  const baseEvent = {
    currency: 'INR',
    value: product.price,
    items: [{
      item_id: product._id,
      item_name: product.name,
      item_category: product.category?.name || 'Uncategorized',
      price: product.price,
      quantity: 1
    }],
    event_category: 'ecommerce',
    event_label: action
  };

  pushToDataLayer(action, {
    ...baseEvent,
    ...additionalData
  });
};

// Track user journey steps
export const trackUserJourney = (step, stepNumber, totalSteps) => {
  pushToDataLayer('user_journey_step', {
    step: step,
    step_number: stepNumber,
    total_steps: totalSteps,
    event_category: 'engagement',
    event_label: 'user_journey'
  });
};

// Track performance metrics
export const trackPerformance = (metricName, value) => {
  pushToDataLayer('performance', {
    metric_name: metricName,
    metric_value: value,
    event_category: 'performance',
    event_label: metricName
  });
};

// Initialize analytics when the app loads
export const initializeGTMAnalytics = () => {
  // Initialize GTM
  initGTM();
  
  // Track initial page load
  trackPageView(document.title, window.location.pathname);
  
  // Track user engagement
  let startTime = Date.now();
  
  // Track time on page when user leaves
  window.addEventListener('beforeunload', () => {
    const timeOnPage = Date.now() - startTime;
    trackEngagement('time_on_page', timeOnPage);
  });
  
  // Track scroll depth
  let maxScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
        trackEngagement('scroll_depth', maxScroll);
      }
    }
  });
  
}; 