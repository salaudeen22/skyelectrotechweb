const axios = require('axios');
const notificationService = require('../services/notificationService');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const TEST_USER_ID = process.env.TEST_USER_ID || 'your-test-user-id';

// Test notification types
const testNotifications = [
  {
    type: 'order_update',
    title: 'Order Confirmed! 🎉',
    message: 'Your order #ORD-12345 has been confirmed and is being processed.',
    priority: 'normal',
    data: {
      orderId: 'test-order-123',
      orderNumber: 'ORD-12345',
      status: 'confirmed'
    }
  },
  {
    type: 'price_drop',
    title: 'Price Drop Alert! 💰',
    message: 'Arduino Uno R3 is now 25% off! Save ₹500 on your next purchase.',
    priority: 'high',
    data: {
      productId: 'test-product-123',
      oldPrice: 2000,
      newPrice: 1500,
      discount: 25
    }
  },
  {
    type: 'stock_alert',
    title: 'Back in Stock! ⚠️',
    message: 'Raspberry Pi 4 Model B is back in stock! Only 10 units left.',
    priority: 'high',
    data: {
      productId: 'test-product-456',
      stockQuantity: 10,
      isBackInStock: true
    }
  },
  {
    type: 'promotional',
    title: 'Flash Sale! 🎉',
    message: 'Get 30% off on all electronic components. Sale ends in 2 hours!',
    priority: 'normal',
    data: {
      discount: 30,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    type: 'system',
    title: 'Account Security Alert 🔒',
    message: 'New login detected from a new device. If this wasn\'t you, please review your account.',
    priority: 'urgent',
    data: {
      deviceInfo: 'Chrome on Windows',
      location: 'Mumbai, India',
      timestamp: new Date().toISOString()
    }
  }
];

async function testPushNotification(notificationData) {
  try {
    console.log(`\n🧪 Testing ${notificationData.type} notification...`);
    
    const result = await notificationService.createAndSendNotification(
      TEST_USER_ID,
      notificationData
    );
    
    console.log('✅ Notification sent successfully!');
    console.log('📋 Details:', {
      id: result._id,
      type: result.type,
      title: result.title,
      priority: result.priority
    });
    
    return result;
  } catch (error) {
    console.error('❌ Failed to send notification:', error.message);
    return null;
  }
}

async function testBulkNotifications() {
  try {
    console.log('\n🧪 Testing bulk notifications...');
    
    const userIds = [TEST_USER_ID]; // Add more user IDs for bulk testing
    const notificationData = {
      title: 'Bulk Test Notification',
      message: 'This is a test notification sent to multiple users.',
      type: 'system',
      priority: 'normal',
      data: { test: true }
    };
    
    const results = await notificationService.sendBulkNotifications(userIds, notificationData);
    
    console.log('✅ Bulk notifications sent!');
    console.log('📊 Results:', results);
    
    return results;
  } catch (error) {
    console.error('❌ Failed to send bulk notifications:', error.message);
    return null;
  }
}

async function testNotificationPreferences() {
  try {
    console.log('\n🧪 Testing notification preferences...');
    
    // Test with different preference combinations
    const testCases = [
      { orderUpdates: true, priceDrops: false, stockAlerts: true },
      { orderUpdates: false, priceDrops: true, stockAlerts: false },
      { orderUpdates: true, priceDrops: true, stockAlerts: true }
    ];
    
    for (const preferences of testCases) {
      console.log(`\n📋 Testing preferences:`, preferences);
      
      const orderNotification = await notificationService.sendOrderUpdateNotification(
        TEST_USER_ID,
        { _id: 'test-order', orderNumber: 'TEST-123' },
        'confirmed'
      );
      
      const priceNotification = await notificationService.sendPriceDropNotification(
        TEST_USER_ID,
        { _id: 'test-product', name: 'Test Product' },
        1000,
        800
      );
      
      console.log('✅ Preference test completed');
    }
  } catch (error) {
    console.error('❌ Failed to test preferences:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Starting Push Notification Tests...\n');
  
  // Test individual notifications
  for (const notificationData of testNotifications) {
    await testPushNotification(notificationData);
    // Wait 2 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Test bulk notifications
  await testBulkNotifications();
  
  // Test preferences
  await testNotificationPreferences();
  
  console.log('\n✅ All tests completed!');
  console.log('\n📖 Next Steps:');
  console.log('1. Check your browser for push notifications');
  console.log('2. Verify notifications appear in the notifications page');
  console.log('3. Test notification preferences in the settings page');
  console.log('4. Check the browser console for any errors');
}

// Run tests if this script is executed directly
if (require.main === module) {
  if (!TEST_USER_ID || TEST_USER_ID === 'your-test-user-id') {
    console.error('❌ Please set TEST_USER_ID environment variable to a valid user ID');
    process.exit(1);
  }
  
  runTests().catch(console.error);
}

module.exports = {
  testPushNotification,
  testBulkNotifications,
  testNotificationPreferences,
  runTests
};
