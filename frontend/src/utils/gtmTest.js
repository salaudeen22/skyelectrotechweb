// Google Analytics Test Utility
export const testGA = () => {
  console.log('=== Google Analytics Configuration Test ===');
  
  // Check if gtag exists
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('✅ gtag is available');
  } else {
    console.log('❌ gtag is not available');
  }
  
  // Test sending an event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'test_event', {
      event_category: 'test',
      event_label: 'GA is working correctly',
      value: 100
    });
    console.log('✅ Test event sent to Google Analytics');
  }
  
  // Check if GA script is loaded
  const gaScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  if (gaScript) {
    console.log('✅ Google Analytics script is loaded');
  } else {
    console.log('❌ Google Analytics script is not loaded');
  }
  
  console.log('=== End GA Test ===');
};

// Test specific events
export const testGAEvents = () => {
  console.log('=== Testing GA Events ===');
  
  // Test page view
  window.gtag('config', 'G-JTCY4K8TTL', {
    page_title: 'Test Page',
    page_path: '/test'
  });
  
  // Test custom event
  window.gtag('event', 'test_event', {
    event_category: 'test',
    event_label: 'test_label',
    value: 100
  });
  
  // Test ecommerce event
  window.gtag('event', 'add_to_cart', {
    currency: 'INR',
    value: 500,
    items: [{
      item_id: 'test_product',
      item_name: 'Test Product',
      price: 500,
      quantity: 1
    }]
  });
  
  console.log('✅ Test events sent to Google Analytics');
  console.log('=== End Event Test ===');
}; 