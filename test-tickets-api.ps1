# Test Tickets API
# This will login and check what tickets the API returns

$baseUrl = "https://dartmouth-os-worker.dartmouth.workers.dev"

# Login
Write-Host "Logging in..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body (@{email="admin@dtf.com.au"; password="admin123"} | ConvertTo-Json) -ContentType "application/json"

$token = $loginResponse.token
Write-Host "Token: $token" -ForegroundColor Green

# Get tickets
Write-Host "`nFetching tickets..." -ForegroundColor Yellow
$ticketsResponse = Invoke-RestMethod -Uri "$baseUrl/api/tickets" -Headers @{Authorization="Bearer $token"}

Write-Host "`nTickets count: $($ticketsResponse.tickets.Count)" -ForegroundColor Cyan
Write-Host "Tickets:" -ForegroundColor Cyan
$ticketsResponse.tickets | Format-Table ticket_number, customer_email, subject -AutoSize

