@echo off
REM Comprehensive McCarthy Artwork Agent Test Runner (Windows)

echo.
echo 🎨 MCCARTHY ARTWORK AGENT - COMPREHENSIVE TEST SUITE
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📋 Test Coverage:
echo   • 50+ Intent Detection tests
echo   • 100+ DPI Calculation tests
echo   • 30+ Personality ^& Tone tests
echo   • 20+ Context ^& Memory tests
echo   • 15+ Constraint Enforcement tests
echo   • 20+ Error Handling tests
echo   • 15+ Response Quality tests
echo   • 10+ Integration tests
echo.
echo 🎯 Total: 260+ comprehensive tests
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Check if OPENAI_API_KEY is set
if "%OPENAI_API_KEY%"=="" (
    echo ⚠️  WARNING: OPENAI_API_KEY not set
    echo    Some tests may fail without a valid API key
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
)

REM Run tests
echo 🚀 Starting test suite...
echo.

cd /d "%~dp0"
call npm test -- comprehensive-agent-test.ts --reporter=verbose

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo ✅ ALL TESTS PASSED!
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo 🎉 McCarthy Artwork Agent is fully functional!
    echo.
) else (
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo ❌ SOME TESTS FAILED
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo Please review the failures above and fix any issues.
    echo.
    exit /b 1
)

