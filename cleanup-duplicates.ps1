# Cleanup Duplicate Tickets
Write-Host "=== Cleanup Duplicate Tickets ===" -ForegroundColor Cyan
Write-Host ""

cd packages/worker

Write-Host "Current tickets:" -ForegroundColor Yellow
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT ticket_number, subject, customer_email, created_at FROM tickets ORDER BY created_at DESC;"

Write-Host ""
Write-Host "Deleting duplicate tickets (keeping only the first one)..." -ForegroundColor Yellow

# Delete all but the first ticket for TEST 3
npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM tickets WHERE subject LIKE '%test 3%' AND ticket_number != (SELECT ticket_number FROM tickets WHERE subject LIKE '%test 3%' ORDER BY created_at ASC LIMIT 1);"

Write-Host ""
Write-Host "Remaining tickets:" -ForegroundColor Green
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT ticket_number, subject, customer_email, created_at FROM tickets ORDER BY created_at DESC;"

Write-Host ""
Write-Host "=== Cleanup Complete ===" -ForegroundColor Cyan

