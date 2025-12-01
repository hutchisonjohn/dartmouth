# Test Email System Script
# Tests the customer service email polling system

Write-Host "=== Customer Service Email System Test ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check if tickets exist
Write-Host "1. Checking tickets in database..." -ForegroundColor Yellow
$ticketCount = npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT COUNT(*) as count FROM tickets;" 2>&1
Write-Host $ticketCount
Write-Host ""

# 2. Check if emails table exists and has data
Write-Host "2. Checking emails in database..." -ForegroundColor Yellow
$emailCount = npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT COUNT(*) as count FROM emails;" 2>&1
Write-Host $emailCount
Write-Host ""

# 3. Trigger manual email poll
Write-Host "3. Triggering manual email poll..." -ForegroundColor Yellow
Write-Host "URL: https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://dartmouth-os-worker.dartmouth.workers.dev/trigger-email-poll" -Method Get -TimeoutSec 30
    Write-Host "Success: $($response.success)" -ForegroundColor Green
    Write-Host "Message: $($response.message)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Logs:" -ForegroundColor Cyan
    foreach ($log in $response.logs) {
        if ($log -like "*ERROR*") {
            Write-Host $log -ForegroundColor Red
        } elseif ($log -like "*✅*") {
            Write-Host $log -ForegroundColor Green
        } elseif ($log -like "*⚠️*") {
            Write-Host $log -ForegroundColor Yellow
        } else {
            Write-Host $log
        }
    }
} catch {
    Write-Host "Error triggering email poll:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Checking tickets again..." -ForegroundColor Yellow
$ticketCountAfter = npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT COUNT(*) as count FROM tickets;" 2>&1
Write-Host $ticketCountAfter
Write-Host ""

Write-Host "5. Viewing recent tickets..." -ForegroundColor Yellow
$recentTickets = npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT ticket_number, subject, customer_email, status, created_at FROM tickets ORDER BY created_at DESC LIMIT 3;" 2>&1
Write-Host $recentTickets
Write-Host ""

Write-Host "=== Test Complete ===" -ForegroundColor Cyan

