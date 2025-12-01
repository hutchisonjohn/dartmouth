#!/bin/bash

# Comprehensive McCarthy Artwork Agent Test Runner
# 
# This script runs 260+ tests covering every aspect of the agent:
# - Intent detection
# - DPI calculations
# - Personality & tone
# - Context retention
# - Constraint enforcement
# - Error handling
# - Response quality
# - Integration tests

echo "🎨 MCCARTHY ARTWORK AGENT - COMPREHENSIVE TEST SUITE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Test Coverage:"
echo "  • 50+ Intent Detection tests"
echo "  • 100+ DPI Calculation tests"
echo "  • 30+ Personality & Tone tests"
echo "  • 20+ Context & Memory tests"
echo "  • 15+ Constraint Enforcement tests"
echo "  • 20+ Error Handling tests"
echo "  • 15+ Response Quality tests"
echo "  • 10+ Integration tests"
echo ""
echo "🎯 Total: 260+ comprehensive tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  WARNING: OPENAI_API_KEY not set"
    echo "   Some tests may fail without a valid API key"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run tests
echo "🚀 Starting test suite..."
echo ""

cd "$(dirname "$0")"
npm test -- comprehensive-agent-test.ts --reporter=verbose

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ ALL TESTS PASSED!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🎉 McCarthy Artwork Agent is fully functional!"
    echo ""
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ SOME TESTS FAILED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Please review the failures above and fix any issues."
    echo ""
    exit 1
fi

