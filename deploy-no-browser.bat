@echo off
REM Deploy without opening browser windows
cd packages\worker

REM Set environment variable to prevent browser opening
set BROWSER=none
set NO_BROWSER=1
set WRANGLER_NO_BROWSER=1

echo Deploying worker...
npx wrangler deploy --no-bundle

echo Done!

