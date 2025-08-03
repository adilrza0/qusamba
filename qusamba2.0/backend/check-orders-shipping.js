const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Order = require('./models/Order');
const User = require('./models/User');
const AdminSettings = require('./models/AdminSettings');

async function checkOrdersForShipping() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    console.log('\n=== ORDER SHIPPING STATUS CHECK ===\n');

    // Get all orders
    const allOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    console.log(`Total orders in database: ${allOrders.length}\n`);

    if (allOrders.length === 0) {
      console.log('❌ No orders found in database');
      console.log('This is why admin panel shows no orders in shipping section.');
      console.log('\nTo test the shipping functionality, you need to:');
      console.log('1. Create a test order');
      console.log('2. Process payment');
      console.log('3. Check admin panel again');
    } else {
      console.log('📦 ORDER BREAKDOWN BY STATUS:');
      console.log('=====================================');

      const statusCount = {};
      const shippingStatusCount = {};

      allOrders.forEach(order => {
        // Count by order status
        statusCount[order.status] = (statusCount[order.status] || 0) + 1;
        
        // Count by shipping status
        const hasShipment = order.shipping?.shiprocket_order_id ? 'Has Shipment' : 'No Shipment';
        shippingStatusCount[hasShipment] = (shippingStatusCount[hasShipment] || 0) + 1;
      });

      console.log('\nOrder Status Breakdown:');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`  ${status}: ${count} orders`);
      });

      console.log('\nShipping Status Breakdown:');
      Object.entries(shippingStatusCount).forEach(([status, count]) => {
        console.log(`  ${status}: ${count} orders`);
      });

      console.log('\n📋 DETAILED ORDER LIST:');
      console.log('=====================================');

      allOrders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order #${order.orderNumber || order._id.toString().slice(-6)}`);
        console.log(`   Customer: ${order.user?.name || 'Unknown'} (${order.user?.email || 'No email'})`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Payment: ${order.payment?.status || 'unknown'}`);
        console.log(`   Total: ₹${order.totalAmount}`);
        console.log(`   Created: ${order.createdAt?.toLocaleDateString() || 'Unknown'}`);
        console.log(`   Shiprocket Order ID: ${order.shipping?.shiprocket_order_id || 'Not created'}`);
        console.log(`   AWB Code: ${order.shipping?.awb_code || 'Not assigned'}`);
        console.log(`   Tracking Number: ${order.shipping?.trackingNumber || 'Not available'}`);
      });

      // Check orders that should appear in admin shipping panel
      console.log('\n🚢 ORDERS FOR ADMIN SHIPPING PANEL:');
      console.log('=====================================');

      // Orders that are paid but not shipped
      const ordersForShipping = allOrders.filter(order => 
        order.payment?.status === 'completed' && 
        ['placed', 'confirmed', 'processing'].includes(order.status)
      );

      if (ordersForShipping.length === 0) {
        console.log('❌ No orders ready for shipping found.');
        console.log('\nReasons why admin panel might be empty:');
        console.log('1. No orders with payment status = "completed"');
        console.log('2. No orders with status in ["placed", "confirmed", "processing"]');
        console.log('3. All paid orders already have shipments created');
      } else {
        console.log(`✅ Found ${ordersForShipping.length} orders ready for shipping:`);
        ordersForShipping.forEach((order, index) => {
          console.log(`\n  ${index + 1}. Order #${order.orderNumber}`);
          console.log(`     Status: ${order.status}`);
          console.log(`     Payment: ${order.payment?.status}`);
          console.log(`     Has Shipment: ${order.shipping?.shiprocket_order_id ? 'Yes' : 'No'}`);
        });
      }
    }

    // Check admin settings
    console.log('\n⚙️ ADMIN SETTINGS:');
    console.log('=====================================');
    
    const settings = await AdminSettings.getSettings();
    console.log(`Auto Create Shipment: ${settings.autoCreateShipment}`);
    console.log(`Require Order Approval: ${settings.requireOrderApproval}`);
    console.log(`Automation Enabled: ${settings.isShipmentAutomationEnabled}`);

    if (settings.requireOrderApproval) {
      console.log('\n📋 ORDERS PENDING APPROVAL:');
      const pendingApproval = allOrders.filter(order => 
        order.payment?.status === 'completed' && 
        ['placed', 'confirmed'].includes(order.status) &&
        !order.shipping?.shiprocket_order_id
      );

      if (pendingApproval.length === 0) {
        console.log('❌ No orders pending approval');
      } else {
        console.log(`✅ ${pendingApproval.length} orders pending approval:`);
        pendingApproval.forEach(order => {
          console.log(`  - Order #${order.orderNumber} (${order.status})`);
        });
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  }
}

// Run the check
checkOrdersForShipping();
