# Cloudflare Worker Logs Viewer
# Usage: .\view-logs.ps1 [options]
#
# Options:
#   -Live       : Stream live logs (press Ctrl+C to stop)
#   -Recent     : Show recent logs (last 10 minutes)
#   -Filter     : Filter logs by text (e.g., -Filter "error")
#   -Help       : Show this help message

param(
    [switch]$Live,
    [switch]$Recent,
    [string]$Filter = "",
    [switch]$Help
)

$WorkerName = "dartmouth-os-worker"

if ($Help) {
    Write-Host ""
    Write-Host "Cloudflare Worker Logs Viewer" -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\view-logs.ps1 -Live          # Stream live logs"
    Write-Host "  .\view-logs.ps1 -Recent        # Show recent logs"
    Write-Host "  .\view-logs.ps1 -Filter error  # Filter by text"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\view-logs.ps1 -Live                    # Watch logs in real-time"
    Write-Host "  .\view-logs.ps1 -Recent                  # View last 10 minutes"
    Write-Host "  .\view-logs.ps1 -Recent -Filter sRGB    # Find sRGB-related logs"
    Write-Host ""
    Write-Host "Tips:" -ForegroundColor Yellow
    Write-Host "  - Press Ctrl+C to stop live streaming"
    Write-Host "  - Live logs expire after 1 hour"
    Write-Host "  - Logs are not stored by default in Cloudflare"
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "Cloudflare Worker Logs" -ForegroundColor Cyan
Write-Host "Worker: $WorkerName" -ForegroundColor Gray
Write-Host ""

if ($Live) {
    Write-Host "Streaming live logs... (Press Ctrl+C to stop)" -ForegroundColor Yellow
    Write-Host ""
    
    if ($Filter) {
        Write-Host "Filter: $Filter" -ForegroundColor Gray
        Write-Host ""
        npx wrangler tail $WorkerName --format pretty | Select-String -Pattern $Filter
    } else {
        npx wrangler tail $WorkerName --format pretty
    }
}
elseif ($Recent) {
    Write-Host "⚠️  Note: Cloudflare doesn't store logs by default." -ForegroundColor Yellow
    Write-Host "Recent logs are only available if the worker was recently active." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Starting log tail (will show any new logs)..." -ForegroundColor Gray
    Write-Host "Make a test request to see logs appear." -ForegroundColor Gray
    Write-Host ""
    
    if ($Filter) {
        Write-Host "Filter: $Filter" -ForegroundColor Gray
        Write-Host ""
        # Tail for 60 seconds then stop
        $job = Start-Job -ScriptBlock {
            param($worker, $filter)
            npx wrangler tail $worker --format pretty | Select-String -Pattern $filter
        } -ArgumentList $WorkerName, $Filter
        
        Start-Sleep -Seconds 60
        Stop-Job $job
        Receive-Job $job
        Remove-Job $job
    } else {
        # Tail for 60 seconds then stop
        $job = Start-Job -ScriptBlock {
            param($worker)
            npx wrangler tail $worker --format pretty
        } -ArgumentList $WorkerName
        
        Start-Sleep -Seconds 60
        Stop-Job $job
        Receive-Job $job
        Remove-Job $job
    }
}
else {
    Write-Host "Please specify an option:" -ForegroundColor Red
    Write-Host "  -Live    : Stream live logs"
    Write-Host "  -Recent  : Show recent logs"
    Write-Host "  -Help    : Show help"
    Write-Host ""
    Write-Host "Example: .\view-logs.ps1 -Live" -ForegroundColor Gray
    Write-Host ""
}

