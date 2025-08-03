const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Order = require('./models/Order');
const User = require('./models/User');

async function debugAndFixOrders() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    console.log('\n=== ORDER STATUS DEBUG & FIX ===\n');

    // Get all orders
    const allOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    console.log(`Total orders in database: ${allOrders.length}\n`);

    if (allOrders.length === 0) {
      console.log('❌ No orders found in database');
      return;
    }

    // Analyze status issues
    console.log('🔍 ANALYZING ORDER STATUS ISSUES:');
    console.log('=====================================');

    const validOrderStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
    const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'];

    let invalidOrderStatuses = [];
    let invalidPaymentStatuses = [];
    let ordersNeedingFix = [];

    allOrders.forEach((order, index) => {
      const orderStatus = order.status;
      const paymentStatus = order.payment?.status;

      // Check if order status is invalid
      if (!validOrderStatuses.includes(orderStatus)) {
        invalidOrderStatuses.push({
          orderNumber: order.orderNumber,
          currentStatus: orderStatus,
          index: index + 1
        });
        ordersNeedingFix.push(order);
      }

      // Check if payment status is invalid
      if (!validPaymentStatuses.includes(paymentStatus)) {
        invalidPaymentStatuses.push({
          orderNumber: order.orderNumber,
          currentPaymentStatus: paymentStatus,
          index: index + 1
        });
      }

      console.log(`${index + 1}. Order #${order.orderNumber}`);
      console.log(`   Order Status: ${orderStatus} ${validOrderStatuses.includes(orderStatus) ? '✅' : '❌ INVALID'}`);
      console.log(`   Payment Status: ${paymentStatus} ${validPaymentStatuses.includes(paymentStatus) ? '✅' : '❌ INVALID'}`);
      console.log(`   Created: ${order.createdAt?.toLocaleDateString()}`);
      console.log('');
    });

    // Report issues
    if (invalidOrderStatuses.length > 0) {
      console.log('\n❌ INVALID ORDER STATUSES FOUND:');
      invalidOrderStatuses.forEach(issue => {
        console.log(`  ${issue.index}. Order #${issue.orderNumber}: "${issue.currentStatus}"`);
      });
    }

    if (invalidPaymentStatuses.length > 0) {
      console.log('\n❌ INVALID PAYMENT STATUSES FOUND:');
      invalidPaymentStatuses.forEach(issue => {
        console.log(`  ${issue.index}. Order #${issue.orderNumber}: "${issue.currentPaymentStatus}"`);
      });
    }

    // Fix invalid order statuses
    if (ordersNeedingFix.length > 0) {
      console.log(`\n🔧 FIXING ${ordersNeedingFix.length} ORDERS WITH INVALID STATUS...`);
      
      for (const order of ordersNeedingFix) {
        const oldStatus = order.status;
        
        // Logic to determine correct status based on payment status
        if (order.payment?.status === 'completed') {
          order.status = 'confirmed'; // Paid orders should be confirmed
        } else {
          order.status = 'placed'; // Unpaid orders should be placed
        }

        // Add tracking entry for the fix
        order.tracking.push({
          status: order.status,
          message: `Status corrected from "${oldStatus}" to "${order.status}" (data fix)`,
          timestamp: new Date()
        });

        await order.save();
        console.log(`  ✅ Fixed Order #${order.orderNumber}: "${oldStatus}" → "${order.status}"`);
      }
      
      console.log('\n✅ All order statuses have been fixed!');
    } else {
      console.log('\n✅ All order statuses are valid!');
    }

    // Final verification
    console.log('\n🎯 FINAL VERIFICATION:');
    console.log('=====================================');
    
    const updatedOrders = await Order.find({});
    const statusCount = {};
    const paymentStatusCount = {};

    updatedOrders.forEach(order => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
      paymentStatusCount[order.payment?.status] = (paymentStatusCount[order.payment?.status] || 0) + 1;
    });

    console.log('\nFinal Order Status Breakdown:');
    Object.entries(statusCount).forEach(([status, count]) => {
      const isValid = validOrderStatuses.includes(status);
      console.log(`  ${status}: ${count} orders ${isValid ? '✅' : '❌'}`);
    });

    console.log('\nFinal Payment Status Breakdown:');
    Object.entries(paymentStatusCount).forEach(([status, count]) => {
      const isValid = validPaymentStatuses.includes(status);
      console.log(`  ${status}: ${count} orders ${isValid ? '✅' : '❌'}`);
    });

    // Check shipping readiness after fix
    const ordersReadyForShipping = updatedOrders.filter(order => 
      order.payment?.status === 'completed' && 
      ['confirmed', 'processing'].includes(order.status)
    );

    console.log(`\n🚢 Orders ready for shipping: ${ordersReadyForShipping.length}`);
    if (ordersReadyForShipping.length > 0) {
      ordersReadyForShipping.forEach(order => {
        console.log(`  - Order #${order.orderNumber} (${order.status}, payment: ${order.payment.status})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  }
}

// Run the debug and fix
debugAndFixOrders();
