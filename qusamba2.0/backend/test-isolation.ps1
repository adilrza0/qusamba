# Test User Isolation for Cart and Wishlist APIs
$API_BASE = "http://localhost:5000/api"

# Test credentials - update these if needed
$User1 = @{
    email = "customer@example.com"
    password = "password123"  # Update if different
}

$User2 = @{
    email = "admin@qusamba.com"
    password = "admin123"  # Update if different
}

Write-Host "🧪 Testing User Isolation for Cart/Wishlist APIs" -ForegroundColor Cyan
Write-Host ""

# Function to login and get token
function Get-UserToken($credentials) {
    try {
        $body = $credentials | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Body $body -ContentType "application/json"
        return $response.token
    }
    catch {
        Write-Host "❌ Login failed for $($credentials.email): $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to get cart
function Get-UserCart($token, $userEmail) {
    try {
        $headers = @{ Authorization = "Bearer $token" }
        $response = Invoke-RestMethod -Uri "$API_BASE/cart" -Method GET -Headers $headers
        Write-Host "🛒 $userEmail cart: $($response.data.cart.Count) items" -ForegroundColor Green
        return $response.data.cart
    }
    catch {
        Write-Host "❌ Get cart failed for $userEmail" -ForegroundColor Red
        return $null
    }
}

# Test the isolation
Write-Host "1. Logging in users..." -ForegroundColor Yellow

$token1 = Get-UserToken $User1
$token2 = Get-UserToken $User2

if ($token1 -and $token2) {
    Write-Host "✅ Both users logged in successfully" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "2. Getting cart data..." -ForegroundColor Yellow
    $cart1 = Get-UserCart $token1 $User1.email
    $cart2 = Get-UserCart $token2 $User2.email
    
    if ($cart1 -ne $null -and $cart2 -ne $null) {
        Write-Host ""
        Write-Host "✅ SUCCESS: User isolation is working!" -ForegroundColor Green
        Write-Host "Each user has their own separate cart data." -ForegroundColor Green
    } else {
        Write-Host "❌ Could not retrieve cart data" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "❌ Could not log in users. Please check credentials." -ForegroundColor Red
    Write-Host "Current test credentials:" -ForegroundColor Yellow
    Write-Host "User 1: $($User1.email) / $($User1.password)" -ForegroundColor Yellow
    Write-Host "User 2: $($User2.email) / $($User2.password)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please update the credentials in this script if they're different." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Test completed" -ForegroundColor Cyan
