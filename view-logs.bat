@echo off
REM Cloudflare Worker Logs Viewer (Simple Version)
REM Usage: view-logs.bat

echo.
echo Cloudflare Worker Logs - Live Stream
echo ====================================
echo.
echo Worker: dartmouth-os-worker
echo Press Ctrl+C to stop
echo.

cd packages\worker
npx wrangler tail dartmouth-os-worker --format pretty

