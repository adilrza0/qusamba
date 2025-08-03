const axios = require('axios');

async function testOrdersEndpoint() {
  const baseUrl = 'http://localhost:5000/api';
  
  console.log('🧪 TESTING ORDERS ENDPOINTS');
  console.log('============================\n');

  try {
    // Test 1: Get all orders (admin endpoint)
    console.log('1. Testing GET /orders/admin/all');
    try {
      const response = await axios.get(`${baseUrl}/orders/admin/all`, {
        headers: {
          'Authorization': 'Bearer fake-token-for-testing'
        }
      });
      console.log('❌ Expected authentication error, but got:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.message);
      }
    }

    // Test 2: Get orders pending approval
    console.log('\n2. Testing GET /orders/admin/pending-approval');
    try {
      const response = await axios.get(`${baseUrl}/orders/admin/pending-approval`, {
        headers: {
          'Authorization': 'Bearer fake-token-for-testing'
        }
      });
      console.log('❌ Expected authentication error, but got:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.message);
      }
    }

    // Test 3: Check if server is running
    console.log('\n3. Testing server health');
    try {
      const response = await axios.get(`${baseUrl}/health`);
      console.log('✅ Server is running:', response.data);
    } catch (error) {
      console.log('❌ Server might not be running:', error.message);
      console.log('\n💡 SOLUTION: Start the server first!');
      console.log('   cd backend && node server.js');
      return;
    }

    console.log('\n📋 AVAILABLE ENDPOINTS FOR ADMIN SHIPPING:');
    console.log('==========================================');
    console.log('• GET /api/orders/admin/all - Get all orders');
    console.log('• GET /api/orders/admin/pending-approval - Get orders pending approval');
    console.log('• POST /api/orders/admin/:orderId/approve - Approve single order');
    console.log('• POST /api/orders/admin/bulk-approve - Bulk approve orders');
    console.log('• GET /api/shipping/rates - Get shipping rates');
    console.log('• POST /api/shipping/create/:orderId - Create shipment');
    console.log('• POST /api/shipping/bulk-create - Bulk create shipments');

    console.log('\n🔧 FOR ADMIN PANEL DEBUGGING:');
    console.log('============================');
    console.log('1. Check if admin panel is calling: /api/orders/admin/pending-approval');
    console.log('2. Check if authentication token is being sent');
    console.log('3. Check browser Network tab for API calls');
    console.log('4. Check browser Console for JavaScript errors');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testOrdersEndpoint();
