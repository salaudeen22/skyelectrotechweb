// GTM Test Utility
export const testGTM = () => {
  
  // Check if dataLayer exists
  if (typeof window !== 'undefined' && window.dataLayer) {
  } else {
  }
  
  // Test pushing an event
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'gtm_test',
      test_message: 'GTM is working correctly',
      timestamp: new Date().toISOString()
    });
  }
  
  // Check if GTM script is loaded
  const gtmScript = document.querySelector('script[src*="googletagmanager.com/gtm.js"]');
  if (gtmScript) {
  } else {
  }
  
  // Check noscript fallback
  const gtmNoscript = document.querySelector('noscript iframe[src*="googletagmanager.com"]');
  if (gtmNoscript) {
  } else {
  }
  
};

// Test specific events
export const testGTMEvents = () => {
  
  // Test page view
  window.dataLayer.push({
    event: 'page_view',
    page_title: 'Test Page',
    page_path: '/test'
  });
  
  // Test custom event
  window.dataLayer.push({
    event: 'test_event',
    event_category: 'test',
    event_label: 'test_label',
    value: 100
  });
  
  // Test ecommerce event
  window.dataLayer.push({
    event: 'add_to_cart',
    currency: 'INR',
    value: 500,
    items: [{
      item_id: 'test_product',
      item_name: 'Test Product',
      price: 500,
      quantity: 1
    }]
  });
  
}; 