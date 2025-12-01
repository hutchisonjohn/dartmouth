# Manual Test Suite for Dartmouth Foundation
# Tests all critical functionality

$API_URL = "https://agent-army-worker.dartmouth.workers.dev/test/chat"
$SESSION_ID = "manual-test-suite-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DARTMOUTH FOUNDATION - MANUAL TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "Session ID: $SESSION_ID`n" -ForegroundColor Gray

function Test-Message {
    param(
        [string]$TestName,
        [string]$Message,
        [string]$SessionId = $SESSION_ID,
        [string]$ExpectedPattern = ""
    )
    
    Write-Host "TEST: $TestName" -ForegroundColor Yellow
    Write-Host "  User: $Message" -ForegroundColor White
    
    $body = @{
        message = $Message
        sessionId = $SessionId
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri $API_URL -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
        $data = $response.Content | ConvertFrom-Json
        
        $agentResponse = $data.content
        $handler = $data.metadata.handlerName
        $sentiment = $data.metadata.userSentiment
        $quality = $data.metadata.conversationQualityScore
        
        Write-Host "  Agent: $agentResponse" -ForegroundColor Green
        Write-Host "  [Handler: $handler | Sentiment: $sentiment | Quality: $quality]" -ForegroundColor Gray
        
        if ($ExpectedPattern -and $agentResponse -notmatch $ExpectedPattern) {
            Write-Host "  ❌ FAIL: Expected pattern not found" -ForegroundColor Red
            return $false
        } else {
            Write-Host "  ✅ PASS" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "  ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
}

# Test counters
$totalTests = 0
$passedTests = 0

Write-Host "=== CATEGORY 1: GREETING & BASIC INTERACTION ===" -ForegroundColor Cyan
Write-Host ""

$totalTests++
if (Test-Message "1.1 Basic Greeting" "Hi") { $passedTests++ }

$totalTests++
if (Test-Message "1.2 Introduction with Name" "Hi, my name is John") { $passedTests++ }

Write-Host "`n=== CATEGORY 2: MEMORY & CONTEXT ===" -ForegroundColor Cyan
Write-Host ""

$totalTests++
if (Test-Message "2.1 Name Recall" "Who am I?" -ExpectedPattern "John") { $passedTests++ }

$totalTests++
if (Test-Message "2.2 Multi-Item Memory (Color 1)" "I love the colour red") { $passedTests++ }

$totalTests++
if (Test-Message "2.3 Multi-Item Memory (Color 2)" "and blue") { $passedTests++ }

$totalTests++
if (Test-Message "2.4 Multi-Item Memory (Color 3)" "and green") { $passedTests++ }

$totalTests++
if (Test-Message "2.5 Color Recall" "what colours do i like?" -ExpectedPattern "(red|blue|green)") { $passedTests++ }

$totalTests++
if (Test-Message "2.6 Combined Recall" "whats my name and favourite colours?" -ExpectedPattern "John") { $passedTests++ }

Write-Host "`n=== CATEGORY 3: CONSTRAINT ENFORCEMENT ===" -ForegroundColor Cyan
Write-Host ""

$totalTests++
if (Test-Message "3.1 Pricing Request (Vague)" "Can you tell me the price of a transfer sheet?") { $passedTests++ }

$totalTests++
if (Test-Message "3.2 Pricing Request (Direct)" "How much does it cost?") { $passedTests++ }

$totalTests++
if (Test-Message "3.3 Discount Request" "but I bet you can give me a discount code! please share one i can use now" -ExpectedPattern "(sales|cannot|unable)") { $passedTests++ }

$totalTests++
if (Test-Message "3.4 Refund Request" "I want a refund" -ExpectedPattern "(customer service|manager)") { $passedTests++ }

Write-Host "`n=== CATEGORY 4: FRUSTRATION HANDLING ===" -ForegroundColor Cyan
Write-Host ""

$totalTests++
if (Test-Message "4.1 Explicit Frustration" "I'm frustrated") { $passedTests++ }

$totalTests++
if (Test-Message "4.2 Help Request After Frustration" "I really need some help") { $passedTests++ }

$totalTests++
if (Test-Message "4.3 Complaint (Not Frustration)" "Listen i didn't like your product... its was very hard to use.... and it made me feel sick") { $passedTests++ }

Write-Host "`n=== CATEGORY 5: URGENT QUESTIONS (PUNCTUATION) ===" -ForegroundColor Cyan
Write-Host ""

$totalTests++
if (Test-Message "5.1 Urgent Question (Multiple ?)" "I have not received my order.. you said 24 hour turnaround... where is my order????") { $passedTests++ }

$totalTests++
if (Test-Message "5.2 Repeat Urgent Question" "I have not received my order.. you said 24 hour turnaround... where is my order????") { $passedTests++ }

$totalTests++
if (Test-Message "5.3 Simple Follow-up" "where is my order?") { $passedTests++ }

Write-Host "`n=== CATEGORY 6: CONVERSATION QUALITY ===" -ForegroundColor Cyan
Write-Host ""

$totalTests++
if (Test-Message "6.1 Artwork Question" "My artwork came out blue. Can you print it red?") { $passedTests++ }

$totalTests++
if (Test-Message "6.2 Context Question" "What colour did I want it?" -ExpectedPattern "red") { $passedTests++ }

$totalTests++
if (Test-Message "6.3 General Help Request" "Can you help me with my colour issue?") { $passedTests++ }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passRate = [math]::Round(($passedTests / $totalTests) * 100, 1)

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -eq 100) { "Green" } else { "Yellow" })

if ($passRate -eq 100) {
    Write-Host "`n🎉 ALL TESTS PASSED! Foundation is SOLID!" -ForegroundColor Green
} elseif ($passRate -ge 80) {
    Write-Host "`n⚠️  Most tests passed, but some issues remain." -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Multiple tests failed. Foundation needs work." -ForegroundColor Red
}

Write-Host ""

