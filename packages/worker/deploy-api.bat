@echo off
echo Installing dependencies...
call npm install

echo.
echo Setting JWT_SECRET...
echo dartmouth-os-jwt-secret-2025 | npx wrangler secret put JWT_SECRET

echo.
echo Deploying worker...
call npx wrangler deploy

echo.
echo Done! Worker deployed.
echo Test login: curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"john@dtf.com.au\",\"password\":\"changeme123\"}"


