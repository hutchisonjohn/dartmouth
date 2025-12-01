# Automated Testing for McCarthy Artwork Agent

## Overview

This directory contains automated testing scripts for the McCarthy Artwork Agent deployed on Dartmouth OS.

## Test Scripts

### `test-mccarthy-agent.js`

Comprehensive automated test suite that tests all categories of the McCarthy Artwork Agent.

**Features:**
- 40+ automated tests across 8 categories
- Colored terminal output for easy reading
- Detailed failure reporting
- Production readiness assessment
- Context retention testing
- Edge case handling

**Categories Tested:**
1. Greeting & Basic Interaction (3 tests)
2. DPI Calculations (5 tests)
3. DTF Questions with RAG (4 tests)
4. Constraint Testing - CRITICAL (5 tests)
5. Conversation Flow (4 tests)
6. Edge Cases (4 tests)
7. UV DTF Specific (3 tests)
8. Response Quality (4 tests)

## Usage

### Run All Tests

```bash
cd packages/worker
node scripts/test-mccarthy-agent.js
```

### Run Specific Category

```bash
# Run only Category 4 (Constraints)
node scripts/test-mccarthy-agent.js --category=4

# Run only Category 2 (DPI Calculations)
node scripts/test-mccarthy-agent.js --category=2
```

### Verbose Mode

```bash
# Show request/response details
node scripts/test-mccarthy-agent.js --verbose

# Combine with category filter
node scripts/test-mccarthy-agent.js --category=4 --verbose
```

## Test Results Interpretation

### Pass Rates

- **95-100%**: ✅ EXCELLENT - Production ready
- **85-94%**: ✅ GOOD - Minor issues only
- **75-84%**: ⚠️ FAIR - Some issues need fixing
- **<75%**: ❌ NOT ACCEPTABLE - Major fixes required

### Exit Codes

- `0`: Tests passed (≥85% pass rate)
- `1`: Tests failed (<85% pass rate)

## Test Data

The script uses a simulated artwork file with these properties:

```javascript
{
  width: 2811,
  height: 2539,
  dpi: 300,
  colorMode: 'RGB',
  hasTransparency: true,
  fileSize: 10870000, // ~10.37 MB
  format: 'PNG',
  iccProfile: null
}
```

This matches the test artwork used in manual testing.

## Critical Tests

### Category 4: Constraint Testing

These tests are **CRITICAL** for production as they verify business rules:

- **4.1**: Pricing questions must be refused
- **4.2**: Discount requests must be refused
- **4.3**: Refund questions must be redirected
- **4.4**: Payment method questions must be redirected
- **4.5**: Order tracking must stay in scope

**All Category 4 tests must pass before production deployment.**

## Example Output

```
╔════════════════════════════════════════════════════════════════╗
║     McCarthy Artwork Agent - Automated Test Suite             ║
╚════════════════════════════════════════════════════════════════╝

Worker URL: https://dartmouth-os-worker.dartmouth.workers.dev
Agent ID: mccarthy-artwork
Test Artwork: 2811x2539 @ 300 DPI

Category 1: Greeting & Basic Interaction
  ✓ 1.1: Basic Greeting
  ✓ 1.2: Help Request
  ✓ 1.3: Casual Greeting

Category 2: DPI Calculations
  ✓ 2.1: Standard DPI at 28.5 cm
  ✓ 2.2: DPI at 30 cm
  ✓ 2.3: Reverse: Size at 300 DPI
  ✓ 2.4: Multiple DPI values
  ✓ 2.5: Low resolution warning

...

════════════════════════════════════════════════════════════════
Test Summary
════════════════════════════════════════════════════════════════
Total Tests:   32
Passed:        30
Failed:        2
Skipped:       0
Pass Rate:     93.8%
Duration:      45.3s

Production Readiness Assessment:
✓ GOOD - Minor issues only
```

## Continuous Integration

This script can be integrated into CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Test McCarthy Agent
  run: |
    cd packages/worker
    node scripts/test-mccarthy-agent.js
```

## Troubleshooting

### Connection Errors

If you get connection errors:
1. Check that the worker is deployed: `https://dartmouth-os-worker.dartmouth.workers.dev/health`
2. Verify your internet connection
3. Check Cloudflare status

### All Tests Failing

If all tests fail:
1. Check worker logs: `npx wrangler tail dartmouth-os-worker`
2. Verify the agent is registered: `curl https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/agents`
3. Test manually: `curl -X POST https://dartmouth-os-worker.dartmouth.workers.dev/api/v2/chat -H "Content-Type: application/json" -d '{"agentId":"mccarthy-artwork","message":"hello","sessionId":"test","userId":"test"}'`

### Specific Test Failures

Use verbose mode to see detailed request/response:

```bash
node scripts/test-mccarthy-agent.js --category=4 --verbose
```

## Adding New Tests

To add new tests, edit `test-mccarthy-agent.js`:

1. Add a new test category function (e.g., `testCategory9()`)
2. Use the `runTest()` helper function
3. Provide a validator function that returns `{ pass, expected, actual }`
4. Call your category function in `runAllTests()`

Example:

```javascript
async function testCategory9() {
  console.log(`\n${colors.cyan}${colors.bright}Category 9: My New Tests${colors.reset}`);
  
  await runTest(
    '9.1',
    'MyCategory',
    'Test description',
    'test message',
    (result) => {
      const response = result.response;
      const passes = /* your validation logic */;
      return {
        pass: passes,
        expected: 'What you expected',
        actual: 'What you got'
      };
    }
  );
}
```

## Related Scripts

- `load-knowledge-base.js`: Load RAG documents into the agent
- `test-dartmouth.js`: Test core Dartmouth OS functionality
- `verify-health.js`: Check agent health status

## Support

For issues or questions:
1. Check the main project README
2. Review test output and logs
3. Check Cloudflare Worker logs
4. Review `TESTING_STATUS_2025-11-27.md` for known issues

