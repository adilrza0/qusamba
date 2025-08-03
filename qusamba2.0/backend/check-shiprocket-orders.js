const shiprocketService = require('./services/shiprocketService');

async function checkShiprocketOrders() {
  try {
    console.log('=== Checking Shiprocket Orders ===\n');
    
    console.log('1. Getting Shiprocket orders...');
    const ordersResult = await shiprocketService.getOrders(1, 10); // Get first 10 orders
    
    if (ordersResult.success) {
      console.log(`Found ${ordersResult.orders.length} orders in Shiprocket:`);
      
      ordersResult.orders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order ID: ${order.id}`);
        console.log(`   Order Number: ${order.order_id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   AWB Code: ${order.awb_code || 'NOT ASSIGNED'}`);
        console.log(`   Courier: ${order.courier_name || 'NOT ASSIGNED'}`);
        console.log(`   Shipment ID: ${order.shipment_id || 'NOT ASSIGNED'}`);
        console.log(`   Created: ${order.created_at}`);
        
        if (!order.awb_code && order.shipment_id) {
          console.log(`   ⚠️  This order has no AWB but has shipment ID: ${order.shipment_id}`);
        }
      });
      
      // Find orders without AWB codes
      const ordersWithoutAWB = ordersResult.orders.filter(order => !order.awb_code && order.shipment_id);
      
      if (ordersWithoutAWB.length > 0) {
        console.log(`\n🔍 Found ${ordersWithoutAWB.length} orders without AWB codes. Let's try to generate them...`);
        
        for (const order of ordersWithoutAWB.slice(0, 2)) { // Test with first 2 orders
          console.log(`\nTrying to generate AWB for shipment ${order.shipment_id}...`);
          
          try {
            // Get available couriers for this order
            const ratesResult = await shiprocketService.getShippingRates(order.customer_pincode || '110001', 0, 0.5);
            
            if (ratesResult.success && ratesResult.available_couriers.length > 0) {
              const courier = ratesResult.available_couriers[0]; // Use first available
              console.log(`Using courier: ${courier.courier_name} (ID: ${courier.courier_company_id})`);
              
              const awbResult = await shiprocketService.generateAWB(order.shipment_id, courier.courier_company_id);
              
              if (awbResult.success) {
                console.log(`✅ SUCCESS! Generated AWB: ${awbResult.awb_code}`);
              } else {
                console.log(`❌ Failed to generate AWB`);
              }
            } else {
              console.log('❌ No available couriers found for this order');
            }
          } catch (error) {
            console.log(`❌ Error generating AWB: ${error.message}`);
          }
        }
      } else {
        console.log('\n✅ All orders have AWB codes assigned');
      }
    } else {
      console.log('❌ Failed to get Shiprocket orders:', ordersResult.error);
    }
    
    console.log('\n2. Checking pickup locations...');
    const pickupResult = await shiprocketService.getPickupLocations();
    console.log('Pickup locations result:', JSON.stringify(pickupResult, null, 2));
    
  } catch (error) {
    console.error('Error checking Shiprocket orders:', error);
  }
}

// Run the function
checkShiprocketOrders().then(() => {
  console.log('\n=== Check Complete ===');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
