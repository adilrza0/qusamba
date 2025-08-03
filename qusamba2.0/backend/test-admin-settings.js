const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const AdminSettings = require('./models/AdminSettings');

async function testAdminSettings() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Test 1: Get default settings
    console.log('\n=== Test 1: Get Default Settings ===');
    const defaultSettings = await AdminSettings.getSettings();
    console.log('Default Settings:', {
      autoCreateShipment: defaultSettings.autoCreateShipment,
      requireOrderApproval: defaultSettings.requireOrderApproval,
      isShipmentAutomationEnabled: defaultSettings.isShipmentAutomationEnabled
    });

    // Test 2: Update specific setting
    console.log('\n=== Test 2: Enable Automation ===');
    await defaultSettings.updateSetting('autoCreateShipment', true);
    await defaultSettings.updateSetting('requireOrderApproval', false);
    
    const updatedSettings = await AdminSettings.getSettings();
    console.log('Updated Settings:', {
      autoCreateShipment: updatedSettings.autoCreateShipment,
      requireOrderApproval: updatedSettings.requireOrderApproval,
      isShipmentAutomationEnabled: updatedSettings.isShipmentAutomationEnabled
    });

    // Test 3: Disable automation
    console.log('\n=== Test 3: Disable Automation ===');
    await updatedSettings.updateSetting('autoCreateShipment', false);
    await updatedSettings.updateSetting('requireOrderApproval', true);
    
    const disabledSettings = await AdminSettings.getSettings();
    console.log('Disabled Settings:', {
      autoCreateShipment: disabledSettings.autoCreateShipment,
      requireOrderApproval: disabledSettings.requireOrderApproval,
      isShipmentAutomationEnabled: disabledSettings.isShipmentAutomationEnabled
    });

    console.log('\n=== All Tests Completed Successfully! ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
    process.exit(0);
  }
}

// Run the test
testAdminSettings();
