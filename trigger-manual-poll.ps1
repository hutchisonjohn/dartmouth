# Manual Email Poll Trigger
# This script triggers the email polling manually for testing

Write-Host "=== Manual Email Poll Trigger ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Triggering email poll at: https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll" -Method Get -TimeoutSec 60
    
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host "  Success: $($response.success)" -ForegroundColor $(if ($response.success) { "Green" } else { "Red" })
    Write-Host "  Message: $($response.message)" -ForegroundColor White
    Write-Host ""
    
    if ($response.logs) {
        Write-Host "Logs:" -ForegroundColor Cyan
        Write-Host "----------------------------------------" -ForegroundColor Gray
        foreach ($log in $response.logs) {
            if ($log -like "*ERROR*" -or $log -like "*❌*") {
                Write-Host $log -ForegroundColor Red
            } elseif ($log -like "*✅*" -or $log -like "*Created ticket*") {
                Write-Host $log -ForegroundColor Green
            } elseif ($log -like "*⚠️*" -or $log -like "*WARNING*") {
                Write-Host $log -ForegroundColor Yellow
            } elseif ($log -like "*Found*emails*") {
                Write-Host $log -ForegroundColor Cyan
            } else {
                Write-Host $log -ForegroundColor White
            }
        }
        Write-Host "----------------------------------------" -ForegroundColor Gray
    }
    
    if ($response.error) {
        Write-Host ""
        Write-Host "Error Details:" -ForegroundColor Red
        Write-Host $response.error -ForegroundColor Red
        if ($response.stack) {
            Write-Host ""
            Write-Host "Stack Trace:" -ForegroundColor Yellow
            Write-Host $response.stack -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "This could mean:" -ForegroundColor Yellow
    Write-Host "  1. The worker is not responding (timeout)" -ForegroundColor White
    Write-Host "  2. Network connectivity issue" -ForegroundColor White
    Write-Host "  3. The endpoint doesn't exist" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Check the database for tickets:" -ForegroundColor Yellow
Write-Host "  cd packages/worker" -ForegroundColor White
Write-Host "  npx wrangler d1 execute dartmouth-os-db --remote --command `"SELECT COUNT(*) as count FROM tickets;`"" -ForegroundColor White

