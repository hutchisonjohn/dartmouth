# Dartmouth OS Reorganization Script
# Run from project root

Write-Host "Starting Dartmouth OS Reorganization..." -ForegroundColor Green
Write-Host ""

# Create new folder structure
Write-Host "Creating folder structure..." -ForegroundColor Cyan
$folders = @(
    "docs\archive\agent-army-system",
    "docs\dartmouth-os\v1",
    "docs\dartmouth-os\v2",
    "docs\dartmouth-os\guides",
    "docs\dartmouth-os\api-reference",
    "docs\agents\fam",
    "docs\agents\mccarthy-pa\v7",
    "docs\agents\mccarthy-pa\v8",
    "docs\agents\mccarthy-pa\guides",
    "docs\agents\mccarthy-pa\rag-docs",
    "docs\agents\mccarthy-artwork\ui",
    "docs\agents\mccarthy-customersupport\integrations",
    "docs\agents\mccarthy-customersupport\ui",
    "docs\agents\future-agents",
    "docs\projects\perfectprint-ai\architecture",
    "docs\projects\adfusion-ai\agents",
    "docs\integration",
    "docs\ui-design\examples"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
    Write-Host "Created: $folder" -ForegroundColor Green
}

Write-Host ""
Write-Host "Moving Dartmouth OS v1.0 docs..." -ForegroundColor Cyan

$v1Docs = @(
    "DARTMOUTH_OS_COMPLETE_SPECIFICATION.md",
    "DARTMOUTH_API_DOCUMENTATION.md",
    "DARTMOUTH_LEAN_MVP_TECH_STACK.md",
    "COST_OPTIMIZATION_GUIDE.md",
    "ARCHITECTURE_DIAGRAMS.md",
    "COMPREHENSIVE_DOCUMENTATION_SUMMARY.md"
)

foreach ($doc in $v1Docs) {
    if (Test-Path $doc) {
        Move-Item $doc "docs\dartmouth-os\v1\" -Force
        Write-Host "Moved: $doc" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Moving FAM docs..." -ForegroundColor Cyan

$famDocs = @(
    "FAM_COMPLETE_SPECIFICATION.md",
    "FAM_TESTING_GUIDE.md",
    "FOUNDATIONAL_AGENT_TEST_PLAN.md"
)

foreach ($doc in $famDocs) {
    if (Test-Path $doc) {
        Move-Item $doc "docs\agents\fam\" -Force
        Write-Host "Moved: $doc" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Moving Artwork Analyzer docs..." -ForegroundColor Cyan

$artworkDocs = @(
    "MCCARTHY_MANUAL_TEST_PLAN.md"
)

foreach ($doc in $artworkDocs) {
    if (Test-Path $doc) {
        Move-Item $doc "docs\agents\mccarthy-artwork\" -Force
        Write-Host "Moved: $doc" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Archiving old docs..." -ForegroundColor Gray

$archiveDocs = @(
    "DARTMOUTH_BLUEPRINT.md",
    "PROJECT_STATUS_NOV19_2024.md",
    "WHATS_NEXT.md",
    "AGENT_ARMY_ROADMAP.md",
    "SYSTEM_PROMPT_CONFIGURATION.md",
    "BUILD_PLAN.md",
    "CRITICAL_BUGS_FIXED.md",
    "DEPLOYMENT_SUMMARY.md",
    "FOUNDATION_TESTING_SUMMARY.md",
    "QUICK_TEST_GUIDE.md",
    "ARTWORK_ANALYZER_REQUIREMENTS.md",
    "CRITICAL_ANALYSIS_VOICE_AGENTS_AND_EXISTING_PROJECTS.md"
)

foreach ($doc in $archiveDocs) {
    if (Test-Path $doc) {
        Move-Item $doc "docs\archive\agent-army-system\" -Force
        Write-Host "Archived: $doc" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Reorganization complete!" -ForegroundColor Green
Write-Host "Documentation is now in docs folder" -ForegroundColor Cyan
Write-Host "Next: Run git add and git commit" -ForegroundColor Yellow
