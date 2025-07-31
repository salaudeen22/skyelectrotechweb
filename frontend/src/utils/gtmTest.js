// GTM Test Utility
export const testGTM = () => {
  console.log('=== GTM Configuration Test ===');
  
  // Check if dataLayer exists
  if (typeof window !== 'undefined' && window.dataLayer) {
    console.log('✅ dataLayer is available');
    console.log('dataLayer:', window.dataLayer);
  } else {
    console.log('❌ dataLayer is not available');
  }
  
  // Test pushing an event
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'gtm_test',
      test_message: 'GTM is working correctly',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Test event pushed to dataLayer');
  }
  
  // Check if GTM script is loaded
  const gtmScript = document.querySelector('script[src*="googletagmanager.com/gtm.js"]');
  if (gtmScript) {
    console.log('✅ GTM script is loaded');
  } else {
    console.log('❌ GTM script is not loaded');
  }
  
  // Check noscript fallback
  const gtmNoscript = document.querySelector('noscript iframe[src*="googletagmanager.com"]');
  if (gtmNoscript) {
    console.log('✅ GTM noscript fallback is present');
  } else {
    console.log('❌ GTM noscript fallback is missing');
  }
  
  console.log('=== End GTM Test ===');
};

// Test specific events
export const testGTMEvents = () => {
  console.log('=== Testing GTM Events ===');
  
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
  
  console.log('✅ Test events pushed to dataLayer');
  console.log('=== End Event Test ===');
}; 