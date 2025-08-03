// Debug utility to check authentication status and token
export const debugAuth = () => {
  if (typeof window === 'undefined') {
    console.log('🔧 Debug: Running on server (SSR)');
    return {
      hasToken: false,
      isClientSide: false,
      token: null
    };
  }

  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  const debugInfo = {
    hasToken: !!token,
    isClientSide: true,
    token: token ? `${token.substring(0, 10)}...` : null,
    hasUser: !!user,
    userEmail: user ? JSON.parse(user)?.email : null,
    timestamp: new Date().toISOString()
  };

  console.log('🔧 Auth Debug Info:', debugInfo);
  
  return debugInfo;
};

// Test cart API with current token
export const testCartAPI = async () => {
  const debugInfo = debugAuth();
  
  if (!debugInfo.hasToken) {
    console.log('❌ No token found - user needs to login');
    return false;
  }

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Cart API test successful:', data);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.log('❌ Cart API test failed:', errorData);
      return false;
    }
  } catch (error) {
    console.log('❌ Cart API test error:', error.message);
    return false;
  }
};

// Test wishlist API with current token
export const testWishlistAPI = async () => {
  const debugInfo = debugAuth();
  
  if (!debugInfo.hasToken) {
    console.log('❌ No token found - user needs to login');
    return false;
  }

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Wishlist API test successful:', data);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.log('❌ Wishlist API test failed:', errorData);
      return false;
    }
  } catch (error) {
    console.log('❌ Wishlist API test error:', error.message);
    return false;
  }
};

// Add debug functions to window for easy testing in browser console
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
  window.testCartAPI = testCartAPI;
  window.testWishlistAPI = testWishlistAPI;
  
  console.log('🔧 Debug functions available:');
  console.log('  - debugAuth() - Check auth status');
  console.log('  - testCartAPI() - Test cart endpoint');
  console.log('  - testWishlistAPI() - Test wishlist endpoint');
}
