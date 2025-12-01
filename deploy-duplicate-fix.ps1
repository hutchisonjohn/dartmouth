# Deploy Duplicate Prevention Fix
Write-Host "=== Deploy Duplicate Prevention Fix ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "What this fix does:" -ForegroundColor Yellow
Write-Host "  1. Marks emails as READ in Gmail after processing" -ForegroundColor White
Write-Host "  2. Uses Gmail message ID instead of random UUID" -ForegroundColor White
Write-Host "  3. Prevents duplicate ticket creation" -ForegroundColor White
Write-Host ""

Write-Host "Deploying..." -ForegroundColor Yellow
cd packages/worker
npx wrangler deploy

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run .\cleanup-duplicates.ps1 to remove duplicate tickets" -ForegroundColor White
Write-Host "  2. Send a new test email" -ForegroundColor White
Write-Host "  3. Trigger: Invoke-RestMethod -Uri 'https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll'" -ForegroundColor White
Write-Host "  4. Verify only ONE ticket is created" -ForegroundColor White
Write-Host "  5. Trigger again - should find 0 unread emails (all marked as read)" -ForegroundColor White

