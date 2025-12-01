# Test Email Poll
$response = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll"
Write-Host "Success: $($response.success)" -ForegroundColor Green
Write-Host "Message: $($response.message)" -ForegroundColor Cyan
Write-Host "`nLogs:" -ForegroundColor Yellow
$response.logs | ForEach-Object { Write-Host $_ }

