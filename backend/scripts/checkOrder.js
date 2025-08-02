const mongoose = require('mongoose');
const Order = require('../models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skyelectrotech', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkOrder = async () => {
  try {
    console.log('Checking order: 688df45bb6e9a684734e8952\n');

    const order = await Order.findById('688df45bb6e9a684734e8952').populate('user');
    
    if (!order) {
      console.log('❌ Order not found');
      return;
    }

    console.log('✅ Order found!');
    console.log('Order ID:', order._id);
    console.log('Order Status:', order.orderStatus);
    console.log('Customer:', order.user?.name || 'Unknown');
    console.log('Created At:', order.createdAt);
    console.log('Updated At:', order.updatedAt);
    
    console.log('\nStatus History:');
    order.statusHistory.forEach((status, index) => {
      console.log(`${index + 1}. ${status.status} - ${status.updatedAt} - ${status.note || 'No note'}`);
    });

    // Check if order can be returned
    const shippedDate = order.statusHistory.find(h => h.status === 'shipped')?.updatedAt || 
                       order.statusHistory.find(h => h.status === 'delivered')?.updatedAt || 
                       order.updatedAt;
    const daysSinceShipped = (new Date() - new Date(shippedDate)) / (1000 * 60 * 60 * 24);
    
    console.log('\nReturn Eligibility:');
    console.log('Shipped Date:', shippedDate);
    console.log('Days since shipped:', Math.round(daysSinceShipped));
    console.log('Can be returned:', order.orderStatus === 'shipped' || order.orderStatus === 'delivered');
    console.log('Within time limit:', daysSinceShipped <= 30);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkOrder(); 