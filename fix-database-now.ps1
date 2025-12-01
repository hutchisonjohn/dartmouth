# Fix Database - Delete All Tickets
Write-Host "Deleting all tickets from dartmouth-os-db..." -ForegroundColor Yellow

cd packages/worker

# Delete in correct order to avoid foreign key issues
Write-Host "1. Deleting ticket_messages..." -ForegroundColor Cyan
npx wrangler d1 execute dartmouth-os-db --remote --command "PRAGMA foreign_keys=OFF;" 2>&1 | Out-Null
npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM ticket_messages;" 2>&1 | Out-Null

Write-Host "2. Deleting emails..." -ForegroundColor Cyan
npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM emails;" 2>&1 | Out-Null

Write-Host "3. Deleting internal_notes..." -ForegroundColor Cyan
npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM internal_notes;" 2>&1 | Out-Null

Write-Host "4. Deleting escalations..." -ForegroundColor Cyan
npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM escalations;" 2>&1 | Out-Null

Write-Host "5. Deleting ticket_assignments..." -ForegroundColor Cyan
npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM ticket_assignments;" 2>&1 | Out-Null

Write-Host "6. Deleting tickets..." -ForegroundColor Cyan
npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM tickets;" 2>&1 | Out-Null

Write-Host ""
Write-Host "Checking count..." -ForegroundColor Yellow
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT COUNT(*) as count FROM tickets;"

Write-Host ""
Write-Host "Done!" -ForegroundColor Green

