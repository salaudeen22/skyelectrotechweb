const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

console.log('🔔 Setting up Push Notifications for SkyElectroTech...\n');

// Generate VAPID keys
console.log('📋 Generating VAPID keys...');
const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID keys generated successfully!\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '..', '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📁 Found existing .env file');
} else {
  console.log('📁 Creating new .env file');
}

// Add VAPID keys to .env
const vapidConfig = `
# Push Notification VAPID Keys
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_EMAIL=skyelectrotechblr@gmail.com
`;

if (!envContent.includes('VAPID_PUBLIC_KEY')) {
  envContent += vapidConfig;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ VAPID keys added to .env file');
} else {
  console.log('⚠️  VAPID keys already exist in .env file');
}

console.log('\n📋 VAPID Keys Generated:');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey.substring(0, 20) + '...');

console.log('\n🚀 Next Steps:');
console.log('1. Restart your backend server to load the new environment variables');
console.log('2. Test push notifications using the test endpoint: POST /api/notifications/test');
console.log('3. Ensure your frontend is properly configured to request notification permissions');
console.log('4. Test the complete flow: subscribe → send notification → receive notification');

console.log('\n📖 Documentation:');
console.log('- Backend API: /api/notifications/*');
console.log('- Frontend Components: NotificationBell, NotificationSettings');
console.log('- Service Worker: /public/sw.js');

console.log('\n✅ Push notification setup complete!');
