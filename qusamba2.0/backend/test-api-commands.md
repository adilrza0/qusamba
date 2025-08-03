# 🧪 Testing Admin Panel API Endpoints

## Current Status: ✅ 2 Orders Ready for Shipping

Based on database analysis, you have **2 orders** that should appear in admin shipping panel:
- Order #QUS4808070009 (₹1.08) - Status: confirmed, Payment: completed
- Order #QUS6595820008 (₹2.16) - Status: confirmed, Payment: completed

## 🔧 Debug Steps

### Step 1: Check if server is running
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status":"OK","timestamp":"..."}`

### Step 2: Test the correct endpoint (with authentication)
You'll need to:
1. Login to admin panel first
2. Get the auth token from browser DevTools
3. Test the API call

**In Browser Console (F12):**
```javascript
// Get auth token
const token = localStorage.getItem('qusamba-token');
console.log('Token:', token);

// Test API call
fetch('/api/orders/admin/pending-approval', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('Orders pending approval:', data);
  console.log('Number of orders:', data.orders?.length || 0);
});
```

### Step 3: Check what the admin panel is actually calling
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh admin shipping page
4. Look for API calls to `/api/orders/...`
5. Check what endpoint is being called

### Step 4: Common Admin Panel Issues

#### Issue A: Wrong API Endpoint
❌ Admin panel calls: `/api/orders/admin/all`
✅ Should call: `/api/orders/admin/pending-approval`

#### Issue B: No Authentication
❌ Request without Authorization header
✅ Should include: `Authorization: Bearer <token>`

#### Issue C: JavaScript Error
❌ Frontend error prevents display
✅ Check browser Console for errors

#### Issue D: Wrong Status Filter
❌ Frontend filters out confirmed orders
✅ Should show orders with status: confirmed

## 🔍 Expected API Response

The `/api/orders/admin/pending-approval` endpoint should return:

```json
{
  "orders": [
    {
      "_id": "...",
      "orderNumber": "QUS4808070009",
      "status": "confirmed",
      "payment": { "status": "completed" },
      "totalAmount": 1.08,
      "user": { "email": "admin@qusamba.com" },
      "items": [...]
    },
    {
      "_id": "...",
      "orderNumber": "QUS6595820008", 
      "status": "confirmed",
      "payment": { "status": "completed" },
      "totalAmount": 2.16,
      "user": { "email": "customer@example.com" },
      "items": [...]
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 2,
  "automationEnabled": false
}
```

## 🎯 Quick Fix Options

### Option 1: Manual Order Approval
If you want to test shipping immediately:

```javascript
// In browser console, approve an order:
const orderId = 'ORDER_ID_HERE'; // Get from database
fetch(`/api/orders/admin/${orderId}/approve`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('qusamba-token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    notes: "Approved for testing"
  })
})
.then(res => res.json())
.then(data => console.log('Approval result:', data));
```

### Option 2: Enable Auto-Shipment
Disable manual approval temporarily:

```javascript
// Enable automation (orders will auto-ship after payment)
fetch('/api/admin/settings/toggle-shipping-automation', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('qusamba-token')}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Automation toggled:', data));
```

## 📞 Next Steps

1. **Check browser Network tab** for actual API calls
2. **Check browser Console** for JavaScript errors  
3. **Verify authentication** token is being sent
4. **Test API endpoints** manually using browser console

The backend is working perfectly - the issue is in the admin panel frontend integration!
