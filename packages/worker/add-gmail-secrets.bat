@echo off
echo ========================================
echo   Gmail Secrets Setup for Cloudflare
echo ========================================
echo.
echo This will add 3 secrets one at a time.
echo Press Ctrl+C to cancel at any time.
echo.
pause

echo.
echo ========================================
echo   Step 1 of 3: GMAIL_CLIENT_ID
echo ========================================
echo.
echo Paste your Client ID when prompted:
echo Example: 726965954328-dl08aaledijbsrspaghpf44hki60qv1c.apps.googleusercontent.com
echo.
npx wrangler secret put GMAIL_CLIENT_ID

echo.
echo ========================================
echo   Step 2 of 3: GMAIL_CLIENT_SECRET
echo ========================================
echo.
echo Paste your Client Secret when prompted:
echo Example: GOCSPX-xxxxxxxxxxxxxxxxxxxxx
echo.
npx wrangler secret put GMAIL_CLIENT_SECRET

echo.
echo ========================================
echo   Step 3 of 3: GMAIL_REFRESH_TOKEN
echo ========================================
echo.
echo Paste your Refresh Token when prompted:
echo Example: 1//0gXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
echo.
npx wrangler secret put GMAIL_REFRESH_TOKEN

echo.
echo ========================================
echo   ALL DONE!
echo ========================================
echo.
echo Next: Update wrangler.toml and deploy
echo.
pause

