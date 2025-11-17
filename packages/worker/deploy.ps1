# ============================================================================
# Dartmouth Agent Army - Deployment Script (PowerShell)
# ============================================================================
# This script automates the deployment process to Cloudflare Workers
# Run from packages/worker directory: .\deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Dartmouth Agent Army - Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "wrangler.toml")) {
    Write-Host "❌ Error: wrangler.toml not found" -ForegroundColor Red
    Write-Host "Please run this script from packages/worker directory"
    exit 1
}

# Step 1: Check authentication
Write-Host "Step 1: Checking Cloudflare authentication..." -ForegroundColor Blue
try {
    $whoami = npx wrangler whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Already authenticated" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Not authenticated. Running login..." -ForegroundColor Yellow
        npx wrangler login
    }
} catch {
    Write-Host "⚠️  Not authenticated. Running login..." -ForegroundColor Yellow
    npx wrangler login
}
Write-Host ""

# Step 2: TypeScript check
Write-Host "Step 2: Running TypeScript check..." -ForegroundColor Blue
try {
    $null = npm run lint 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ TypeScript check passed" -ForegroundColor Green
    } else {
        Write-Host "❌ TypeScript errors found. Please fix before deploying." -ForegroundColor Red
        npm run lint
        exit 1
    }
} catch {
    Write-Host "❌ TypeScript errors found. Please fix before deploying." -ForegroundColor Red
    npm run lint
    exit 1
}
Write-Host ""

# Step 3: Check if database exists
Write-Host "Step 3: Checking D1 database..." -ForegroundColor Blue
$dbList = npx wrangler d1 list 2>&1 | Out-String
if ($dbList -match "agent-army-db") {
    Write-Host "✅ Database exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database not found. Please create it first:" -ForegroundColor Yellow
    Write-Host "   npx wrangler d1 create agent-army-db"
    Write-Host "   Then update database_id in wrangler.toml"
    exit 1
}
Write-Host ""

# Step 4: Check database_id in wrangler.toml
Write-Host "Step 4: Checking database configuration..." -ForegroundColor Blue
$wranglerContent = Get-Content "wrangler.toml" -Raw
if ($wranglerContent -match 'database_id = ""') {
    Write-Host "❌ database_id not set in wrangler.toml" -ForegroundColor Red
    Write-Host "Please update database_id with the value from 'npx wrangler d1 list'"
    exit 1
} else {
    Write-Host "✅ Database configured" -ForegroundColor Green
}
Write-Host ""

# Step 5: Check KV namespaces
Write-Host "Step 5: Checking KV namespaces..." -ForegroundColor Blue
if ($wranglerContent -match 'id = ""') {
    Write-Host "⚠️  KV namespace IDs not set in wrangler.toml" -ForegroundColor Yellow
    Write-Host "Please create namespaces and update IDs:"
    Write-Host "   npx wrangler kv:namespace create APP_CONFIG"
    Write-Host "   npx wrangler kv:namespace create CACHE"
    exit 1
} else {
    Write-Host "✅ KV namespaces configured" -ForegroundColor Green
}
Write-Host ""

# Step 6: Check secrets
Write-Host "Step 6: Checking secrets..." -ForegroundColor Blue
try {
    $secretList = npx wrangler secret list 2>&1 | Out-String
    $secretCount = ([regex]::Matches($secretList, "ANTHROPIC_API_KEY|OPENAI_API_KEY|GOOGLE_API_KEY")).Count
    if ($secretCount -lt 1) {
        Write-Host "⚠️  API key secrets not set" -ForegroundColor Yellow
        Write-Host "Please set at least one API key:"
        Write-Host "   npx wrangler secret put ANTHROPIC_API_KEY"
        Write-Host "   npx wrangler secret put OPENAI_API_KEY"
        Write-Host "   npx wrangler secret put GOOGLE_API_KEY"
        $response = Read-Host "Continue anyway? (y/n)"
        if ($response -ne "y" -and $response -ne "Y") {
            exit 1
        }
    } else {
        Write-Host "✅ Secrets configured" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not check secrets" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Deploy
Write-Host "Step 7: Deploying to Cloudflare Workers..." -ForegroundColor Blue
npx wrangler deploy
Write-Host ""

# Step 8: Get worker URL
Write-Host "Step 8: Getting worker URL..." -ForegroundColor Blue
try {
    $deployments = npx wrangler deployments list 2>&1 | Out-String
    if ($deployments -match "(https://[^\s]+)") {
        $workerUrl = $matches[1]
        Write-Host "✅ Worker deployed at: $workerUrl" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Could not determine worker URL" -ForegroundColor Yellow
        Write-Host "Check Cloudflare dashboard for your worker URL"
        $workerUrl = $null
    }
} catch {
    Write-Host "⚠️  Could not determine worker URL" -ForegroundColor Yellow
    $workerUrl = $null
}
Write-Host ""

# Step 9: Test deployment
Write-Host "Step 9: Testing deployment..." -ForegroundColor Blue
if ($workerUrl) {
    Write-Host "Testing health endpoint..."
    try {
        $response = Invoke-WebRequest -Uri "$workerUrl/health" -UseBasicParsing
        if ($response.Content -match "healthy") {
            Write-Host "✅ Health check passed" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Health check failed or returned unexpected response" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Health check failed: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Skipping health check (no worker URL)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Test your endpoints:"
if ($workerUrl) {
    Write-Host "   curl $workerUrl/health"
    Write-Host "   curl $workerUrl/"
    Write-Host "   curl -X POST $workerUrl/test/chat -H 'Content-Type: application/json' -d '{`"message`":`"Hello!`"}'"
}
Write-Host ""
Write-Host "2. Monitor logs:"
Write-Host "   npx wrangler tail"
Write-Host ""
Write-Host "3. View dashboard:"
Write-Host "   https://dash.cloudflare.com/"
Write-Host ""
Write-Host "✨ Happy deploying!" -ForegroundColor Green

