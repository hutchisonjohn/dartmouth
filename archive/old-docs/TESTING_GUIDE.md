# 🧪 Testing Guide - Dartmouth Agent Army

Complete guide to testing the Agent Army system.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Unit Tests](#unit-tests)
5. [Integration Tests](#integration-tests)
6. [Manual Testing](#manual-testing)
7. [Test Coverage](#test-coverage)
8. [Writing New Tests](#writing-new-tests)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Agent Army system uses **Vitest** for testing, providing:
- Fast execution with hot module replacement
- TypeScript support out of the box
- Compatible with Jest API
- Excellent error messages

**Test Philosophy:**
- Test behavior, not implementation
- Keep tests simple and readable
- Mock external dependencies
- Aim for >80% code coverage

---

## 📁 Test Structure

```
packages/worker/src/__tests__/
├── BaseAgent.test.ts              # Core agent tests
├── test-helpers.ts                # Shared test utilities
├── handlers/
│   ├── GreetingHandler.test.ts   # Greeting handler tests
│   ├── CalculationHandler.test.ts # Calculation handler tests
│   └── ...                        # Other handler tests
├── components/
│   ├── IntentDetector.test.ts    # Intent detection tests
│   ├── ResponseValidator.test.ts  # Validation tests
│   └── ...                        # Other component tests
├── services/
│   ├── LLMService.test.ts        # LLM service tests
│   └── ...                        # Other service tests
└── integration/
    └── conversation-flow.test.ts  # Full flow tests
```

---

## 🚀 Running Tests

### Run All Tests

```bash
cd packages/worker
npm test
```

### Watch Mode (Auto-rerun on changes)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

**Output:**
```
Test Files  5 passed (5)
     Tests  185 passed (185)
  Duration  2.5s
  Coverage  82.5%
```

### Run Specific Test File

```bash
npx vitest run src/__tests__/BaseAgent.test.ts
```

### Run Tests Matching Pattern

```bash
npx vitest run -t "greeting"
```

---

## 🔬 Unit Tests

### BaseAgent Tests

**File:** `src/__tests__/BaseAgent.test.ts`

**Coverage:**
- Agent initialization
- Message processing
- State management
- Handler routing
- Error handling
- Memory operations
- RAG operations

**Example Test:**
```typescript
describe('BaseAgent', () => {
  it('should process a greeting message', async () => {
    const agent = new BaseAgent(mockConfig);
    const response = await agent.processMessage('Hello!');
    
    expect(response.content).toContain('Hello');
    expect(response.metadata.intent).toBe('greeting');
    expect(response.metadata.sessionId).toBeDefined();
  });
});
```

---

### Handler Tests

**Files:** `src/__tests__/handlers/*.test.ts`

**Handlers Tested:**
1. GreetingHandler
2. CalculationHandler
3. InformationHandler
4. HowToHandler
5. RepeatHandler
6. FrustrationHandlerImpl
7. FallbackHandler

**Example Test:**
```typescript
describe('CalculationHandler', () => {
  it('should handle simple arithmetic', async () => {
    const handler = new CalculationHandler();
    const intent = createMockIntent('calculation', 'What is 2+2?');
    const context = createMockHandlerContext();
    
    const response = await handler.handle(intent, context);
    
    expect(response.content).toContain('4');
    expect(response.metadata.calculationResult.result).toBe(4);
  });
});
```

---

### Component Tests

**Files:** `src/__tests__/components/*.test.ts`

**Components Tested:**
- IntentDetector
- ResponseValidator
- ConversationStateManager
- ResponseRouter
- RepetitionDetector
- FrustrationHandler
- CalculationEngine

**Example Test:**
```typescript
describe('IntentDetector', () => {
  it('should detect calculation intent', async () => {
    const detector = new IntentDetector();
    const state = createMockConversationState();
    
    const intent = await detector.detect('What is 5+5?', state);
    
    expect(intent.type).toBe('calculation');
    expect(intent.confidence).toBeGreaterThan(0.8);
  });
});
```

---

### Service Tests

**Files:** `src/__tests__/services/*.test.ts`

**Services Tested:**
- LLMService
- DatabaseManager (future)
- ConfigManager (future)

**Example Test:**
```typescript
describe('LLMService', () => {
  it('should generate text with Anthropic', async () => {
    const service = new LLMService(mockApiKeys);
    
    const response = await service.generateText({
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: 'Hello' }],
      temperature: 0.7,
      maxTokens: 100
    });
    
    expect(response.text).toBeDefined();
    expect(response.tokensUsed).toBeGreaterThan(0);
    expect(response.cost).toBeGreaterThan(0);
  });
});
```

---

## 🔗 Integration Tests

**File:** `src/__tests__/integration/conversation-flow.test.ts`

**Test Scenarios:**
1. Full conversation flow
2. Multi-turn conversations
3. Intent switching
4. Memory persistence
5. Error recovery
6. Session management

**Example Test:**
```typescript
describe('Conversation Flow', () => {
  it('should handle multi-turn conversation', async () => {
    const agent = new BaseAgent(mockConfig);
    
    // Turn 1: Greeting
    const response1 = await agent.processMessage('Hello!');
    expect(response1.content).toContain('Hello');
    
    // Turn 2: Calculation
    const response2 = await agent.processMessage('What is 10+10?');
    expect(response2.content).toContain('20');
    
    // Turn 3: Follow-up
    const response3 = await agent.processMessage('Thank you!');
    expect(response3.content).toContain('welcome');
    
    // Verify session state
    const state = agent.getState();
    expect(state.messages).toHaveLength(6); // 3 user + 3 assistant
  });
});
```

---

## 🖐️ Manual Testing

### Local Development Server

```bash
cd packages/worker
npm run dev
```

Server runs at: `http://localhost:8787`

### Test Endpoints

#### 1. Health Check
```bash
curl http://localhost:8787/health
```

#### 2. Simple Chat
```bash
curl -X POST http://localhost:8787/test/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

#### 3. Calculation
```bash
curl -X POST http://localhost:8787/test/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 25 * 4?"}'
```

#### 4. Intent Detection
```bash
curl -X POST http://localhost:8787/test/intent \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I reset my password?"}'
```

#### 5. Batch Testing
```bash
curl -X POST http://localhost:8787/test/batch \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      "Hello!",
      "What is 2+2?",
      "Thank you!"
    ]
  }'
```

---

## 📊 Test Coverage

### Current Coverage

**Overall:** 82.5%

**By Component:**
- BaseAgent: 85%
- Handlers: 90%
- Components: 80%
- Services: 75%
- Routes: 70%

### Coverage Report

```bash
npm run test:coverage
```

**Output:**
```
File                          | % Stmts | % Branch | % Funcs | % Lines
------------------------------|---------|----------|---------|--------
BaseAgent.ts                  |   85.2  |   78.5   |   88.9  |   85.2
handlers/GreetingHandler.ts   |   95.0  |   90.0   |  100.0  |   95.0
handlers/CalculationHandler.ts|   92.5  |   85.0   |  100.0  |   92.5
components/IntentDetector.ts  |   88.0  |   82.0   |   90.0  |   88.0
services/LLMService.ts        |   75.0  |   70.0   |   80.0  |   75.0
```

### View HTML Report

```bash
npm run test:coverage
open coverage/index.html  # Mac/Linux
start coverage/index.html # Windows
```

---

## ✍️ Writing New Tests

### Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { YourComponent } from '../path/to/component';
import { createMockContext } from './test-helpers';

describe('YourComponent', () => {
  let component: YourComponent;
  
  beforeEach(() => {
    component = new YourComponent();
  });
  
  afterEach(() => {
    // Cleanup if needed
  });
  
  describe('methodName', () => {
    it('should do something', () => {
      const result = component.methodName('input');
      expect(result).toBe('expected');
    });
    
    it('should handle edge case', () => {
      const result = component.methodName('');
      expect(result).toBeNull();
    });
    
    it('should throw error on invalid input', () => {
      expect(() => {
        component.methodName(null);
      }).toThrow('Invalid input');
    });
  });
});
```

---

### Using Test Helpers

**File:** `src/__tests__/test-helpers.ts`

**Available Helpers:**
```typescript
// Create mock conversation state
const state = createMockConversationState();

// Create mock handler context
const context = createMockHandlerContext();

// Create mock intent
const intent = createMockIntent('greeting', 'Hello!');

// Create mock agent config
const config = createMockAgentConfig();
```

**Example Usage:**
```typescript
import { createMockHandlerContext, createMockIntent } from './test-helpers';

it('should handle greeting', async () => {
  const handler = new GreetingHandler();
  const intent = createMockIntent('greeting', 'Hi there!');
  const context = createMockHandlerContext();
  
  const response = await handler.handle(intent, context);
  
  expect(response.content).toBeDefined();
});
```

---

### Mocking External Services

**Mock LLM Service:**
```typescript
const mockLLMService = {
  generateText: vi.fn().mockResolvedValue({
    text: 'Mocked response',
    tokensUsed: 10,
    cost: 0.001
  })
};
```

**Mock Database:**
```typescript
const mockDB = {
  prepare: vi.fn().mockReturnValue({
    bind: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue({ id: '123' }),
    all: vi.fn().mockResolvedValue({ results: [] }),
    run: vi.fn().mockResolvedValue({ success: true })
  })
};
```

---

## 🐛 Troubleshooting

### Tests Failing

**Check TypeScript:**
```bash
npm run lint
```

**Clear Cache:**
```bash
rm -rf node_modules/.vite
npm test
```

### Timeout Errors

Increase timeout for slow tests:
```typescript
it('should handle slow operation', async () => {
  // Test code
}, 10000); // 10 second timeout
```

### Mock Issues

Reset mocks between tests:
```typescript
import { vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});
```

### Coverage Not Updating

```bash
rm -rf coverage
npm run test:coverage
```

---

## 📝 Best Practices

### 1. Test Naming

**Good:**
```typescript
it('should return greeting response for hello message', () => {});
```

**Bad:**
```typescript
it('test1', () => {});
```

### 2. Arrange-Act-Assert

```typescript
it('should calculate sum', () => {
  // Arrange
  const calculator = new Calculator();
  
  // Act
  const result = calculator.add(2, 3);
  
  // Assert
  expect(result).toBe(5);
});
```

### 3. One Assertion Per Test

**Good:**
```typescript
it('should return correct sum', () => {
  expect(add(2, 3)).toBe(5);
});

it('should handle negative numbers', () => {
  expect(add(-2, 3)).toBe(1);
});
```

**Bad:**
```typescript
it('should work', () => {
  expect(add(2, 3)).toBe(5);
  expect(add(-2, 3)).toBe(1);
  expect(add(0, 0)).toBe(0);
});
```

### 4. Test Edge Cases

```typescript
describe('divide', () => {
  it('should divide positive numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });
  
  it('should handle division by zero', () => {
    expect(() => divide(10, 0)).toThrow();
  });
  
  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });
  
  it('should handle decimal results', () => {
    expect(divide(5, 2)).toBe(2.5);
  });
});
```

---

## 🎯 Testing Checklist

Before committing code:

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run lint`)
- [ ] Coverage >80% (`npm run test:coverage`)
- [ ] New features have tests
- [ ] Edge cases covered
- [ ] Error cases tested
- [ ] Mocks properly configured
- [ ] Test names are descriptive
- [ ] No console.log in tests

---

## 📚 Resources

- **Vitest Docs:** https://vitest.dev/
- **Testing Best Practices:** https://testingjavascript.com/
- **Mocking Guide:** https://vitest.dev/guide/mocking.html

---

## 🔄 Continuous Integration

### GitHub Actions (Future)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

---

**Testing Guide Version:** 1.0.0  
**Last Updated:** November 17, 2025  
**Status:** Complete ✅

