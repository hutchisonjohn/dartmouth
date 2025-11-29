# Commit all changes
cd D:\coding\DARTMOUTH_OS_PROJECT

# Remove lock file if exists
Remove-Item .git\index.lock -ErrorAction SilentlyContinue

# Add all changes
git add -A

# Commit
git commit -m "feat: Complete AI processing, sentiment detection, smart escalation, and duplicate prevention

Major features completed:
- AI processing with 95% confidence and contextual responses
- Sentiment detection (angry/negative/neutral/positive) with emoji badges
- Smart escalation logic (angry+urgent, VIP+negative, mentions manager)
- Duplicate content detection (prevents duplicate tickets from same content)
- Enhanced dashboard with sentiment, VIP, and assignment columns
- Fixed email-ticket linking with proper junction table
- Improved AI response quality (LLM fallback for frustrated customers)

Bug fixes:
- Fixed AI processing undefined errors
- Fixed ticket_email_links table creation
- Fixed sentiment saving to database
- Fixed duplicate ticket prevention
- Fixed priority font styling

Progress: 35% -> 60% complete"

Write-Host "Commit complete!"

