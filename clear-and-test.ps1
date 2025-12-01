# Clear database and test
Write-Host "Clearing database..." -ForegroundColor Yellow
cd packages/worker

npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM tickets;"
npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM emails;"

Write-Host ""
Write-Host "Database cleared. Now mark the TEST 6 email as read in Gmail manually." -ForegroundColor Cyan
Write-Host "Then send a fresh TEST 7 email and wait for cron at the next 5-minute mark." -ForegroundColor Cyan
Write-Host ""
Write-Host "Or trigger manually:" -ForegroundColor Yellow
Write-Host "  Invoke-RestMethod -Uri 'https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll'" -ForegroundColor White

