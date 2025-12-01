# Deploy worker with manual trigger
Write-Host "Deploying worker..." -ForegroundColor Yellow
cd packages/worker
npx wrangler deploy

Write-Host "`nTriggering email poll..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll"
Write-Host "Response:" -ForegroundColor Green
$response | ConvertTo-Json


