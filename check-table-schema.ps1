# Check Table Schema
Write-Host "Checking ticket_messages table schema..." -ForegroundColor Cyan
Write-Host ""

cd packages/worker

# Check if table exists and its schema
Write-Host "Table info for ticket_messages:" -ForegroundColor Yellow
npx wrangler d1 execute dartmouth-os-db --remote --command "PRAGMA table_info(ticket_messages);"

Write-Host ""
Write-Host "Checking if we can query the table:" -ForegroundColor Yellow
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT COUNT(*) as count FROM ticket_messages;"

