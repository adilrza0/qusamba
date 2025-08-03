const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');
const AdminSettings = require('./models/AdminSettings');

async function simulateAdminAPI() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    console.log('\n🔍 SIMULATING ADMIN API CALLS');
    console.log('==============================\n');

    // Simulate the getOrdersPendingApproval function
    console.log('1. Testing getOrdersPendingApproval logic:');
    console.log('------------------------------------------');

    const page = 1;
    const limit = 20;
    
    // Get admin settings to check if approval is required
    const settings = await AdminSettings.getSettings();
    console.log('Admin Settings:');
    console.log(`  - requireOrderApproval: ${settings.requireOrderApproval}`);
    console.log(`  - autoCreateShipment: ${settings.autoCreateShipment}`);
    
    if (!settings.requireOrderApproval) {
      console.log('❌ Order approval is disabled - this would return empty array');
      console.log('Solution: Enable order approval in admin settings');
      return;
    }
    
    // Find orders that are paid but not yet shipped and don't have shipment created
    const query = {
      'payment.status': 'completed',
      status: { $in: ['placed', 'confirmed'] },
      'shipping.shiprocket_order_id': { $exists: false }
    };
    
    console.log('\nQuery being used:');
    console.log(JSON.stringify(query, null, 2));
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Order.countDocuments(query);
    
    console.log(`\n✅ Found ${orders.length} orders pending approval (total: ${total})`);
    
    if (orders.length === 0) {
      console.log('\n❌ No orders found! Checking why...');
      
      // Debug each condition
      const allOrders = await Order.find({});
      const completedPayments = await Order.find({ 'payment.status': 'completed' });
      const rightStatus = await Order.find({ status: { $in: ['placed', 'confirmed'] } });
      const noShipment = await Order.find({ 'shipping.shiprocket_order_id': { $exists: false } });
      
      console.log('Debug breakdown:');
      console.log(`  - Total orders: ${allOrders.length}`);
      console.log(`  - Orders with completed payment: ${completedPayments.length}`);
      console.log(`  - Orders with status [placed, confirmed]: ${rightStatus.length}`);
      console.log(`  - Orders without shipment: ${noShipment.length}`);
      
    } else {
      console.log('\n📋 Orders found:');
      orders.forEach((order, index) => {
        console.log(`\n  ${index + 1}. Order #${order.orderNumber}`);
        console.log(`     Customer: ${order.user?.name || 'Unknown'} (${order.user?.email})`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Payment: ${order.payment?.status}`);
        console.log(`     Total: ₹${order.totalAmount}`);
        console.log(`     Items: ${order.items?.length || 0} items`);
        console.log(`     Shiprocket ID: ${order.shipping?.shiprocket_order_id || 'None'}`);
      });
    }

    // Test API response format
    const apiResponse = {
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      automationEnabled: false
    };
    
    console.log('\n📤 API Response would be:');
    console.log('------------------------');
    console.log(`Total Pages: ${apiResponse.totalPages}`);
    console.log(`Current Page: ${apiResponse.currentPage}`);
    console.log(`Total Orders: ${apiResponse.total}`);
    console.log(`Automation Enabled: ${apiResponse.automationEnabled}`);
    console.log(`Orders Array Length: ${apiResponse.orders.length}`);

    // 2. Test getAllOrders as well
    console.log('\n\n2. Testing getAllOrders (what admin panel might be using):');
    console.log('----------------------------------------------------------');
    
    const allOrdersQuery = {};
    const allOrders = await Order.find(allOrdersQuery)
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .populate('tracking.updatedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
      
    const allOrdersTotal = await Order.countDocuments(allOrdersQuery);
    
    console.log(`✅ getAllOrders would return ${allOrders.length} orders (total: ${allOrdersTotal})`);
    
    // Show status breakdown
    const statusBreakdown = {};
    allOrders.forEach(order => {
      statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
    });
    
    console.log('\nStatus breakdown:');
    Object.entries(statusBreakdown).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count} orders`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  }
}

// Run the simulation
simulateAdminAPI();
