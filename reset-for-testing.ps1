# Reset Database for Testing
# This will delete all tickets and emails to start fresh

Write-Host "Resetting database for testing..." -ForegroundColor Yellow

cd packages/worker

# Delete all tickets
Write-Host "`nDeleting all tickets..." -ForegroundColor Yellow
npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM ticket_messages;"
npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM internal_notes;"
npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM tickets;"

# Delete all emails
Write-Host "`nDeleting all emails..." -ForegroundColor Yellow
npx wrangler d1 execute dartmouth-os-db --remote --command "DELETE FROM emails;"

# Verify deletion
Write-Host "`nVerifying deletion..." -ForegroundColor Green
Write-Host "Tickets remaining:" -ForegroundColor Cyan
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT COUNT(*) as count FROM tickets;"

Write-Host "`nEmails remaining:" -ForegroundColor Cyan
npx wrangler d1 execute dartmouth-os-db --remote --command "SELECT COUNT(*) as count FROM emails;"

Write-Host "`nDatabase reset complete!" -ForegroundColor Green
Write-Host "Now send a test email from johnpaulhutchison@gmail.com" -ForegroundColor Cyan
Write-Host "Then trigger the email poll manually" -ForegroundColor Cyan
