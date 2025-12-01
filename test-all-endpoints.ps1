# Get token
$loginResponse = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/api/auth/login" -Method Post -Body '{"email":"john@dtf.com.au","password":"changeme123"}' -ContentType "application/json"
$token = $loginResponse.token
Write-Host "✅ Login successful! Token received." -ForegroundColor Green
Write-Host ""

# Test /api/auth/me
Write-Host "Testing /api/auth/me..." -ForegroundColor Yellow
$headers = @{ Authorization = "Bearer $token" }
$meResponse = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/api/auth/me" -Headers $headers
Write-Host "✅ User: $($meResponse.user.firstName) $($meResponse.user.lastName) - Role: $($meResponse.user.role)" -ForegroundColor Green
Write-Host ""

# Test /api/tickets
Write-Host "Testing /api/tickets..." -ForegroundColor Yellow
$ticketsResponse = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/api/tickets" -Headers $headers
Write-Host "✅ Tickets: $($ticketsResponse.tickets.Count) found" -ForegroundColor Green
Write-Host ""

# Test /api/staff
Write-Host "Testing /api/staff..." -ForegroundColor Yellow
$staffResponse = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/api/staff" -Headers $headers
Write-Host "✅ Staff: $($staffResponse.staff.Count) members" -ForegroundColor Green
foreach ($s in $staffResponse.staff) {
    Write-Host "  - $($s.first_name) $($s.last_name) ($($s.role))" -ForegroundColor Cyan
}
Write-Host ""

# Test /api/settings (admin only)
Write-Host "Testing /api/settings..." -ForegroundColor Yellow
$settingsResponse = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/api/settings" -Headers $headers
Write-Host "✅ Settings: $($settingsResponse.settings.Count) found" -ForegroundColor Green
foreach ($s in $settingsResponse.settings) {
    Write-Host "  - $($s.setting_key) = $($s.setting_value)" -ForegroundColor Cyan
}
Write-Host ""

Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green


