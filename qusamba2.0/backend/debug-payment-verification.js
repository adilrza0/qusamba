const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
require('dotenv').config();

async function debugPaymentVerification() {
  try {
    console.log('=== Debugging Payment Verification ===\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');
    
    console.log('\n1. Checking recent orders...');
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log(`Found ${recentOrders.length} recent orders:`);
    recentOrders.forEach((order, index) => {
      console.log(`\n${index + 1}. Order: ${order._id}`);
      console.log(`   Order Number: ${order.orderNumber}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Payment Status: ${order.payment?.status || 'N/A'}`);
      console.log(`   Razorpay Order ID: ${order.payment?.razorpayOrderId || 'N/A'}`);
      console.log(`   Razorpay Payment ID: ${order.payment?.razorpayPaymentId || 'N/A'}`);
      console.log(`   Total Amount: ${order.totalAmount} ${order.currency}`);
      console.log(`   Created: ${order.createdAt}`);
      
      if (order.payment?.status === 'pending') {
        console.log(`   ⚠️  This order has pending payment`);
      }
    });
    
    console.log('\n2. Testing signature verification...');
    
    // Test signature verification with sample data
    const testOrderId = 'order_test123';
    const testPaymentId = 'pay_test456';
    const testSecret = process.env.RAZORPAY_KEY_SECRET;
    
    console.log('Environment variables:');
    console.log(`   RAZORPAY_KEY_ID: ${process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not Set'}`);
    console.log(`   RAZORPAY_KEY_SECRET: ${process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not Set'}`);
    console.log(`   RAZORPAY_WEBHOOK_SECRET: ${process.env.RAZORPAY_WEBHOOK_SECRET ? 'Set' : 'Not Set'}`);
    
    if (testSecret) {
      const body = testOrderId + "|" + testPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', testSecret)
        .update(body.toString())
        .digest('hex');
      
      console.log('\nTest signature generation:');
      console.log(`   Body: ${body}`);
      console.log(`   Generated Signature: ${expectedSignature}`);
      console.log('✓ Signature generation working');
    } else {
      console.log('❌ RAZORPAY_KEY_SECRET not found in environment');
    }
    
    console.log('\n3. Testing JSON response format...');
    
    // Test JSON response structure
    const testResponse = {
      success: true,
      message: 'Payment verified successfully',
      paymentId: 'pay_test456',
      order: {
        _id: 'test_order_id',
        orderNumber: 'ORD123456',
        totalAmount: 108,
        status: 'confirmed'
      }
    };
    
    try {
      const jsonString = JSON.stringify(testResponse);
      const parsedResponse = JSON.parse(jsonString);
      console.log('✓ JSON serialization/deserialization working');
      console.log('Test response structure:', parsedResponse);
    } catch (jsonError) {
      console.log('❌ JSON handling error:', jsonError.message);
    }
    
    console.log('\n4. Checking for potential issues...');
    
    // Check for orders with missing payment data
    const ordersWithMissingPayment = await Order.find({
      $or: [
        { 'payment.razorpayOrderId': { $exists: true, $ne: null } },
        { 'payment.status': 'pending' }
      ]
    }).limit(3);
    
    console.log(`Found ${ordersWithMissingPayment.length} orders with payment data:`);
    ordersWithMissingPayment.forEach((order, index) => {
      console.log(`\n${index + 1}. Order ${order._id}:`);
      console.log(`   Payment Object:`, JSON.stringify(order.payment, null, 2));
    });
    
    console.log('\n5. Common issues to check:');
    console.log('   - Ensure frontend sends correct Content-Type header');
    console.log('   - Verify API endpoint URLs are correct');
    console.log('   - Check for middleware that might interfere with JSON parsing');
    console.log('   - Ensure no HTML error pages are being returned instead of JSON');
    console.log('   - Verify CORS settings allow JSON responses');
    
  } catch (error) {
    console.error('Debug script error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n=== Debug Complete ===');
  }
}

// Run the debug function
debugPaymentVerification().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
