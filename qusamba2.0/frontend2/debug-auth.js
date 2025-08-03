// Debug authentication - run this in browser console
function debugAuth() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No token found in localStorage');
    return;
  }
  
  console.log('✅ Token found:', token.substring(0, 50) + '...');
  
  // Decode JWT token (without verification)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('User ID:', payload.id);
    console.log('Expires at:', new Date(payload.exp * 1000));
    console.log('Is expired:', Date.now() > payload.exp * 1000);
  } catch (e) {
    console.log('❌ Invalid token format');
  }
  
  // Test API call
  fetch('http://localhost:5000/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log('Current user data:', data);
    if (data.user) {
      console.log('User role:', data.user.role);
      console.log('Is admin:', data.user.role === 'admin');
    }
  })
  .catch(err => {
    console.log('❌ API call failed:', err);
  });
}

// Run debug
debugAuth();
