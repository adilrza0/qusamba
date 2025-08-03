const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Order = require('./models/Order');
const User = require('./models/User');

async function testOrderFlow() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    console.log('\n=== TESTING ORDER STATUS FLOW ===\n');

    // Find an order in processing status with completed payment
    const processingOrder = await Order.findOne({
      status: 'processing',
      'payment.status': 'completed'
    }).populate('user', 'name email');

    if (!processingOrder) {
      console.log('❌ No processing orders with completed payment found');
      return;
    }

    console.log(`Found order: ${processingOrder.orderNumber}`);
    console.log(`Current status: ${processingOrder.status}`);
    console.log(`Payment status: ${processingOrder.payment?.status}`);
    console.log(`Shiprocket order ID: ${processingOrder.shipping?.shiprocket_order_id || 'None'}`);

    // Test 1: Approve order (should move to ready_to_ship and create Shiprocket order)
    console.log('\n--- Test 1: Approving Order ---');
    
    // Simulate approval by directly calling the auto-create shipment function
    const { autoCreateShipment } = require('./controllers/shippingController');
    
    console.log('Creating Shiprocket order...');
    await autoCreateShipment(processingOrder._id);
    
    // Reload order to see changes
    const updatedOrder = await Order.findById(processingOrder._id);
    console.log(`✅ Order status after approval: ${updatedOrder.status}`);
    console.log(`✅ Shiprocket order ID: ${updatedOrder.shipping?.shiprocket_order_id || 'None'}`);
    console.log(`✅ AWB Code: ${updatedOrder.shipping?.awb_code || 'None'}`);

    // Test 2: Ship order (should move to shipped)
    if (updatedOrder.status === 'ready_to_ship') {
      console.log('\n--- Test 2: Shipping Order ---');
      
      updatedOrder.status = 'shipped';
      updatedOrder.shipping.shippedAt = new Date();
      updatedOrder.tracking.push({
        status: 'shipped',
        message: `Order shipped via ${updatedOrder.shipping.courier_name}. Package dispatched from warehouse.`,
        timestamp: new Date()
      });
      
      await updatedOrder.save();
      
      console.log(`✅ Order status after shipping: ${updatedOrder.status}`);
      console.log(`✅ Shipped at: ${updatedOrder.shipping.shippedAt}`);
    }

    console.log('\n=== ORDER STATUS FLOW TESTING COMPLETE ===');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  }
}

// Run the test
testOrderFlow();
