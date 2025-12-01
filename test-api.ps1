# Test Customer Service API

Write-Host "Testing API Endpoints..." -ForegroundColor Green
Write-Host ""

# Test 1: Login
Write-Host "1. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "john@dtf.com.au"
    password = "changeme123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0,50))..." -ForegroundColor Cyan
    Write-Host "User: $($response.user.firstName) $($response.user.lastName) ($($response.user.role))" -ForegroundColor Cyan
    $token = $response.token
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Get current user
Write-Host "2. Testing Get Current User..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/api/auth/me" -Method Get -Headers $headers
    Write-Host "✅ Get user successful!" -ForegroundColor Green
    Write-Host "User: $($response.user.firstName) $($response.user.lastName)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get user failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: List tickets
Write-Host "3. Testing List Tickets..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/api/tickets" -Method Get -Headers $headers
    Write-Host "✅ List tickets successful!" -ForegroundColor Green
    Write-Host "Tickets found: $($response.tickets.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ List tickets failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: List staff
Write-Host "4. Testing List Staff..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/api/staff" -Method Get -Headers $headers
    Write-Host "✅ List staff successful!" -ForegroundColor Green
    Write-Host "Staff members: $($response.staff.Count)" -ForegroundColor Cyan
    foreach ($staff in $response.staff) {
        Write-Host "  - $($staff.first_name) $($staff.last_name) ($($staff.role))" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ List staff failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Get settings (admin only)
Write-Host "5. Testing Get Settings (Admin)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/api/settings" -Method Get -Headers $headers
    Write-Host "✅ Get settings successful!" -ForegroundColor Green
    Write-Host "Settings found: $($response.settings.Count)" -ForegroundColor Cyan
    foreach ($setting in $response.settings) {
        Write-Host "  - $($setting.setting_key) = $($setting.setting_value)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Get settings failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ API Testing Complete!" -ForegroundColor Green


