Write-Host "Checking for tickets in database..." -ForegroundColor Yellow
cd packages/worker
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT ticket_number, customer_email, subject, status, created_at FROM tickets ORDER BY created_at DESC LIMIT 5;"


