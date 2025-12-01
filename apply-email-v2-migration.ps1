# Apply Email System V2 Migration
Write-Host "Applying Email System V2 migration to D1 database..." -ForegroundColor Cyan

cd packages/worker
npx wrangler d1 execute dartmouth-os-db --file=./migrations/0011_email_system_v2.sql --remote

Write-Host "`n✅ Migration applied!" -ForegroundColor Green
Write-Host "Email System V2 schema is now ready." -ForegroundColor Green

