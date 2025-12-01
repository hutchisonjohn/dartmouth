$body = '{"email":"john@dtf.com.au","password":"changeme123"}'
$response = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/api/auth/login" -Method Post -Body $body -ContentType "application/json"
Write-Host "Response:" -ForegroundColor Green
$response | ConvertTo-Json


