# Gmail Secrets Setup Script for Cloudflare Workers
# Run this script to add Gmail OAuth credentials as Wrangler secrets

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Gmail Secrets Setup for Cloudflare" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "wrangler.toml")) {
    Write-Host "ERROR: wrangler.toml not found!" -ForegroundColor Red
    Write-Host "Please run this script from the packages/worker directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "This script will add 3 Gmail secrets to your Cloudflare Worker:" -ForegroundColor Green
Write-Host "  1. GMAIL_CLIENT_ID" -ForegroundColor White
Write-Host "  2. GMAIL_CLIENT_SECRET" -ForegroundColor White
Write-Host "  3. GMAIL_REFRESH_TOKEN" -ForegroundColor White
Write-Host ""

# Get Gmail Client ID
Write-Host "Enter your Gmail Client ID:" -ForegroundColor Yellow
Write-Host "(Example: 726965954328-dl08aaledijbsrspaghpf44hki60qv1c.apps.googleusercontent.com)" -ForegroundColor Gray
$GMAIL_CLIENT_ID = Read-Host "Client ID"

if ([string]::IsNullOrWhiteSpace($GMAIL_CLIENT_ID)) {
    Write-Host "ERROR: Client ID cannot be empty!" -ForegroundColor Red
    exit 1
}

# Get Gmail Client Secret
Write-Host ""
Write-Host "Enter your Gmail Client Secret:" -ForegroundColor Yellow
Write-Host "(Example: GOCSPX-xxxxxxxxxxxxxxxxxxxxx)" -ForegroundColor Gray
$GMAIL_CLIENT_SECRET = Read-Host "Client Secret" -AsSecureString
$GMAIL_CLIENT_SECRET_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($GMAIL_CLIENT_SECRET))

if ([string]::IsNullOrWhiteSpace($GMAIL_CLIENT_SECRET_Plain)) {
    Write-Host "ERROR: Client Secret cannot be empty!" -ForegroundColor Red
    exit 1
}

# Get Gmail Refresh Token
Write-Host ""
Write-Host "Enter your Gmail Refresh Token:" -ForegroundColor Yellow
Write-Host "(Example: 1//0gXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX)" -ForegroundColor Gray
$GMAIL_REFRESH_TOKEN = Read-Host "Refresh Token" -AsSecureString
$GMAIL_REFRESH_TOKEN_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($GMAIL_REFRESH_TOKEN))

if ([string]::IsNullOrWhiteSpace($GMAIL_REFRESH_TOKEN_Plain)) {
    Write-Host "ERROR: Refresh Token cannot be empty!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Adding secrets to Cloudflare..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Add secrets using wrangler
Write-Host "Adding GMAIL_CLIENT_ID..." -ForegroundColor Yellow
$GMAIL_CLIENT_ID | npx wrangler secret put GMAIL_CLIENT_ID

Write-Host "Adding GMAIL_CLIENT_SECRET..." -ForegroundColor Yellow
$GMAIL_CLIENT_SECRET_Plain | npx wrangler secret put GMAIL_CLIENT_SECRET

Write-Host "Adding GMAIL_REFRESH_TOKEN..." -ForegroundColor Yellow
$GMAIL_REFRESH_TOKEN_Plain | npx wrangler secret put GMAIL_REFRESH_TOKEN

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ All Gmail secrets added!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Update wrangler.toml with GMAIL_REDIRECT_URI" -ForegroundColor White
Write-Host "  2. Deploy your worker: npx wrangler deploy" -ForegroundColor White
Write-Host "  3. Test email polling" -ForegroundColor White
Write-Host ""

