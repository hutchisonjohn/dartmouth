# Test Shopify Integration API Endpoints
# Run this after setting up Shopify credentials

$API_URL = "https://dartmouth-os-worker.dartmouth.workers.dev"
$TEST_EMAIL = "customer@example.com"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "SHOPIFY API ENDPOINT TESTS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# First, login to get auth token
Write-Host "1. Logging in..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/login" -Method Post -Body (@{
    email = "john@directtofilm.com.au"
    password = "password123"
} | ConvertTo-Json) -ContentType "application/json"

$token = $loginResponse.token
Write-Host "   ✓ Login successful" -ForegroundColor Green
Write-Host ""

# Test 1: Get customer by email
Write-Host "2. Testing GET /api/shopify/customer?email=$TEST_EMAIL" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$API_URL/api/shopify/customer?email=$TEST_EMAIL" -Method Get -Headers $headers
    
    if ($response.customer) {
        Write-Host "   ✓ Customer found" -ForegroundColor Green
        Write-Host "     Name: $($response.customer.firstName) $($response.customer.lastName)" -ForegroundColor Gray
        Write-Host "     Email: $($response.customer.email)" -ForegroundColor Gray
        Write-Host "     Total Spent: `$$($response.customer.totalSpent)" -ForegroundColor Gray
        Write-Host "     Orders: $($response.customer.ordersCount)" -ForegroundColor Gray
        Write-Host "     VIP: $($response.customer.isVIP)" -ForegroundColor Gray
    } elseif ($response.isMock) {
        Write-Host "   ⚠ Shopify not configured - returned mock data" -ForegroundColor Yellow
        Write-Host "     Message: $($response.message)" -ForegroundColor Gray
    } else {
        Write-Host "   ℹ Customer not found in Shopify" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get orders by email
Write-Host "3. Testing GET /api/shopify/orders?email=$TEST_EMAIL" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/shopify/orders?email=$TEST_EMAIL&limit=5" -Method Get -Headers $headers
    
    if ($response.orders -and $response.orders.Count -gt 0) {
        Write-Host "   ✓ Found $($response.orders.Count) orders" -ForegroundColor Green
        foreach ($order in $response.orders | Select-Object -First 3) {
            Write-Host "     Order: $($order.orderNumber) - `$$($order.totalPrice) - $($order.fulfillmentStatus)" -ForegroundColor Gray
        }
    } elseif ($response.isMock) {
        Write-Host "   ⚠ Shopify not configured - returned mock data" -ForegroundColor Yellow
    } else {
        Write-Host "   ℹ No orders found" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Search order by number
Write-Host "4. Testing GET /api/shopify/order?number=1001" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/shopify/order?number=1001" -Method Get -Headers $headers
    
    if ($response.order) {
        Write-Host "   ✓ Order found" -ForegroundColor Green
        Write-Host "     Order: $($response.order.orderNumber)" -ForegroundColor Gray
        Write-Host "     Total: `$$($response.order.totalPrice)" -ForegroundColor Gray
        Write-Host "     Status: $($response.order.fulfillmentStatus)" -ForegroundColor Gray
    } elseif ($response.isMock) {
        Write-Host "   ⚠ Shopify not configured - returned mock data" -ForegroundColor Yellow
    } else {
        Write-Host "   ℹ Order not found" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get full ticket data (main endpoint)
Write-Host "5. Testing GET /api/shopify/ticket-data?email=$TEST_EMAIL" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/shopify/ticket-data?email=$TEST_EMAIL" -Method Get -Headers $headers
    
    Write-Host "   Configuration Status: $($response.configured)" -ForegroundColor $(if ($response.configured) { "Green" } else { "Yellow" })
    
    if ($response.configured -and $response.customer) {
        Write-Host "   ✓ Full ticket data retrieved" -ForegroundColor Green
        Write-Host "     Customer: $($response.customer.firstName) $($response.customer.lastName)" -ForegroundColor Gray
        Write-Host "     Total Spent: `$$($response.customer.totalSpent)" -ForegroundColor Gray
        Write-Host "     Orders Count: $($response.orders.Count)" -ForegroundColor Gray
        
        if ($response.latestOrder) {
            Write-Host "     Latest Order: $($response.latestOrder.orderNumber) - `$$($response.latestOrder.totalPrice)" -ForegroundColor Gray
            if ($response.latestOrder.trackingNumber) {
                Write-Host "     Tracking: $($response.latestOrder.trackingNumber)" -ForegroundColor Gray
            }
        }
    } elseif (-not $response.configured) {
        Write-Host "   ⚠ Shopify not configured" -ForegroundColor Yellow
        Write-Host "     Message: $($response.message)" -ForegroundColor Gray
    } else {
        Write-Host "   ℹ Customer not found" -ForegroundColor Cyan
        Write-Host "     Message: $($response.message)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All Shopify API endpoints tested." -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If you see 'Shopify not configured' messages:" -ForegroundColor Gray
Write-Host "   - Create a Private App in Shopify Admin" -ForegroundColor Gray
Write-Host "   - Get the Admin API access token" -ForegroundColor Gray
Write-Host "   - Run: npx wrangler secret put SHOPIFY_DOMAIN" -ForegroundColor Gray
Write-Host "   - Run: npx wrangler secret put SHOPIFY_ACCESS_TOKEN" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test with real customer email from your Shopify store" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open dashboard and click Shopify button on any ticket" -ForegroundColor Gray
Write-Host ""


