const shiprocketService = require('./services/shiprocketService');

async function debugAWBGeneration() {
  try {
    console.log('=== Debugging AWB Generation Issue ===\n');
    
    // The shipment ID from your error log
    const shipmentId = '909656198';
    
    console.log('1. Testing authentication...');
    const token = await shiprocketService.authenticate();
    console.log('✓ Authentication successful');
    
    console.log('\n2. Getting available couriers for this shipment...');
    // Using your pickup and delivery pincodes from the logs
    const pickupPincode = 110086; // From shiprocketService.js
    const deliveryPincode = '110001'; // You'll need to replace this with actual delivery pincode
    const weight = 0.5;
    
    const serviceabilityUrl = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&cod=0&weight=${weight}`;
    console.log('Serviceability URL:', serviceabilityUrl);
    
    const ratesResult = await shiprocketService.getShippingRates(deliveryPincode, 0, weight);
    console.log('Available couriers result:', JSON.stringify(ratesResult, null, 2));
    
    if (ratesResult.success && ratesResult.available_couriers.length > 0) {
      console.log('\n3. Testing AWB generation with different couriers...');
      
      // Try with the first few available couriers
      for (let i = 0; i < Math.min(3, ratesResult.available_couriers.length); i++) {
        const courier = ratesResult.available_couriers[i];
        console.log(`\nTrying courier: ${courier.courier_name} (ID: ${courier.courier_company_id})`);
        
        try {
          const awbResult = await shiprocketService.generateAWB(shipmentId, courier.courier_company_id);
          console.log('✓ AWB Generation Result:', awbResult);
          
          if (awbResult.success) {
            console.log(`🎉 SUCCESS! AWB generated: ${awbResult.awb_code}`);
            break;
          }
        } catch (error) {
          console.log(`✗ Failed with ${courier.courier_name}:`, error.message);
        }
      }
    } else {
      console.log('❌ No available couriers found or error occurred');
    }
    
    console.log('\n4. Alternative: Check if pickup location is properly configured...');
    const pickupResult = await shiprocketService.getPickupLocations();
    console.log('Pickup locations:', JSON.stringify(pickupResult, null, 2));
    
    if (!pickupResult.success || pickupResult.pickup_locations.length === 0) {
      console.log('❌ No pickup locations found. Creating pickup location...');
      try {
        const createResult = await shiprocketService.createPickupLocation();
        console.log('Pickup location creation result:', createResult);
      } catch (error) {
        console.log('Failed to create pickup location:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Debug script error:', error);
  }
}

// Run the debug function
debugAWBGeneration().then(() => {
  console.log('\n=== Debug Complete ===');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
