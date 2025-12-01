# Deploy and Test Customer Service System
Write-Host "=== Deploy and Test Customer Service System ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Deploy
Write-Host "Step 1: Deploying worker..." -ForegroundColor Yellow
cd packages/worker
npx wrangler deploy
Write-Host ""

# Step 2: Wait a moment for deployment
Write-Host "Step 2: Waiting 5 seconds for deployment to propagate..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host ""

# Step 3: Trigger email poll
Write-Host "Step 3: Triggering email poll..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll" -Method Get -TimeoutSec 60
    
    Write-Host "✅ Email poll completed" -ForegroundColor Green
    Write-Host ""
    Write-Host "Logs:" -ForegroundColor Cyan
    foreach ($log in $response.logs) {
        if ($log -like "*ERROR*" -or $log -like "*❌*") {
            Write-Host $log -ForegroundColor Red
        } elseif ($log -like "*✅*" -or $log -like "*Created ticket*") {
            Write-Host $log -ForegroundColor Green
        } elseif ($log -like "*Found*emails*") {
            Write-Host $log -ForegroundColor Cyan
        } else {
            Write-Host $log -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Step 4: Check tickets
Write-Host "Step 4: Checking tickets in database..." -ForegroundColor Yellow
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT ticket_number, subject, customer_email, status, created_at FROM tickets ORDER BY created_at DESC LIMIT 5;"
Write-Host ""

Write-Host "=== Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check the dashboard: http://localhost:3000/tickets" -ForegroundColor Green

