const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

// Test credentials (replace with actual test user)
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

async function testAPI() {
  try {
    console.log('🧪 Testing Cart and Wishlist API with Token Authentication\n');

    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCredentials)
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData.message);
      console.log('Note: Create a test user first or update the credentials in this script');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful, token received');

    // Step 2: Test Cart endpoints
    console.log('\n2. Testing Cart endpoints...');

    // Get cart (should be empty initially)
    console.log('   📋 Getting cart...');
    const cartResponse = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (cartResponse.ok) {
      const cartData = await cartResponse.json();
      console.log('   ✅ Cart retrieved:', cartData.data.cart.length, 'items');
    } else {
      console.log('   ❌ Failed to get cart');
    }

    // Test adding to cart (you'll need a valid product ID)
    // Uncomment and update the productId once you have products in your database
    /*
    console.log('   ➕ Adding item to cart...');
    const addToCartResponse = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: 'YOUR_PRODUCT_ID_HERE',
        quantity: 1,
        color: 'Red',
        size: 'M'
      })
    });

    if (addToCartResponse.ok) {
      const addData = await addToCartResponse.json();
      console.log('   ✅ Item added to cart');
    } else {
      const errorData = await addToCartResponse.json();
      console.log('   ❌ Failed to add to cart:', errorData.message);
    }
    */

    // Step 3: Test Wishlist endpoints
    console.log('\n3. Testing Wishlist endpoints...');

    // Get wishlist
    console.log('   📋 Getting wishlist...');
    const wishlistResponse = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (wishlistResponse.ok) {
      const wishlistData = await wishlistResponse.json();
      console.log('   ✅ Wishlist retrieved:', wishlistData.data.wishlist.length, 'items');
    } else {
      console.log('   ❌ Failed to get wishlist');
    }

    // Test adding to wishlist (you'll need a valid product ID)
    // Uncomment and update the productId once you have products in your database
    /*
    console.log('   ➕ Adding item to wishlist...');
    const addToWishlistResponse = await fetch(`${API_BASE_URL}/wishlist/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: 'YOUR_PRODUCT_ID_HERE'
      })
    });

    if (addToWishlistResponse.ok) {
      const wishlistAddData = await addToWishlistResponse.json();
      console.log('   ✅ Item added to wishlist');
    } else {
      const errorData = await addToWishlistResponse.json();
      console.log('   ❌ Failed to add to wishlist:', errorData.message);
    }
    */

    // Step 4: Test without token (should fail)
    console.log('\n4. Testing without token (should fail)...');
    const noTokenResponse = await fetch(`${API_BASE_URL}/cart`);
    
    if (!noTokenResponse.ok) {
      console.log('   ✅ Correctly rejected request without token');
    } else {
      console.log('   ❌ Request without token was accepted (security issue!)');
    }

    console.log('\n🎉 API Token Authentication Test Complete!');
    console.log('\nNote: To test adding items, create some products in your database');
    console.log('and update the productId in the commented sections of this script.');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAPI();
