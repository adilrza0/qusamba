const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

async function testUserIsolation() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to database');

    // Check how many users exist
    const userCount = await User.countDocuments();
    console.log(`\n👥 Total users in database: ${userCount}`);

    // Get all users (limit to first 5 for safety)
    const users = await User.find({}).limit(5).select('email firstName lastName cart wishlist');
    
    console.log('\n👤 Users found:');
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`${i + 1}. ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Cart items: ${user.cart.length}`);
      console.log(`   Wishlist items: ${user.wishlist.length}`);
      console.log('');
    }

    // Check if there are products available
    const productCount = await Product.countDocuments();
    console.log(`📦 Total products in database: ${productCount}`);

    if (productCount > 0) {
      const firstProduct = await Product.findOne({}).select('name _id');
      console.log(`🏷️  First product: ${firstProduct.name} (ID: ${firstProduct._id})`);

      // Test: Add the same product to different users' carts directly in database
      if (users.length >= 2) {
        console.log('\n🧪 Testing user isolation by adding same product to different users...');

        const user1 = users[0];
        const user2 = users[1];

        // Clear existing carts first
        user1.cart = [];
        user2.cart = [];
        
        // Add same product to both users
        user1.cart.push({
          product: firstProduct._id,
          quantity: 1,
          color: 'TestColor1',
          size: 'TestSize1'
        });

        user2.cart.push({
          product: firstProduct._id,
          quantity: 2,
          color: 'TestColor2',
          size: 'TestSize2'
        });

        await user1.save();
        await user2.save();

        console.log(`✅ Added product to User 1 (${user1.email}) cart: quantity 1`);
        console.log(`✅ Added product to User 2 (${user2.email}) cart: quantity 2`);

        // Verify isolation
        const refreshedUser1 = await User.findById(user1._id);
        const refreshedUser2 = await User.findById(user2._id);

        console.log('\n🔍 Verification:');
        console.log(`User 1 cart: ${refreshedUser1.cart.length} items`);
        console.log(`User 2 cart: ${refreshedUser2.cart.length} items`);

        if (refreshedUser1.cart.length === 1 && refreshedUser2.cart.length === 1) {
          if (refreshedUser1.cart[0].quantity === 1 && refreshedUser2.cart[0].quantity === 2) {
            console.log('✅ SUCCESS: Users have different cart data as expected!');
          } else {
            console.log('❌ ISSUE: Cart quantities are not as expected');
          }
        } else {
          console.log('❌ ISSUE: Cart lengths are not as expected');
        }
      } else {
        console.log('❌ Need at least 2 users to test isolation');
      }
    } else {
      console.log('❌ No products found. Add some products first.');
    }

    console.log('\n📋 Recommendations:');
    console.log('1. Test the API endpoints with different user tokens');
    console.log('2. Check the debug logs when making API calls');
    console.log('3. Ensure each user gets a unique JWT token with their correct user ID');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testUserIsolation();
