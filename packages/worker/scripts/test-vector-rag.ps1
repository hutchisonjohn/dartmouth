# Vector RAG Testing Script
# Tests the Vector Embeddings RAG system with questions from all 9 knowledge documents

$API_BASE = "https://dartmouth-os-worker.dartmouth.workers.dev"

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "VECTOR RAG TESTING SCRIPT" -ForegroundColor Cyan
Write-Host "Testing semantic search with questions from all knowledge documents" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

# Test cases with expected keywords in the AI response
$testCases = @(
    # DTF TRANSFERS (5 tests)
    @{ Category = "DTF Transfers"; Question = "What temperature should I use for DTF transfers?"; Keywords = @("150", "160") },
    @{ Category = "DTF Transfers"; Question = "How long should I press DTF transfers?"; Keywords = @("8", "12", "seconds") },
    @{ Category = "DTF Transfers"; Question = "Should I hot peel or cold peel DTF?"; Keywords = @("hot", "peel") },
    @{ Category = "DTF Transfers"; Question = "What fabrics work with DTF?"; Keywords = @("cotton", "polyester") },
    @{ Category = "DTF Transfers"; Question = "How many washes do DTF transfers last?"; Keywords = @("50", "52", "wash") },
    
    # UV DTF TRANSFERS (3 tests)
    @{ Category = "UV DTF"; Question = "Do UV DTF transfers need a heat press?"; Keywords = @("no", "peel", "stick") },
    @{ Category = "UV DTF"; Question = "What surfaces work with UV DTF?"; Keywords = @("glass", "metal", "plastic") },
    @{ Category = "UV DTF"; Question = "Are UV DTF transfers waterproof?"; Keywords = @("waterproof", "water", "resistant") },
    
    # SHIPPING (2 tests)
    @{ Category = "Shipping"; Question = "How long to dispatch orders?"; Keywords = @("24", "hour", "business") },
    @{ Category = "Shipping"; Question = "Do you provide tracking?"; Keywords = @("tracking", "number") },
    
    # RETURNS (2 tests)
    @{ Category = "Returns"; Question = "Can I return if I change my mind?"; Keywords = @("no", "refund", "custom") },
    @{ Category = "Returns"; Question = "How long to report faulty product?"; Keywords = @("7", "day") },
    
    # TERMS (2 tests)
    @{ Category = "Terms"; Question = "Can you print neon colors?"; Keywords = @("no", "neon", "CMYK") },
    @{ Category = "Terms"; Question = "What are the sizing tolerances?"; Keywords = @("1cm", "2.5cm", "tolerance") },
    
    # ORDERING (3 tests)
    @{ Category = "Ordering"; Question = "What file formats do you accept?"; Keywords = @("PNG", "PDF") },
    @{ Category = "Ordering"; Question = "Do you have minimum orders?"; Keywords = @("no", "minimum") },
    @{ Category = "Ordering"; Question = "Do you offer colour matching?"; Keywords = @("colour", "match", "30") },
    
    # FAQ (3 tests)
    @{ Category = "FAQ"; Question = "Where is Amazing Transfers located?"; Keywords = @("Coolum", "Beach", "QLD") },
    @{ Category = "FAQ"; Question = "What is the contact email?"; Keywords = @("info@amazingtransfers.com.au", "email") },
    @{ Category = "FAQ"; Question = "Do you offer free samples?"; Keywords = @("free", "sample") }
)

$passed = 0
$failed = 0
$results = @()
$totalTests = $testCases.Count

Write-Host "Running $totalTests tests across all knowledge documents..." -ForegroundColor Yellow
Write-Host ""

