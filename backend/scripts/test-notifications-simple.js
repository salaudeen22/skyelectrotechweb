const notificationService = require('../services/notificationService');

// Simple test to verify notifications are working
async function testNotifications() {
  console.log('🧪 Testing notifications...');
  
  try {
    // Test system notification
    const result = await notificationService.sendSystemNotification(
      '64f8b8b8b8b8b8b8b8b8b8b8', // Replace with actual user ID
      'Test Notification',
      'This is a test notification to verify the system is working!',
      'normal'
    );
    
    console.log('✅ Test notification sent successfully!');
    console.log('Notification ID:', result._id);
    console.log('Title:', result.title);
    console.log('Message:', result.message);
    
  } catch (error) {
    console.error('❌ Test notification failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testNotifications();
}

module.exports = { testNotifications };
