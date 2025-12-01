# Check Cron Job Status
Write-Host "Checking Cloudflare Worker logs for cron job activity..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Run this command to view logs:" -ForegroundColor Yellow
Write-Host "npx wrangler tail --format pretty" -ForegroundColor Green
Write-Host ""
Write-Host "Or check specific time range:" -ForegroundColor Yellow
Write-Host "npx wrangler tail --format pretty --since 30m" -ForegroundColor Green
Write-Host ""
Write-Host "Look for lines containing:" -ForegroundColor Yellow
Write-Host "  - [Scheduled] Email polling job triggered" -ForegroundColor White
Write-Host "  - [EmailPoller] Starting email polling job" -ForegroundColor White
Write-Host ""

