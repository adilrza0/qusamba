const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:5000/api';

// Test with multiple users
const testUsers = [
  { email: 'customer@example.com', password: 'password123' },
  { email: 'admin@qusamba.com', password: 'password123' }
];

async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.log(`❌ Login failed for ${credentials.email}:`, error.message);
    return null;
  }
}

async function getCart(token, userEmail) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    console.log(`🛒 ${userEmail} cart:`, data.data.cart.length, 'items');
    return data.data.cart;
  } catch (error) {
    console.log(`❌ Get cart failed for ${userEmail}:`, error.message);
    return null;
  }
}

async function getWishlist(token, userEmail) {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    console.log(`❤️ ${userEmail} wishlist:`, data.data.wishlist.length, 'items');
    return data.data.wishlist;
  } catch (error) {
    console.log(`❌ Get wishlist failed for ${userEmail}:`, error.message);
    return null;
  }
}

async function addToCart(token, userEmail, productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: productId,
        quantity: 1,
        color: `TestColor_${userEmail}`,
        size: `TestSize_${userEmail}`
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    console.log(`✅ Added to cart for ${userEmail}`);
    return data.data.cart;
  } catch (error) {
    console.log(`❌ Add to cart failed for ${userEmail}:`, error.message);
    return null;
  }
}

async function testAPIIsolation() {
  console.log('🧪 Testing API User Isolation\n');

  const tokens = {};

  // Step 1: Login all users
  console.log('1. Logging in users...');
  for (const user of testUsers) {
    const token = await loginUser(user);
    if (token) {
      tokens[user.email] = token;
      console.log(`✅ ${user.email} logged in successfully`);
    }
  }

  if (Object.keys(tokens).length < 2) {
    console.log('❌ Need at least 2 users logged in to test isolation');
    return;
  }

  console.log('\n2. Getting initial cart/wishlist state...');
  
  // Step 2: Get initial state
  for (const [email, token] of Object.entries(tokens)) {
    await getCart(token, email);
    await getWishlist(token, email);
  }

  // Step 3: Add same product to different users' carts
  console.log('\n3. Adding same product to different users...');
  const testProductId = '686b8de901fe61145eb266bb'; // From our test data

  for (const [email, token] of Object.entries(tokens)) {
    await addToCart(token, email, testProductId);
  }

  // Step 4: Verify isolation
  console.log('\n4. Verifying user isolation...');
  
  const finalCarts = {};
  for (const [email, token] of Object.entries(tokens)) {
    finalCarts[email] = await getCart(token, email);
  }

  // Check if carts are different
  const userEmails = Object.keys(finalCarts);
  if (userEmails.length >= 2) {
    const cart1 = finalCarts[userEmails[0]];
    const cart2 = finalCarts[userEmails[1]];

    if (cart1 && cart2) {
      const cart1Colors = cart1.map(item => item.color);
      const cart2Colors = cart2.map(item => item.color);

      console.log(`\n🔍 User 1 (${userEmails[0]}) cart colors:`, cart1Colors);
      console.log(`🔍 User 2 (${userEmails[1]}) cart colors:`, cart2Colors);

      if (JSON.stringify(cart1Colors) !== JSON.stringify(cart2Colors)) {
        console.log('\n✅ SUCCESS: Users have different cart data!');
        console.log('✅ User isolation is working correctly!');
      } else {
        console.log('\n❌ ISSUE: Users have the same cart data!');
        console.log('❌ User isolation is NOT working!');
      }
    }
  }

  console.log('\n📋 Test Complete');
}

// Run the test
testAPIIsolation().catch(console.error);