$currentCategory = ""
foreach ($test in $testCases) {
    # Print category header when it changes
    if ($test.Category -ne $currentCategory) {
        $currentCategory = $test.Category
        Write-Host ""
        Write-Host "--- $currentCategory ---" -ForegroundColor Magenta
    }
    
    Write-Host "  Testing: $($test.Question.Substring(0, [Math]::Min(50, $test.Question.Length)))... " -NoNewline
    
    try {
        # Start a new conversation
        $startBody = '{"customer":{"name":"RAG Tester","email":"test@ragtest.com"}}'
        $startResponse = Invoke-RestMethod -Uri "$API_BASE/api/chat/start" -Method POST -ContentType "application/json" -Body $startBody -ErrorAction Stop
        $conversationId = $startResponse.conversationId
        
        # Small delay
        Start-Sleep -Milliseconds 500
        
        # Send the question
        $msgBody = @{
            conversationId = $conversationId
            message = $test.Question
        } | ConvertTo-Json
        
        $messageResponse = Invoke-RestMethod -Uri "$API_BASE/api/chat/message" -Method POST -ContentType "application/json" -Body $msgBody -ErrorAction Stop
        $aiResponse = $messageResponse.response
        
        if (-not $aiResponse) {
            Write-Host "NO RESPONSE" -ForegroundColor Red
            $failed++
            $results += @{
                Category = $test.Category
                Question = $test.Question
                Passed = $false
                Error = "No AI response"
            }
            continue
        }
        
        # Check for keywords (case insensitive)
        $foundKeywords = @()
        $missingKeywords = @()
        
        foreach ($keyword in $test.Keywords) {
            if ($aiResponse -imatch [regex]::Escape($keyword)) {
                $foundKeywords += $keyword
            } else {
                $missingKeywords += $keyword
            }
        }
        
        # Pass if at least 50% of keywords found
        $passThreshold = [math]::Ceiling($test.Keywords.Count * 0.5)
        $testPassed = $foundKeywords.Count -ge $passThreshold
        
        if ($testPassed) {
            Write-Host "PASS" -ForegroundColor Green -NoNewline
            Write-Host " ($($foundKeywords.Count)/$($test.Keywords.Count) keywords)"
            $passed++
        } else {
            Write-Host "FAIL" -ForegroundColor Red -NoNewline
            Write-Host " ($($foundKeywords.Count)/$($test.Keywords.Count) keywords)"
            Write-Host "    Missing: $($missingKeywords -join ', ')" -ForegroundColor Yellow
            Write-Host "    Response: $($aiResponse.Substring(0, [math]::Min(100, $aiResponse.Length)))..." -ForegroundColor Gray
            $failed++
        }
        
        $results += @{
            Category = $test.Category
            Question = $test.Question
            Passed = $testPassed
            FoundKeywords = $foundKeywords
            MissingKeywords = $missingKeywords
            Response = $aiResponse
        }
        
        # Small delay between tests
        Start-Sleep -Milliseconds 300
        
    } catch {
        Write-Host "ERROR: $_" -ForegroundColor Red
        $failed++
        $results += @{
            Category = $test.Category
            Question = $test.Question
            Passed = $false
            Error = $_.Exception.Message
        }
    }
}

# Summary
Write-Host ""
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $totalTests"
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
$passRate = [math]::Round(($passed / $totalTests) * 100, 1)
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 50) { "Yellow" } else { "Red" })
Write-Host ""

# Category breakdown
Write-Host "By Category:" -ForegroundColor Cyan
$categories = $testCases | ForEach-Object { $_.Category } | Select-Object -Unique
foreach ($cat in $categories) {
    $catTests = $results | Where-Object { $_.Category -eq $cat }
    $catPassed = ($catTests | Where-Object { $_.Passed }).Count
    $catTotal = $catTests.Count
    $emoji = if ($catPassed -eq $catTotal) { "[PASS]" } elseif ($catPassed -gt 0) { "[PART]" } else { "[FAIL]" }
    $color = if ($catPassed -eq $catTotal) { "Green" } elseif ($catPassed -gt 0) { "Yellow" } else { "Red" }
    Write-Host "  $emoji $cat`: $catPassed/$catTotal" -ForegroundColor $color
}

# Failed tests detail
$failedTests = $results | Where-Object { -not $_.Passed }
if ($failedTests.Count -gt 0) {
    Write-Host ""
    Write-Host "FAILED TESTS DETAIL:" -ForegroundColor Red
    foreach ($test in $failedTests) {
        Write-Host "  - $($test.Question)" -ForegroundColor Yellow
        if ($test.Error) {
            Write-Host "    Error: $($test.Error)" -ForegroundColor Red
        } elseif ($test.MissingKeywords) {
            Write-Host "    Missing: $($test.MissingKeywords -join ', ')" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "Testing complete!" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
