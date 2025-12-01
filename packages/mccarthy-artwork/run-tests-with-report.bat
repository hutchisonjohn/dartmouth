@echo off
REM Run comprehensive tests and save results to file

echo.
echo 🎨 MCCARTHY ARTWORK AGENT - COMPREHENSIVE TEST SUITE
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Running 150+ comprehensive tests...
echo Results will be saved to: test-results.txt
echo.

REM Set API key from environment variable
REM set OPENAI_API_KEY=your-api-key-here

REM Run tests and save output
call npm test tests/comprehensive-agent-test.test.ts > test-results.txt 2>&1

REM Check if tests passed
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo ✅ ALL TESTS PASSED!
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo Results saved to: test-results.txt
    echo.
) else (
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo ❌ SOME TESTS FAILED
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo Results saved to: test-results.txt
    echo Please review the failures in the file.
    echo.
)

REM Display the results file
type test-results.txt

pause


