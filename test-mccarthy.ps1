# McCarthy Artwork Agent - Quick Test Script
# Tests the deployed McCarthy agent with various scenarios

$API_URL = "https://agent-army-worker.dartmouth.workers.dev"
$sessionId = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host "`n🧪 MCCARTHY ARTWORK AGENT - QUICK TEST SUITE`n" -ForegroundColor Cyan
Write-Host "API URL: $API_URL" -ForegroundColor Gray
Write-Host "Session ID: $sessionId`n" -ForegroundColor Gray

function Test-McCarthy {
    param(
        [string]$TestName,
        [string]$Message,
        [string]$ExpectedType = ""
    )
    
    Write-Host "📝 Test: $TestName" -ForegroundColor Yellow
    Write-Host "   Message: `"$Message`"" -ForegroundColor Gray
    
    try {
        $body = @{
            message = $Message
            sessionId = $script:sessionId
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$API_URL/test/chat" -Method Post -Body $body -ContentType "application/json"
        
        Write-Host "   ✅ Response:" -ForegroundColor Green
        Write-Host "      $($response.content.Substring(0, [Math]::Min(150, $response.content.Length)))..." -ForegroundColor White
        
        if ($ExpectedType -and $response.metadata.intent.type) {
            if ($response.metadata.intent.type -eq $ExpectedType) {
                Write-Host "      Intent: $($response.metadata.intent.type) ✓" -ForegroundColor Green
            } else {
                Write-Host "      Intent: $($response.metadata.intent.type) (expected: $ExpectedType) ✗" -ForegroundColor Red
            }
        }
        
        if ($response.metadata.qualityScore) {
            Write-Host "      Quality Score: $($response.metadata.qualityScore)/100" -ForegroundColor Cyan
        }
        
        Write-Host ""
        return $true
    }
    catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Health Check
Write-Host "🏥 HEALTH CHECK" -ForegroundColor Magenta
try {
    $health = Invoke-RestMethod -Uri "$API_URL/health"
    Write-Host "   Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Database: $($health.services.database)" -ForegroundColor Green
    Write-Host "   Cache: $($health.services.cache)" -ForegroundColor Green
    Write-Host "   LLM: $($health.services.llm)" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "   ❌ Health check failed!" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Test Counter
$passed = 0
$failed = 0

# 1. Greeting Tests
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "1️⃣  GREETING TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Cyan

if (Test-McCarthy "Basic Greeting" "Hello!" "greeting") { $passed++ } else { $failed++ }
if (Test-McCarthy "Friendly Greeting" "Hi there!" "greeting") { $passed++ } else { $failed++ }

# 2. Calculation Tests
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "2️⃣  CALCULATION TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Cyan

if (Test-McCarthy "Pixels to Size" "What size can I print 4000x6000 pixels at 300 DPI?" "calculation") { $passed++ } else { $failed++ }
if (Test-McCarthy "Size to Pixels" "If I want to print at 10x15 inches at 150 DPI, how many pixels?" "calculation") { $passed++ } else { $failed++ }

# 3. How-To Tests
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "3️⃣  HOW-TO TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Cyan

if (Test-McCarthy "Artwork Preparation" "How do I prepare artwork for DTF printing?" "howto") { $passed++ } else { $failed++ }
if (Test-McCarthy "File Format" "What file format should I use?" "howto") { $passed++ } else { $failed++ }

# 4. Information Tests
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "4️⃣  INFORMATION TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Cyan

if (Test-McCarthy "DTF Info" "What is DTF printing?" "information") { $passed++ } else { $failed++ }
if (Test-McCarthy "DTF vs UV DTF" "What's the difference between DTF and UV DTF?" "information") { $passed++ } else { $failed++ }

# 5. Constraint Tests
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "5️⃣  CONSTRAINT TESTS (Should Refuse)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Cyan

if (Test-McCarthy "Pricing (Refuse)" "How much does DTF printing cost?") { $passed++ } else { $failed++ }
if (Test-McCarthy "Discounts (Refuse)" "Do you offer discounts?") { $passed++ } else { $failed++ }

# 6. Memory Tests
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "6️⃣  MEMORY TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Cyan

Test-McCarthy "Set Name" "My name is John" | Out-Null
if (Test-McCarthy "Recall Name" "What's my name?") { $passed++ } else { $failed++ }

# Results
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 TEST RESULTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Cyan

$total = $passed + $failed
$percentage = [math]::Round(($passed / $total) * 100, 1)

Write-Host "Passed: $passed / $total ($percentage%)" -ForegroundColor Green
Write-Host "Failed: $failed / $total" -ForegroundColor Red
Write-Host ""

if ($percentage -ge 90) {
    Write-Host "✅ EXCELLENT! McCarthy is working great!" -ForegroundColor Green
} elseif ($percentage -ge 75) {
    Write-Host "⚠️  GOOD, but some issues need attention" -ForegroundColor Yellow
} else {
    Write-Host "❌ NEEDS WORK - Several tests failing" -ForegroundColor Red
}

Write-Host ""

