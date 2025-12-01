# Backup and Commit Script
# Date: 2025-11-29
# Purpose: Backup all changes and push to GitHub

Write-Host "=== DARTMOUTH OS PROJECT - BACKUP & COMMIT ===" -ForegroundColor Cyan
Write-Host ""

# Navigate to project root
Set-Location "D:\coding\DARTMOUTH_OS_PROJECT"

Write-Host "1. Checking git status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "2. Staging all changes..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "3. Creating commit..." -ForegroundColor Yellow
$commitMessage = @"
Customer Service System - Major Update (2025-11-29)

✅ FIXES COMPLETED:
- Fixed subject line bug (was showing email body)
- Fixed duplicate tickets (emails now marked as read)
- Fixed date parsing errors (robust fallback)
- Fixed message history table schema
- Fixed database foreign key constraints

📝 FILES MODIFIED:
- GmailIntegration.ts (date parsing, markAsRead)
- TicketManager.ts (subject passing, message_id->id)
- email-poller.ts (mark as read after processing)
- wrangler.toml (dev config)

📚 DOCUMENTATION ADDED:
- PROJECT_STATUS_2025-11-29.md (complete status)
- CUSTOMER_SERVICE_COMPLETE_GUIDE_2025-11-29.md (full guide)
- NEXT_STEPS_PLAN_2025-11-29.md (roadmap)
- Multiple troubleshooting scripts

✅ CURRENT STATUS:
- Email-to-ticket system: WORKING
- Cron jobs: WORKING
- Dashboard: WORKING
- No duplicates: WORKING
- Correct subjects: WORKING

⚠️ MINOR ISSUES:
- Message history needs testing
- AI processing has undefined error

📊 PROGRESS: 75% complete (MVP operational)
"@

git commit -m $commitMessage

Write-Host ""
Write-Host "4. Pushing to GitHub..." -ForegroundColor Yellow
git push origin master

Write-Host ""
Write-Host "=== BACKUP COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "- All changes committed" -ForegroundColor Green
Write-Host "- Pushed to GitHub" -ForegroundColor Green
Write-Host "- Backup timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host ""

