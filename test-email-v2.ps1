# Email System V2 - Test Script
Write-Host "Testing Email System V2..." -ForegroundColor Cyan

$baseUrl = "https://dartmouth-os-worker.dartmouth.workers.dev"

# Test 1: Full Email Flow
Write-Host "`n=== Test 1: Full Email Flow ===" -ForegroundColor Yellow

$body = @{
    customerEmail = "john.hutchison@example.com"
    customerName = "John Hutchison"
    subject = "Question about DTF printing"
    initialMessage = "Hi, I would like to know more about your DTF printing services. What sizes do you support?"
    replyMessage = "Thank you for your inquiry! We support all standard sizes from A4 to A0. Our DTF prints are high quality with vibrant colors. Would you like a quote?"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v2/test/full-flow" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Full flow test completed!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Full flow test failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 2: List Conversations
Write-Host "`n=== Test 2: List Conversations ===" -ForegroundColor Yellow

try {
    $conversations = Invoke-RestMethod -Uri "$baseUrl/api/v2/test/conversations" -Method Get
    Write-Host "✅ Found $($conversations.conversations.Count) conversations" -ForegroundColor Green
    $conversations.conversations | ForEach-Object {
        Write-Host "  - $($_.subject) from $($_.customer_email)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Failed to list conversations!" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n✅ Testing complete!" -ForegroundColor Green
Write-Host "Check EMAIL_V2_TEST_GUIDE.md for more tests" -ForegroundColor Cyan

