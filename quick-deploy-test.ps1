# Quick Deploy and Test
Write-Host "=== Quick Deploy and Test ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Deploying fix..." -ForegroundColor Yellow
cd packages/worker
npx wrangler deploy
Write-Host ""

Write-Host "Waiting 3 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host ""

Write-Host "Triggering email poll..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll" -Method Get -TimeoutSec 60
    
    Write-Host "✅ Complete" -ForegroundColor Green
    Write-Host ""
    
    # Show key logs
    $response.logs | ForEach-Object {
        if ($_ -like "*Found*emails*") {
            Write-Host $_ -ForegroundColor Cyan
        } elseif ($_ -like "*Created ticket*") {
            Write-Host $_ -ForegroundColor Green
        } elseif ($_ -like "*ERROR*" -or $_ -like "*❌*") {
            Write-Host $_ -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    $response.logs | Where-Object { $_ -like "*Summary*" -or $_ -like "*Emails processed*" -or $_ -like "*Tickets created*" -or $_ -like "*Errors*" } | ForEach-Object {
        Write-Host $_
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking database..." -ForegroundColor Yellow
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT ticket_number, subject, customer_email, created_at FROM tickets ORDER BY created_at DESC LIMIT 3;"

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan
Write-Host "Check dashboard: http://localhost:3000/tickets" -ForegroundColor Green

